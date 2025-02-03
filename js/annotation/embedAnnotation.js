import Annotation from './annotation.js';
import { readJsonAsync, getData } from '../utils/utils.js';
import VideoFrameExtractor from '../utils/videoframeextractor.js'
import { renderBox } from '../utils/tutils.js';

import { Tensor, matmul } from '../extern/transformers.min.js';

export default class EmAnnotation extends Annotation {
  section = 'menu-image';
  name = 'embed';
  title = '2.6 Embedding';
  dtype = 'q8';
  task = 'image-feature-extraction';
  model = 'Xenova/vit-base-patch16-224-in21k';
  itype = 'image-corpus';
  pylink = 'https://distantviewing.org/dvscripts/embed.html';
  dataToDownload = {};
  imageSet = [];
  imageUpload = {};
  doneCnt = 0;
  exampleNames = null;

  constructor() {
    super();
    this.setup();
  }

  handleLoad(dt) {
    if (dt.progress.status === 'done') {
      this.doneCnt += 1;
    }
    if (this.doneCnt >= 7) {
      this.handleReady();
      this.afterLoad();
    }
    if (
      dt.progress.status === 'progress' &&
      dt.progress.file === 'onnx/text_model_quantized.onnx'
    ) {
      document.getElementById('file-progress-load').value =
        dt.progress.progress;
    }
  }

  buildOutput() {
    const output = document.getElementById('annotation-output');
    output.innerHTML = '';

    const searchLabel = document.createElement('span');
    const searchResults = document.createElement('div');

    searchLabel.id = 'search-label';
    searchLabel.innerHTML =
      '<strong>Click any number under one of the images to resort:</strong>';
    searchLabel.classList = 'pb-3';
    searchLabel.style.display = 'none';

    searchResults.id = 'inner-container-search';
    searchResults.className =
      'media is-flex is-flex-wrap-wrap is-justify-content-center';

    output.appendChild(searchLabel);
    output.appendChild(searchResults);
  }

  startWorkers() {
    this.doneCnt = 0;

    if (this.worker !== null) {
      this.worker.terminate();
    }

    this.worker = new Worker(
      new URL('../workers/workerZeroshot.js', import.meta.url),
      {
        type: 'module',
      },
    );
  }

