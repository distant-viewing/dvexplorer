import Annotation from './annotation.js';
import VideoFrameExtractor from '../utils/videoframeextractor.js'
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

export default class ClassifyAnnotation extends Annotation {
  section = 'menu-image';
  name = 'classify';
  title = '2.3 Image Classification';
  dtype = 'q8';
  task = 'image-classification';
  model = 'Xenova/resnet-50';
  itype = 'image';
  pylink = 'https://distantviewing.org/dvscripts/classification.html';
  dataToDownload = {};
  exampleNames = null;

  constructor() {
    super();
    this.setup();
  }

  buildOutput() {
    const output = document.getElementById('annotation-output');
    output.innerHTML = '';
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

    this.dataToDownload = {};

    for (let i = 0; i < imageArray.length; i++) {
      const objUrl = URL.createObjectURL(imageArray[i]);
      this.handleInput(
        objUrl,
        filesArray[i].name,
        filesArray[i].name,
        i,
        filesArray.length,
      );
    }
  }

  async handleExample(value) {
    this.dataToDownload = {};

    const imageArray = value.filter((s) => !s.url.endsWith('json'));

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

  async handleUrl(value) {
    this.dataToDownload = {};

    this.handleInput(
      value,
      value,
      value,
      0,
      1,
    );
  }

  async handleUploadVideo(uploadInput) {
    this.dataToDownload = {};

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
    const output = document.getElementById('annotation-output');
    const imageContainer = document.createElement('div');
    const imageInner = document.createElement('div');
    const img = document.createElement('img');
    const sp = document.createElement('p');
    const spRes = document.createElement('span');

    imageContainer.className = 'image-container';
    imageInner.className = 'inner-image';
    img.className = 'inner-image-img';
    sp.className = 'output-label';
    spRes.className = 'output-result-classify';

    img.addEventListener('error', () => { this.handleResult(); });

    img.src = objUrl;
    sp.innerHTML = caption;
    output
      .appendChild(imageContainer)
      .appendChild(imageInner)
      .appendChild(img);

    output.appendChild(sp);
    output.appendChild(spRes);

    img.onerror = () => {
      this.buildOutput();

      const output = document.getElementById('annotation-output');
      const msg = document.createElement('p');
      msg.innerHTML = 'Not able to load image from URL <b>' + objUrl + '</b>';
      msg.innerHTML += ". Please try again with another input or example!"
      output.appendChild(msg);

      this.handleError();
    };

    img.onload = () => {
      this.worker.postMessage({
        type: 'pipeline',
        image: img.src,
        fileName: fname,
        index: index,
        inputLen: inputLen,
      }); 
    };
  }

  handleOutput(dt) {
    if (dt.output === null) {
      return;
    }
    
    const outputResults = document.getElementsByClassName(
      'output-result-classify',
    );

    let outMsg = '<strong>Predicted Categories</strong>: ';

    if (dt.output !== null) {
      for (let i = 0; i < dt.output.length; i++) {
        outMsg += `<span class="has-text-success">${dt.output[i].label}</span> `;
        outMsg += `(${(dt.output[i].score * 100).toFixed(2)}%)`;
        if (i !== dt.output.length - 1) {
          outMsg += '; ';
        }
      }

      outputResults[dt.input.index].innerHTML = outMsg;
      this.dataToDownload[dt.input.fileName] = dt.output;
    }
  }

  handleDownload() {
    const rows = [];
    Object.entries(this.dataToDownload).forEach(([path, labels]) => {
      labels.forEach(({ label, score }) => {
        rows.push([path, label, score]);
      });
    });

    const headers = ["path", "label", "score"];
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

  afterLoad() {
    const value = [{
      "url":"../../img/fsac/service-pnp-fsac-1a35000-1a35000-1a35022vcrop.png",
      "caption": "Russell Lee, August 1942 <i>Shepherd with his horse and " +
                  "dog on Gravelly Range, Madison County, Montana</i> (cropped)" +
                  " <a href='https://www.loc.gov/pictures/collection/fsac/item/2017878800/'" +
                  "target='_blank' rel='noopener noreferrer'>[link]<\/a>"
    }];

    this.handleRunModel();
    this.handleExample(value);
  }
}


