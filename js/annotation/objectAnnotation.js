import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

export default class ObjectAnnotation extends Annotation {
  section = 'menu-image';
  name = 'object';
  title = '2.2 Object Detection';
  dtype = 'q8';
  task = 'object-detection';
  model = 'Xenova/detr-resnet-50';
  itype = 'image';
  pylink = 'https://distant-viewing.github.io/dv-demo/2.2_object.html';
  dataToDownload = {};

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

    for (let i = 0; i < value.length; i++) {
      this.handleInput(
        value[i].url,
        value[i].caption,
        value[i].url,
        i,
        value.length,
      );
    }
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
    await img.decode();

    this.worker.postMessage({
      type: 'pipeline',
      image: img.src,
      modelOpts: { threshold: 0.8, percentage: true },
      fileName: fname,
      index: index,
      inputLen: inputLen,
    });
  }

  handleOutput(dt) {
    const outputImages = document.getElementsByClassName('inner-image');
    const outputImagesImg = document.getElementsByClassName('inner-image-img');

    dt.output.forEach((r) => {
      outputImages[dt.input.index].appendChild(renderBox(r));

      // outputImagesImg[dt.input.index].onload = () => {
      //   console.log(outputImagesImg[dt.input.index].offsetHeight);
      //   outputImages[dt.input.index].style.height =
      //     outputImagesImg[dt.input.index].offsetHeight + 'px';
      //   outputImages[dt.input.index].style.width =
      //     outputImagesImg[dt.input.index].offsetWidth + 'px';
      // };
    });

    this.dataToDownload[dt.input.fileName] = dt.output;
  }

  handleDownload() {
    document
      .getElementById('annotation-download')
      .addEventListener('click', () => {
        const jsonString = JSON.stringify(this.dataToDownload);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.json';
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }
}
