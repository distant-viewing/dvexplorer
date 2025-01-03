import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

import {
  BlobReader,
  BlobWriter,
  ZipReader,
  ZipWriter,
} from '../extern/zip.min.js';

export default class DepthAnnotation extends Annotation {
  section = 'menu-image';
  name = 'depth';
  title = '2.3 Depth Estimation';
  dtype = 'q8';
  task = 'depth-estimation';
  model = 'Xenova/depth-anything-base-hf';
  itype = 'image';
  pylink = 'https://distant-viewing.github.io/dv-demo/2.3_depth.html';
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
      new URL('../workers/workerDepth.js', import.meta.url),
      {
        type: 'module',
      },
    );
  }

  async handleUpload(uploadInput) {
    const filesArray = uploadInput.target.files;
    const imageArray = [...filesArray].filter((s) => s.type.includes('image'));

    this.dataToDownload = {};
    this.imageDataArray = [];
    this.imageNameArray = [];

    for (let i = 0; i < imageArray.length; i++) {
      const objUrl = URL.createObjectURL(imageArray[i]);
      await this.handleInput(
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
    this.imageDataArray = [];
    this.imageNameArray = [];

    for (let i = 0; i < value.length; i++) {
      await this.handleInput(
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
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');
    const sp = document.createElement('p');

    imageContainer.className = 'image-container-depth';
    imageInner.className = 'inner-image-depth';
    img1.className = 'inner-image-img-depth inner-image-img-depth-1';
    img2.className = 'inner-image-img-depth inner-image-img-depth-2';
    sp.className = 'output-label pb-5';

    img1.src = objUrl;
    img2.src = objUrl;
    await img1.decode();

    const aspRatio = img1.width / img1.height;
    const conHeight = Math.min(616 / aspRatio, 500);
    const conWidth = conHeight * aspRatio;
    imageContainer.style.height = conHeight.toString() + 'px';
    imageContainer.style.width = conWidth.toString() + 'px';

    sp.innerHTML = caption;
    output
      .appendChild(imageContainer)
      .appendChild(imageInner)
      .appendChild(img1);

    imageInner.appendChild(img2);
    output.appendChild(sp);

    this.worker.postMessage({
      type: 'pipeline',
      image: img1.src,
      fileName: fname,
      index: index,
      inputLen: inputLen,
    });
  }

  handleOutput(dt) {
    const outputImages = document.getElementsByClassName(
      'inner-image-img-depth-2',
    );

    let rawImage = new RawImage(
      dt.output.data,
      dt.output.width,
      dt.output.height,
      dt.output.channels,
    );
    rawImage.rgba();

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = rawImage.width;
    canvas.height = rawImage.height;
    const context = canvas.getContext('2d');

    // Create an ImageData object from the RawImage data
    const imageData = new ImageData(
      new Uint8ClampedArray(rawImage.data),
      rawImage.width,
      rawImage.height,
    );

    // Draw the image data onto the canvas
    context.putImageData(imageData, 0, 0);

    // Convert the canvas to a data URL
    const dataURL = canvas.toDataURL('image/png');

    outputImages[dt.input.index].src = dataURL;

    this.imageDataArray.push(imageData);
    this.imageNameArray.push(dt.input.fileName);
  }

  async handleDownload() {
    // create's an array of promises for each image
    const oput = this.imageDataArray.map((e) => {
      const offscreen = new OffscreenCanvas(e.width, e.height);
      const gl = offscreen.getContext('2d');
      gl.putImageData(e, 0, 0);
      return offscreen.convertToBlob({ type: 'image/png' });
    });

    const res = await Promise.all(oput).then((e) => {
      return e;
    });

    // setup the zip writer object
    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    // iterate over the images and store in a zip archive
    for (let i = 0; i < res.length; i++) {
      let fname = this.imageNameArray[i];
      if (!fname.endsWith('.png')) {
        fname += '.png';
      }

      await zipWriter.add(fname, new BlobReader(res[i]));
    }

    await zipWriter.close();
    const zipFileBlob = await zipFileWriter.getData();
    const zipUrl = URL.createObjectURL(zipFileBlob);

    document
      .getElementById('annotation-download')
      .addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = 'data.zip';
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }
}
