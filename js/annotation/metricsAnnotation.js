import Annotation from './annotation.js';
import VideoFrameExtractor from '../utils/videoframeextractor.js'
import { readJsonAsync, getData } from '../utils/utils.js';

import { RawImage } from '../extern/transformers.min.js';

import {
  BlobReader,
  BlobWriter,
  TextReader,
  ZipReader,
  ZipWriter,
} from '../extern/zip.min.js';

export default class MetricsAnnotation extends Annotation {
  section = 'menu-video';
  name = 'metrics';
  title = '2.1 Brightness + Hue';
  dtype = 'q8';
  task = null;
  model = null;
  itype = 'image-corpus';
  pylink = 'https://distantviewing.org/dvscripts/metrics.html';
  dataToDownload = {};
  imageSet = [];
  exampleNames = null;

  constructor() {
    super();
    this.setup();
  }

  buildOutput() {
    const output = document.getElementById('annotation-output');
    output.innerHTML = '';

    const searchLabel = document.createElement('span');
    const searchResults = document.createElement('div');

    searchLabel.id = 'search-label';
    searchLabel.innerHTML =
      '<strong>Select a property to sort by:</strong>';
    searchLabel.classList = 'pr-3';
    searchLabel.style.display = 'none';

    const properySelect = document.createElement('div');
    properySelect.classList = 'metric-select';
    const selectElem = document.createElement('select');
    selectElem.classList = 'select';
    selectElem.name = 'properties';
    selectElem.id = 'select-property';

    for (const [key, value] of Object.entries(METRICS)) {
      const op = document.createElement('option');
      op.value = key;
      op.innerHTML = value;
      selectElem.appendChild(op);
    }
    selectElem.style.display = 'none';

    selectElem.addEventListener('change', (e) => {
      this.handleSelectImage(selectElem.value);
    });

    searchResults.id = 'inner-container-search';
    searchResults.className =
      'media is-flex is-flex-wrap-wrap is-justify-content-center';

    properySelect.appendChild(searchLabel);
    properySelect.appendChild(selectElem);
    output.appendChild(properySelect);
    output.appendChild(searchResults);
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

    const dataHsb = calcHSB(img);
    const dataColors = calcColors(img);
    const dataDiag = calcDiag(img);

    const metrics = {...dataHsb, ...dataColors, ...dataDiag};

    this.imageSet.push({
      index: index,
      img: objUrl,
      name: caption,
      metrics: metrics,
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
      document.getElementById('select-property').style.display = 'inline';
      document.getElementById('search-label').style.display = 'inline';
      this.handleSelectImage('avgBrightness');
    }
  }

  async handleDownload() {
    const rows = [];

    for (let i = 0; i < this.imageSet.length; i++) {
      const m = this.imageSet[i].metrics;
      rows.push([
        this.imageSet[i].img,
        m.avgBrightness,
        m.avgSaturation,
        m.avgDiagDiff,
        m.red,
        m.orange,
        m.yellow,
        m.green,
        m.blue,
        m.purple,
        m.black,
        m.white,
        m.grey
      ]);
    }

    const headers = ["path", "brightness", "saturation", "edge_score", "red",
                     "orange", "yellow", "green", "blue", "purple", "black", "white",
                     "grey"];
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

const calcHSB = function (img) { 
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  let totalSaturation = 0;
  let totalBrightness = 0;
  let pixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;    // Red
    const g = data[i + 1] / 255; // Green
    const b = data[i + 2] / 255; // Blue

    // Convert to HSB (or HSL)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = max; // Brightness is the max channel value
    const saturation = max === 0 ? 0 : (max - min) / max;

    totalBrightness += brightness;
    totalSaturation += saturation;
    pixelCount++;
  }

  // Calculate averages
  const avgSaturation = totalSaturation / pixelCount;
  const avgBrightness = totalBrightness / pixelCount;

  return({ avgSaturation, avgBrightness });
};

const calcColors = function (img) { 
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  const colorCounts = {
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0,
    black: 0,
    white: 0,
    grey: 0,
  };

  //const pixelCount = data.length / 4;
  
  let pixelCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;    // Red
    const g = data[i + 1] / 255; // Green
    const b = data[i + 2] / 255; // Blue

    // Convert to HSB/HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
      if (max === r) hue = ((g - b) / delta) % 6;
      else if (max === g) hue = (b - r) / delta + 2;
      else hue = (r - g) / delta + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    const brightness = max;
    const saturation = max === 0 ? 0 : delta / max;

    // Categorize pixel
    if (brightness < 0.1) {
      colorCounts.black++;
    } else if (saturation < 0.15 && brightness > 0.9) {
      colorCounts.white++;
    } else if (saturation < 0.15) {
      colorCounts.grey++;
    } else {
      if (hue >= 0 && hue < 15 || hue >= 345 && hue <= 360) colorCounts.red++;
      else if (hue >= 15 && hue < 45) colorCounts.orange++;
      else if (hue >= 45 && hue < 75) colorCounts.yellow++;
      else if (hue >= 75 && hue < 150) colorCounts.green++;
      else if (hue >= 150 && hue < 270) colorCounts.blue++;
      else if (hue >= 270 && hue < 345) colorCounts.purple++;
    }

    pixelCount++;
  }

  // Calculate percentages
  for (const color in colorCounts) {
    colorCounts[color] = (colorCounts[color] / pixelCount);
  }

  return colorCounts;
};

const calcDiag = function (img) { 
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  const width = imageData.width;
  const height = imageData.height;

  let totalDifference = 0;
  let count = 0;

  // Convert to greyscale and calculate diagonal differences
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const index = (y * width + x) * 4; // Current pixel index
      const diagonalIndex = ((y + 1) * width + (x + 1)) * 4; // Diagonal pixel index

      // Convert current pixel and diagonal pixel to greyscale
      const grey = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
      const diagonalGrey = 0.299 * data[diagonalIndex] + 0.587 * data[diagonalIndex + 1] + 0.114 * data[diagonalIndex + 2];

      // Compute absolute difference
      const difference = Math.abs(grey - diagonalGrey);
      totalDifference += difference;
      count++;
    }
  }

  // Calculate the average difference
  const averageDifference = totalDifference / count;

  return {'avgDiagDiff': averageDifference / 255};
};


const METRICS = {
  avgBrightness: 'Brightness',
  avgSaturation: 'Saturation',
  red: 'Red Percentage',
  orange: 'Orange Percentage',
  yellow: 'Yellow Percentage',
  green: 'Green Percentage',
  blue: 'Blue Percentage',
  purple: 'Purple Percentage',
  black: 'Black Percentage',
  white: 'White Percentage',
  grey: 'Grey Percentage',
  avgDiagDiff: 'Edges',
}