  async parseJson(jsonArray) {
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        let jsonData;
        if ('url' in jsonArray[i]) {
          jsonData = await getData(jsonArray[i].url);
        } else {
          const fileContent = await readJsonAsync(jsonArray[i].url);
          jsonData = JSON.parse(fileContent);
        }
        Object.entries(jsonData.image).forEach(([key, value]) => {
          this.imageUpload[key] = new Tensor(
            'float32',
            new Float32Array(value),
            [1, 768],
          );
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }

  async handleUpload(uploadInput) {
    const filesArray = uploadInput.target.files;
    const imageArray = [...filesArray].filter((s) => s.type.includes('image'));

    this.dataToDownload = { image: {} };
    this.imageSet = [];
    this.imageUpload = {};

    const jsonArray = [...filesArray].filter((s) => s.type.includes('json'));
    await this.parseJson(jsonArray);

    for (let i = 0; i < imageArray.length; i++) {
      const objUrl = URL.createObjectURL(imageArray[i]);
      this.handleInput(
        objUrl,
        imageArray[i].name,
        imageArray[i].name,
        i,
        imageArray.length,
      );
    }
  }

  async handleExample(value) {
    this.dataToDownload = { image: {} };
    this.imageSet = [];
    this.imageUpload = {};

    const imageArray = value.filter((s) => !s.url.endsWith('json'));
    const jsonArray = value.filter((s) => s.url.endsWith('json'));
    await this.parseJson(jsonArray);

    for (let i = 0; i < imageArray.length; i++) {
      this.handleInput(
        imageArray[i].url,
        imageArray[i].caption,
        imageArray[i].url,
        i,
        imageArray.length,
      );
    }
  }

  async handleUploadVideo(uploadInput) {
    this.dataToDownload = { image: {} };
    this.imageSet = [];
    this.imageUpload = {};

    const vfe = new VideoFrameExtractor();
    await vfe.handleFileSelect(uploadInput);
    const imageArray = await vfe.getImageBlobUrls();

    for (let i = 0; i < imageArray.length; i++) {
      this.handleInput(
        imageArray[i].url,
        imageArray[i].title,
        imageArray[i].title,
        i,
        imageArray.length,
      );
    }
  }

  async handleInput(objUrl, caption, fname, index, inputLen) {
    this.imageSet.push({
      index: index,
      img: objUrl,
      name: caption,
      embed: null,
    });

    const img = document.createElement('img');

    img.src = objUrl;
    await img.decode();

    if (fname in this.imageUpload) {
      this.imageSet[index]['embed'] = this.imageUpload[fname];
      this.worker.postMessage({
        type: 'pipeline-fake',
        image: img.src,
        fileName: fname,
        index: index,
        inputLen: inputLen,
      });
    } else {
      this.worker.postMessage({
        type: 'pipeline',
        image: img.src,
        fileName: fname,
        index: index,
        inputLen: inputLen,
      });
    }
  }

  handleOutput(dt) {
    if (dt.output !== null) {
      const { data, type, dims } = dt.output;
      const tensor = new Tensor(type, new Float32Array(data), dims);
      this.imageSet[dt.input.index]['embed'] = tensor;

      this.dataToDownload['image'][dt.input.fileName] = Array.from(
        new Float32Array(data),
      );
    }

    if (this.outputCnt === dt.input.inputLen) {
      document.getElementById('search-label').style.display = 'inline';
      this.handleSelectImage(0);
    }
  }

  handleDownload() {
    document
      .getElementById('annotation-download')
      .addEventListener('click', () => {
        const jsonString = JSON.stringify(
          this.dataToDownload,
          function (key, val) {
            return val.toFixed ? Number(val.toPrecision(6)) : val;
          },
        );
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.json';
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }

  async handleSelectImage(index) {
    sortResults(this.imageSet[index].embed, this.imageSet).then(() => {
      const searchImg = [...document.getElementsByClassName('search-img')];
      const imageModal = document.getElementById('modal-image');
      const imageModalImage = document.getElementById('modal-image-img');
      const imageModalCaption = document.getElementById('modal-image-caption');
      for (let i = 0; i < searchImg.length; i++) {
        searchImg[i].addEventListener('click', (e) => {
          imageModal.classList.add('is-active');
          imageModalImage.src = e.target.src;
          imageModalCaption.innerHTML = e.target.dataset.caption;
        });
      }

      const figcaptionImg = [
        ...document.getElementsByClassName('figcaption-image'),
      ];
      for (let i = 0; i < figcaptionImg.length; i++) {
        figcaptionImg[i].addEventListener('click', (e) => {
          document.getElementById('annotation-output').scrollTop = 0;
          this.handleSelectImage(e.target.dataset.index);
        });
      }
    });
  }

  afterLoad() {
    getData('../../info/examples.json').then((dt) => {
      this.handleRunModel();
      this.handleExample(dt['met']['long']);
    });
  }
  
}

const argsortRev = function (array) {
  return array
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .map(({ index }) => index);
};

const sortResults = async function (tensorText, imageSet) {
  const vecTrans = tensorText.squeeze().unsqueeze(1);
  let scores = [];

  for (let i = 0; i < imageSet.length; i++) {
    const mat = await matmul(imageSet[i].embed, vecTrans);
    const prob = mat.tolist()[0];
    scores.push(prob);
  }

  const searchResults = document.getElementById('inner-container-search');
  const index = argsortRev(scores);

  searchResults.innerHTML = '';

  for (let i = 0; i < index.length; i++) {
    const cell = document.createElement('div');
    const fig = document.createElement('figure');
    const img = document.createElement('img');
    const cap = document.createElement('figcaption');

    cell.classList.add('cell', 'is-clickable');
    fig.classList.add('image', 'is-128x128', 'mx-3', 'my-4');
    img.classList = 'search-img';
    img.dataset.index = index[i];
    img.dataset.caption = imageSet[index[i]].name;
    img.dataset.src = imageSet[index[i]].img;
    img.src = imageSet[index[i]].img;
    cap.dataset.index = index[i];
    cap.innerHTML = (100 * scores[index[i]]).toFixed(2);
    cap.className = 'figcaption-image has-text-success';

    if (i === 0) {
      img.classList.add('active-image-embed');
    }

    fig.appendChild(img);
    fig.appendChild(cap);
    cell.appendChild(fig);
    searchResults.appendChild(cell);
  }
};
