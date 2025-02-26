import Annotation from './annotation.js';
import VideoFrameExtractor from '../utils/videoframeextractor.js'
import { readJsonAsync, getData } from '../utils/utils.js';

import { RawImage } from '../extern/transformers.min.js';

let colorScheme = null;

export default class ColorAnnotation extends Annotation {
  section = 'menu-video';
  name = 'color';
  title = '2.2 Color';
  dtype = 'q8';
  task = null;
  model = null;
  itype = 'image-corpus';
  pylink = 'https://distantviewing.org/dvscripts/tutorial-digital-images.html';
  dataToDownload = {};
  imageSet = [];
  exampleNames = null;

  constructor() {
    super();
    this.setup();
  }

  buildOutput() {}

  afterLoad() {
    document.getElementById('select-lang').disabled = false;
  }

  startWorkers() {
    if (this.worker !== null) {
      this.worker.terminate();
    }

    this.worker = new Worker(
      new URL('../workers/worker.js', import.meta.url),
      {
        type: 'module',
      },
    );

    const opts = document.getElementById('annotation-options');
    opts.innerHTML = '';
    const langSelect = document.createElement('div');
    langSelect.classList = 'language-select';
    const labelSpan = document.createElement('div');
    labelSpan.classList = 'select-label';
    labelSpan.innerHTML = 'Select color scheme:';
    const selectElem = document.createElement('select');
    selectElem.classList = 'select';
    selectElem.name = 'lang';
    selectElem.id = 'select-lang';

    opts.appendChild(langSelect).appendChild(labelSpan);
    langSelect.appendChild(selectElem);

    for (const [key, value] of Object.entries(colorSchemeS)) {
      const op = document.createElement('option');
      op.value = key;
      op.innerHTML = value;
      selectElem.appendChild(op);
    }
  }

