import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

export default class ClassifyAnnotation extends Annotation {
  section = 'menu-multimodal';
  name = 'caption';
  title = '5.2 Image Caption';
  dtype = 'q8';
  task = 'image-to-text';
  model = 'Xenova/vit-gpt2-image-captioning';
  itype = 'image';
  pylink = 'https://distantviewing.org/dvscripts/5.2_caption.html';
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

    img.src = objUrl;
    sp.innerHTML = caption;
    output
      .appendChild(imageContainer)
      .appendChild(imageInner)
      .appendChild(img);

    output.appendChild(sp);
    output.appendChild(spRes);
    await img.decode();

    this.worker.postMessage({
      type: 'pipeline',
      image: img.src,
      modelOpts: { max_length: 30, num_beams: 4 },
      fileName: fname,
      index: index,
      inputLen: inputLen,
    });
  }

  handleOutput(dt) {
    if (dt.output === null) {
      return;
    }

    const outputResults = document.getElementsByClassName(
      'output-result-classify',
    );

    let outMsg = '<strong>Predicted Caption</strong>: ';
    outMsg += `<span class="has-text-success">${dt.output[0].generated_text}</span> `;

    outputResults[dt.input.index].innerHTML = outMsg;
    this.dataToDownload[dt.input.fileName] = dt.output[0].generated_text;
  }

  handleDownload() {

    console.log(this.dataToDownload);

    const csv = Object.entries(this.dataToDownload)
      .map(([key, value]) => `"${key}","${value}"`)
      .join("\n");

    const csvWithHeaders = `"path","caption"\n${csv}`;

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
