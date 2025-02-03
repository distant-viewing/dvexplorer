import Annotation from './annotation.js';
import { formatTime } from '../utils/utils.js';

import { RawImage } from '../extern/transformers.min.js';

import {
  BlobReader,
  BlobWriter,
  TextReader,
  ZipReader,
  ZipWriter,
} from '../extern/zip.min.js';

export default class ShotboundaryAnnotation extends Annotation {
  section = 'menu-video';
  name = 'shotboundary';
  title = '3.1 Shot Boundary';
  dtype = 'q8';
  task = 'shot-boundary';
  model = null;
  itype = 'video';
  pylink = 'https://distantviewing.org/dvscripts/shot.html';
  dataToDownload = {};
  exampleNames = null;

  constructor() {
    super();
    this.setup();
  }

  buildOutput() {
    const output = document.getElementById('annotation-output');
    output.innerHTML = '';

    const videoPlayer = document.createElement('video');
    videoPlayer.id = 'videoPlayer';
    videoPlayer.controls = true;

    output.appendChild(videoPlayer);

    const outputTranscription = document.createElement('ul');
    outputTranscription.id = 'output-transcription';
    outputTranscription.className = 'pt-4';

    output.appendChild(outputTranscription);

    const spanTotal = document.createElement('li');
    spanTotal.innerHTML = `<strong>Total Shots</strong>:`;
    spanTotal.id = 'output-total-shots';
    outputTranscription.appendChild(spanTotal);

    const spanAverage = document.createElement('li');
    spanAverage.innerHTML = `<strong>Average Length</strong>:`;
    spanAverage.id = 'output-average-length';
    outputTranscription.appendChild(spanAverage);
  }

  startWorkers() {
    if (this.worker !== null) {
      this.worker.terminate();
    }

    this.worker = new Worker(
      new URL('../workers/workerShotboundary.js', import.meta.url),
      {
        type: 'module',
      },
    );
  }

  async handleUpload(uploadInput) {
    this.dataToDownload = {};

    const objUrl = URL.createObjectURL(uploadInput.target.files[0]);

    this.handleInput(
      objUrl,
      uploadInput.target.files[0].name,
      uploadInput.target.files[0].name,
      0,
      1,
    );
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
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = objUrl;
    videoPlayer.play();

    const videoVirtual = document.createElement('video');
    const canvasVirtual = document.createElement('canvas');
    const cvx = canvasVirtual.getContext('2d');
    videoVirtual.src = objUrl;

    const offscreen = new OffscreenCanvas(14, 24);
    offscreen.height = 14;
    offscreen.width = 24;
    const gl = offscreen.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });

    let lastBuffer;
    const frameRate = 30;
    const seekDuration = 1 / frameRate;
    let shotList = [];

    // once metadata is loaded, size the virtual element
    videoVirtual.addEventListener('loadedmetadata', () => {
      canvasVirtual.width = videoVirtual.videoWidth;
      canvasVirtual.height = videoVirtual.videoHeight;

      const totalFrames = Math.floor(videoVirtual.duration * frameRate);
      let frameCount = 0;
      let thisShotStart = 0;
      let thisShotImage = null;
      videoVirtual.currentTime = 0;

      videoVirtual.addEventListener('seeked', async () => {
        frameCount += 1;

        gl.drawImage(
          videoVirtual,
          0,
          0,
          canvasVirtual.width,
          canvasVirtual.height,
          0,
          0,
          offscreen.width,
          offscreen.height,
        );

        let buffer = await gl.getImageData(0, 0, 14, 24, {
          colorSpace: 'srgb',
        }).data;
        if (lastBuffer === undefined) {
          lastBuffer = buffer;
        }

        let avgValue = 0;
        for (let i = 0; i < buffer.length; i++) {
          avgValue += Math.abs(buffer[i] - lastBuffer[i]);
        }
        avgValue = Math.round(avgValue / buffer.length);

        // is this the start of a new shot?
        if ((avgValue > 10) | (frameCount === totalFrames)) {
          shotList.push({
            start: thisShotStart,
            end: videoVirtual.currentTime,
            score: avgValue,
          });
          thisShotStart = videoVirtual.currentTime;
          thisShotImage = null;
        }

        if (thisShotImage === null) {
          const imageContainer = document.createElement('div');
          const imageInner = document.createElement('div');
          const img = document.createElement('img');
          const sp = document.createElement('span');

          imageContainer.className = 'image-container';
          imageInner.className = 'inner-image inner-image-shot';
          img.className = 'inner-image-img';
          img.dataset.time = videoVirtual.currentTime;
          sp.className = 'output-label';

          cvx.drawImage(
            videoVirtual,
            0,
            0,
            canvasVirtual.width,
            canvasVirtual.height,
          );
          img.src = canvasVirtual.toDataURL('image/png');
          sp.innerHTML = formatTime(videoVirtual.currentTime);
          output
            .appendChild(imageContainer)
            .appendChild(imageInner)
            .appendChild(img);

          output.appendChild(sp);
          thisShotImage = img.src;
        }

        lastBuffer = buffer;

        const videoOutput = document.getElementById('video-out');
        const frameData = canvasVirtual.toDataURL('image/png');

        if (frameCount < totalFrames) {
          videoVirtual.currentTime += seekDuration;
        } else {
          this.dataToDownload['shots'] = shotList;

          const spanTotal = document.getElementById('output-total-shots');
          spanTotal.innerHTML = `<strong>Total Shots</strong>: <span class="has-text-success"> ${shotList.length}</span>`;

          const spanAverage = document.getElementById('output-average-length');
          const avgDur = videoVirtual.duration / shotList.length;
          spanAverage.innerHTML = `<strong>Average Length</strong>: <span class="has-text-success">${avgDur.toFixed(2)} seconds</span>`;
        }

        this.worker.postMessage({
          type: 'pipeline',
          image: [],
          fileName: fname,
          index: frameCount,
          inputLen: totalFrames,
        });
      });
    });
  }

  handleOutput(dt) {}

  async handleDownload() {

    // convert annotations to csv
    const rows = [];
    this.dataToDownload.shots.forEach(({ start, end, score }) => {
      rows.push([start, end, score]);
    });
    const headers = ["start", "end", "score"];
    const csvWithHeaders = [headers, ...rows.map(row => row.map(value => `"${value}"`).join(","))].join("\n");

    // deal with the images
    let imgElems = [...document.getElementsByClassName('inner-image-img')];
    imgElems.pop();
    const oput = imgElems.map((e) => {
      return convertImageToBlobUsingOffscreenCanvas(e);
    });

    const res = await Promise.all(oput).then((e) => {
      return e;
    });

    // setup the zip writer object
    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    // iterate over the images and store in a zip archive
    for (let i = 0; i < res.length; i++) {
      let millSec = Math.floor(imgElems[i].dataset.time * 1000);
      millSec = String(millSec).padStart(10, '0');
      await zipWriter.add(`${millSec}.png`, new BlobReader(res[i]));
    }

    await zipWriter.add(`data.csv`, new TextReader(csvWithHeaders));

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

async function convertImageToBlobUsingOffscreenCanvas(imgElement) {
  const offscreenCanvas = new OffscreenCanvas(
    imgElement.naturalWidth,
    imgElement.naturalHeight,
  );
  const context = offscreenCanvas.getContext('2d');

  context.drawImage(imgElement, 0, 0);
  const blob = await offscreenCanvas.convertToBlob({
    type: 'image/png',
  });

  return blob;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