   async handleUpload(uploadInput) {
    const filesArray = uploadInput.target.files;
    const imageArray = [...filesArray].filter((s) => s.type.includes('image'));

    this.dataToDownload = { image: {} };
    this.imageSet = [];
    this.imageUpload = {};

    //const jsonArray = [...filesArray].filter((s) => s.type.includes('json'));
    //await this.parseJson(jsonArray);

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
    //const jsonArray = value.filter((s) => s.url.endsWith('json'));
    //await this.parseJson(jsonArray);

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

  async handleUrl(value) {
    this.dataToDownload = { image: {} };
    this.imageSet = [];
    this.imageUpload = {};
    
    this.handleInput(
      value,
      value,
      value,
      0,
      1,
    );
  }

  async handleInput(objUrl, caption, fname, index, inputLen) {
    const img = document.createElement('img');
    img.src = objUrl;
    await img.decode();
    colorScheme = await loadColorScheme();

    const dataColors = calcColors(img);

    this.imageSet.push({
      index: index,
      img: objUrl,
      name: caption,
      metrics: dataColors,
    });

    this.worker.postMessage({
      type: 'pipeline-fake',
      image: img.src,
      fileName: fname,
      index: index,
      inputLen: inputLen,
    });
  }

  handleOutput(dt) {
    if (this.outputCnt === dt.input.inputLen) {
      const output = document.getElementById('annotation-output');
      output.innerHTML = '';

      const searchLabel = document.createElement('span');
      const colorLabelBox = document.createElement('div');
      const colorLabel = document.createElement('span');
      const searchResults = document.createElement('div');

      searchLabel.id = 'search-label';
      searchLabel.innerHTML =
        '<strong>Select a color to sort by:</strong>';
      searchLabel.classList = 'pr-3';

      colorLabel.id = 'color-label';
      colorLabel.style.fontSize = "1.3em";
      colorLabel.style.fontWeight = "bold";
      colorLabelBox.style.width = "100%";
      colorLabelBox.style.textAlign = "center";
      colorLabelBox.appendChild(colorLabel);

      const paletteGrid = document.createElement('div');
      paletteGrid.classList.add('palette-grid');

      // which colors to include?
      const domColorCounts = new Array(colorScheme.length).fill(0);
      for (let i = 0; i < this.imageSet.length; i++) {
        for (let j = 0; j < colorScheme.length; j++) {
          if (this.imageSet[i].metrics[j] > 0.001) {
            domColorCounts[j] += 1;
          }
        }
      }

      for (let j = 0; j < colorScheme.length; j++) {
        if (domColorCounts[j] > 0) {
          const colorBox = document.createElement('div');
          colorBox.style.backgroundColor = colorScheme[j].hex;
          colorBox.classList.add('palette-grid-item');
          colorBox.dataset.colorid = j;
          colorBox.dataset.name = colorScheme[j].name;

          colorBox.addEventListener('click', (e) => {
            this.handleSelectImage(j);
          });

          colorBox.addEventListener('mouseover', (e) => {
            const colorLabel = document.getElementById('color-label');
            colorLabel.innerHTML = colorScheme[j].name;
            let labelHex = colorScheme[j].hex;
            if (labelHex === "#FFFFFF") { labelHex = "#E6E6E6"; }
            colorLabel.style.color = labelHex;
          });   

          colorBox.addEventListener('mouseout', (e) => {
            const colorLabel = document.getElementById('color-label');
            colorLabel.style.color = 'white';
          });   

          paletteGrid.appendChild(colorBox);
        }

        searchResults.id = 'inner-container-search';
        searchResults.className =
          'media is-flex is-flex-wrap-wrap is-justify-content-center';

        output.appendChild(searchLabel);
        output.appendChild(paletteGrid);
        output.appendChild(colorLabelBox);
        output.appendChild(searchResults);

        this.handleSelectImage(0);
      }
    }
  }

  async handleDownload() {
    const rows = [];

    for (let i = 0; i < this.imageSet.length; i++) {
      const m = this.imageSet[i].metrics;
      for (let j = 0; j < colorScheme.length; j++) {
        rows.push([
          this.imageSet[i].img,
          colorScheme[j].hex,
          colorScheme[j].name,
          m[j]
        ]);
      }
    }

    const headers = ["path", "color", "color_name", "percentage"];
    const csvWithHeaders = [headers, ...rows.map(row => row.map(value => `"${value}"`).join(","))].join("\n");

    document
      .getElementById('annotation-download')
      .addEventListener('click', () => {
        const blob = new Blob([csvWithHeaders], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      });

  }

  async handleSelectImage(propertyName) {
    sortResults(propertyName, this.imageSet).then(() => {
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

const sortResults = async function (propertyName, imageSet) {
  let scores = [];

  for (let i = 0; i < imageSet.length; i++) {
    scores.push(imageSet[i].metrics[propertyName]);
  }

  const searchResults = document.getElementById('inner-container-search');
  const index = argsortRev(scores);

  searchResults.innerHTML = '';

  for (let i = 0; i < index.length; i++) {
    if (scores[index[i]] > 0.001) {
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

      fig.appendChild(img);
      fig.appendChild(cap);
      cell.appendChild(fig);
      searchResults.appendChild(cell);      
    }
  }
};

const calcColors = function (img) { 
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  const colorHist = new Array(colorScheme.length).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    let cdist = 10000;
    let cid = -1;
    for (let j = 0; j < colorScheme.length; j++) {
      // let x1 = 0.4124 * colorScheme[j].r + 0.3576 * colorScheme[j].g + 0.1805 * colorScheme[j].b;
      // let y1 = 0.2126 * colorScheme[j].r + 0.7152 * colorScheme[j].g + 0.0722 * colorScheme[j].b;
      // let z1 = 0.0193 * colorScheme[j].r + 0.1192 * colorScheme[j].g + 0.9505 * colorScheme[j].b;
      // let x2 = 0.4124 * data[i] + 0.3576 * data[i + 1] + 0.1805 * data[i + 2];
      // let y2 = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      // let z2 = 0.0193 * data[i] + 0.1192 * data[i + 1] + 0.9505 * data[i + 2];
      // let ndist = Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2);


      let ndist = Math.abs(colorScheme[j].r - data[i]) +
                  Math.abs(colorScheme[j].g - data[i + 1]) +
                  Math.abs(colorScheme[j].b - data[i + 2]);

      if (ndist < cdist) {
        cdist = ndist;
        cid = j;
      }
    }
    if (cdist < 72) {
      colorHist[cid] += 1;      
    }
  }

  for (let j = 0; j < colorScheme.length; j++) {
    colorHist[j] = colorHist[j] / (data.length / 4);
  }

  return colorHist;
};

const loadColorScheme = function() {
  const dropdown = document.getElementById('select-lang');
  const scheme = dropdown.value;
  return getData('/data/' + scheme + '.json');
}

const colorSchemeS = {
  rgb: 'Tertiary and Hues (86)',
  lecorbusier: 'Le Corbusier (64)',
};