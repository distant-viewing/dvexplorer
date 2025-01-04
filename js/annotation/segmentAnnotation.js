import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

export default class SegmentAnnotation extends Annotation {
  section = 'menu-image';
  name = 'segment';
  title = '2.4 Image Segmentation';
  dtype = 'q8';
  task = 'image-segmentation';
  model = 'Xenova/segformer-b0-finetuned-ade-512-512'; // Xenova/segformer_b2_clothes
  itype = 'image';
  pylink = 'https://distant-viewing.github.io/dv-demo/2.4_segment.html';
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

    const imageContainerLabel = document.createElement('label');
    const statusLabel = document.createElement('label');
    const spRes = document.createElement('span');

    imageContainerLabel.className = 'container-label';
    imageContainerLabel.style.backgroundImage = `url(${objUrl})`;
    imageContainerLabel.innerHTML = '';
    statusLabel.className = 'has-text-success is-size-4 status';
    statusLabel.innerHTML = 'Loading ...';
    spRes.className = 'output-result-segment pb-5';

    output.appendChild(imageContainerLabel);
    output.appendChild(statusLabel);
    output.appendChild(spRes);

    // create a DOM element to access a 'src' element
    const img = document.createElement('img');
    img.src = objUrl;
    await img.decode();

    const aspRatio = img.naturalWidth / img.naturalHeight;

    const conHeight = Math.min(616 / aspRatio, 500);
    const conWidth = conHeight * aspRatio;
    imageContainerLabel.style.height = conHeight.toString() + 'px';
    imageContainerLabel.style.width = conWidth.toString() + 'px';

    this.worker.postMessage({
      type: 'pipeline',
      image: img.src,
      fileName: fname,
      index: index,
      inputLen: inputLen,
    });
  }

  handleOutput(dt) {
    const imageContainerLabel = [
      ...document.getElementsByClassName('container-label'),
    ][dt.input.index];
    const status = [...document.getElementsByClassName('status')][
      dt.input.index
    ];
    const spRes = [
      ...document.getElementsByClassName('output-result-segment'),
    ][dt.input.index];

    status.innerHTML = '&mdash;';

    for (let i = 0; i < dt.output.length; i++) {
      renderMask(dt.output[i], i, imageContainerLabel);
    }

    attachEvents(imageContainerLabel, status);

    let propArray = [];
    for (let i = 0; i < dt.output.length; i++) {
      const count = dt.output[i].mask.data.reduce(
        (acc, value) => acc + (value === 255 ? 1 : 0),
        0,
      );
      const proportion = count / dt.output[i].mask.data.length;
      propArray.push({ label: dt.output[i].label, proportion: proportion });
    }

    propArray.sort((a, b) => b.proportion - a.proportion);
    let outMsg = '<strong>Predicted Segments</strong>: ';

    for (let i = 0; i < propArray.length; i++) {
      outMsg += `<span class="has-text-success">${propArray[i].label}</span> `;
      outMsg += `(${(100 * propArray[i].proportion).toFixed(2)}%)`;
      if (i !== dt.output.length - 1) {
        outMsg += '; ';
      }
    }
    spRes.innerHTML = outMsg;

    this.dataToDownload[dt.input.fileName] = propArray;
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

// CODE BELOW IS ADAPTED FROM:
// https://huggingface.co/spaces/Xenova/face-segmentation-web

// Mapping of label to colour
const colours = [
  [234, 76, 76], // red
  [28, 180, 129], // sea green
  [234, 155, 21], // orange
  [67, 132, 243], // blue
  [243, 117, 36], // orange-red
  [145, 98, 243], // purple
  [21, 178, 208], // cyan
  [132, 197, 33], // lime
];

function renderMask({ mask, label }, i, imageContainerLabel) {
  // Create new canvas
  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;
  canvas.setAttribute('data-label', label);
  canvas.className = 'segment-canvas';

  // Create context and allocate buffer for pixel data
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(canvas.width, canvas.height);
  const pixelData = imageData.data;

  // Choose colour based on index
  const [r, g, b] = colours[i % colours.length];

  // Fill mask with colour
  for (let i = 0; i < pixelData.length; ++i) {
    if (mask.data[i] !== 0) {
      const offset = 4 * i;
      pixelData[offset] = r; // red
      pixelData[offset + 1] = g; // green
      pixelData[offset + 2] = b; // blue
      pixelData[offset + 3] = 255; // alpha (fully opaque)
    }
  }

  // Draw image data to context
  context.putImageData(imageData, 0, 0);

  // Add canvas to container
  imageContainerLabel.appendChild(canvas);
}

// Clamp a value inside a range [min, max]
function clamp(x, min = 0, max = 1) {
  return Math.max(Math.min(x, max), min);
}

function attachEvents(imageContainerLabel, status) {
  // Attach hover event to image container
  imageContainerLabel.addEventListener('mousemove', (e) => {
    const canvases = imageContainerLabel.getElementsByTagName('canvas');
    if (canvases.length === 0) return;

    // Get bounding box
    const bb = imageContainerLabel.getBoundingClientRect();

    // Get the mouse coordinates relative to the container
    const mouseX = clamp((e.clientX - bb.left) / bb.width);
    const mouseY = clamp((e.clientY - bb.top) / bb.height);

    // Loop over all canvases
    for (const canvas of canvases) {
      const canvasX = canvas.width * mouseX;
      const canvasY = canvas.height * mouseY;

      // Get the pixel data of the mouse coordinates
      const context = canvas.getContext('2d');
      const pixelData = context.getImageData(canvasX, canvasY, 1, 1).data;

      // Apply hover effect if not fully opaque
      if (pixelData[3] < 255) {
        canvas.style.opacity = 0.1;
      } else {
        canvas.style.opacity = 0.8;
        status.textContent = canvas.getAttribute('data-label');
      }
    }
  });

  // Reset canvas opacities on mouse exit
  imageContainerLabel.addEventListener('mouseleave', (e) => {
    const canvases = [...imageContainerLabel.getElementsByTagName('canvas')];
    if (canvases.length > 0) {
      canvases.forEach((c) => (c.style.opacity = 0.6));
      status.innerHTML = '&mdash;';
    }
  });
}
