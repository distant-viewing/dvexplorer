import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

export default class ObjectAnnotation extends Annotation {
  section = 'menu-image';
  name = 'object';
  title = '2.3 Object Detection';
  dtype = 'q8';
  task = 'object-detection';
  model = 'Xenova/detr-resnet-50';
  itype = 'image';
  pylink = 'https://distantviewing.org/dvscripts/2.3_object.html';
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
  
  async handleInput(objUrl, caption, fname, index, inputLen) {
    const output = document.getElementById('annotation-output');
    const imageContainer = document.createElement('div');
    const imageInner = document.createElement('div');
    const img = document.createElement('img');
    const sp = document.createElement('p');

    imageContainer.className = 'image-container';
    imageInner.className = 'inner-image';
    img.className = 'inner-image-img';
    sp.className = 'output-label';

    img.src = objUrl;
    sp.innerHTML = caption;
    output
      .appendChild(imageContainer)
      .appendChild(imageInner)
      .appendChild(img);

    output.appendChild(sp);

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
        modelOpts: { threshold: 0.8, percentage: true },
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
    
    const outputImages = document.getElementsByClassName('inner-image');
    const outputImagesImg = document.getElementsByClassName('inner-image-img');

    dt.output.forEach((r) => {
      outputImages[dt.input.index].appendChild(renderBox(r));
    });

    this.dataToDownload[dt.input.fileName] = dt.output;
  }

  handleDownload() {

    // Prepare the CSV data
    const rows = [];

    // Iterate over each key-value pair
    Object.entries(this.dataToDownload).forEach(([path, detections]) => {
      if (detections.length === 0) {
        // Add a row indicating no detections for this path
        rows.push([path, "No detections", "", "", "", "", "", ""]);
      } else {
        detections.forEach(({ score, label, box }) => {
          const { xmin, ymin, xmax, ymax } = box;
          // Add a row for each detection
          rows.push([path, label, score, xmin, ymin, xmax, ymax]);
        });
      }
    });

    const headers = ["path", "label", "score", "xmin", "ymin", "xmax", "ymax"];
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
      "url":"../../img/fsac/service-pnp-fsac-1a35000-1a35000-1a35022v.png",
      "caption": "Russell Lee, August 1942 <i>Shepherd with his horse and " +
                  "dog on Gravelly Range, Madison County, Montana</i>" +
                  " <a href='https://www.loc.gov/pictures/collection/fsac/item/2017878800/'" +
                  "target='_blank' rel='noopener noreferrer'>[link]<\/a>"
    }];

    this.handleRunModel();
    this.handleExample(value);
  }
}
