import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';
import { readJsonAsync, getData } from '../utils/utils.js';

import { Tensor, matmul } from '../extern/transformers.min.js';

export default class ZeroshotAnnotation extends Annotation {
  section = 'menu-multimodal';
  name = 'zeroshot';
  title = '5.1 Zero-Shot Model';
  dtype = 'q8';
  task = 'zero-shot-image-classification';
  model = 'Xenova/siglip-base-patch16-224';
  itype = 'image-corpus';
  pylink = 'https://distant-viewing.github.io/dv-demo/5.1_zeroshot.html';
  dataToDownload = {};
  exampleNames = null;
  imageSet = [];
  imageUpload = {};
  doneCnt = 0;

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

    const searchControl = document.createElement('div');
    const searchBar = document.createElement('input');
    const searchResults = document.createElement('div');

    searchControl.id = 'search-bar-control';
    searchControl.className = 'control mx-6';
    searchBar.id = 'search-bar';
    searchBar.className = 'input is-success';
    searchBar.type = 'text';
    searchBar.placeholder = 'search terms';
    searchBar.disabled = true;
    searchResults.id = 'inner-container-search';
    searchResults.className =
      'media is-flex is-flex-wrap-wrap is-justify-content-center';

    output.appendChild(searchControl).appendChild(searchBar);
    output.appendChild(searchResults);

    document.getElementById('search-bar').addEventListener('keypress', (e) => {
      this.handleSearch(e);
    });
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

    this.dataToDownload = { image: {}, text: {} };
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
    this.dataToDownload = { image: {}, text: {} };
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
    if (dt.output === null || dt.type !== 'output-text') {
      if (dt.output !== null) {
        const { data, type, dims } = dt.output;
        const tensor = new Tensor(type, new Float32Array(data), dims);
        this.imageSet[dt.input.index]['embed'] = tensor;

        this.dataToDownload['image'][dt.input.fileName] = Array.from(
          new Float32Array(data),
        );
      }

      if (this.outputCnt === dt.input.inputLen) {
        document.getElementById('search-bar').disabled = false;
        this.worker.postMessage({
          type: 'pipeline-text',
          text: '',
        });
      }
    }

    if (dt.type === 'output-text') {
      const { data, type, dims } = dt.output;
      const tensorText = new Tensor(type, new Float32Array(data), dims);
      sortResults(tensorText, this.imageSet);

      this.dataToDownload['text'][dt.input.text] = Array.from(
        new Float32Array(data),
      );
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

  async handleSearch(e) {
    if (e.key === 'Enter') {
      const sbar = document.getElementById('search-bar');
      this.worker.postMessage({ type: 'inputText', text: sbar.value });

      this.worker.postMessage({
        type: 'pipeline-text',
        text: sbar.value,
      });
    }
  }
}

const argsortRev = function (array) {
  // Create an array of indices [0, 1, 2, ..., array.length - 1]
  return array
    .map((value, index) => ({ value, index })) // Map values to their indices
    .sort((a, b) => b.value - a.value) // Sort by the values
    .map(({ index }) => index); // Extract the sorted indices
};

const sortResults = async function (tensorText, imageSet) {
  const logit_bias = -12.932437;
  const logit_scale = 117.330765;
  const vecTrans = tensorText.squeeze().unsqueeze(1);
  let scores = [];

  for (let i = 0; i < imageSet.length; i++) {
    const mat = await matmul(imageSet[i].embed, vecTrans);
    const prob = mat.mul(logit_scale).add(logit_bias).sigmoid().tolist()[0];
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

    cell.classList.add('cell');
    fig.classList.add('image', 'is-128x128', 'mx-3', 'my-4');
    img.className = 'search-img is-clickable';
    img.dataset.index = index[i];
    img.dataset.caption = imageSet[index[i]].name;
    img.src = imageSet[index[i]].img;
    cap.dataset.index = index[i];
    cap.innerHTML = (100 * scores[index[i]]).toFixed(2);
    cap.className = 'figcaption-image has-text-success';

    fig.appendChild(img);
    fig.appendChild(cap);
    cell.appendChild(fig);
    searchResults.appendChild(cell);

    const imageModal = document.getElementById('modal-image');
    const imageModalImage = document.getElementById('modal-image-img');
    const imageModalCaption = document.getElementById('modal-image-caption');

    img.addEventListener('click', (e) => {
      imageModal.classList.add('is-active');
      imageModalImage.src = imageSet[index[i]].img;
      imageModalCaption.innerHTML = imageSet[index[i]].name;
    });
  }
};
