import Annotation from './annotation.js';
import { extractAudioData } from '../utils/tutils.js';

export default class DiarizationAnnotation extends Annotation {
  section = 'menu-video';
  name = 'diarization';
  title = '3.3 Diarization';
  dtype = 'q8';
  task = 'audio-classification';
  model = 'onnx-community/pyannote-segmentation-3.0';
  itype = 'video';
  pylink = 'https://distantviewing.org/dvscripts/3.3_diarization.html';
  dataToDownload = {};
  doneCnt = 0;
  exampleNames = null;

  constructor() {
    super();
    this.setup();
  }

  handleLoad(dt) {
    if (dt.progress.status === 'done') {
      this.doneCnt += 1;
    }
    if (this.doneCnt >= 4) {
      this.handleReady();
      this.afterLoad();
    }
    if (
      dt.progress.status === 'progress' &&
      dt.progress.file === 'preprocessor_config.json'
    ) {
      document.getElementById('file-progress-load').value =
        dt.progress.progress;
    }
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
  }

  startWorkers() {
    this.doneCnt = 0;

    if (this.worker !== null) {
      this.worker.terminate();
    }

    this.worker = new Worker(
      new URL('../workers/workerDiarization.js', import.meta.url),
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
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = objUrl;
    videoPlayer.play();

    const audioData = await extractAudioData(objUrl);

    this.worker.postMessage({
      type: 'pipeline',
      image: audioData,
      modelOpts: { return_timestamps: 'word' },
      fileName: fname,
      index: 0,
      inputLen: 1,
    });
  }

  handleOutput(dt) {
    const outTrans = document.getElementById('output-transcription');
    const ch = dt.output;

    for (let i = 0; i < ch.length; i++) {
      if (ch[i].label !== 'NO_SPEAKER') {
        const newItem = document.createElement('li');
        let txt = `<span class='seek' data-timestamp="${ch[i].start.toFixed(2)}">`;
        txt += `<strong>${ch[i].label}:</strong> `;
        txt += `${ch[i].start.toFixed(2)} &rarr; `;
        txt += `${ch[i].end.toFixed(2)} `;
        txt += `(${(100 * ch[i].confidence).toFixed(2)})`;
        txt += `</span>`;
        newItem.innerHTML = txt;
        outTrans.appendChild(newItem);
      }
    }

    const videoPlayer = document.getElementById('videoPlayer');
    const spanObjs = [...document.getElementsByClassName('seek')];

    spanObjs.forEach((span) => {
      span.addEventListener('click', () => {
        const timestamp = span.getAttribute('data-timestamp');
        videoPlayer.currentTime = parseFloat(timestamp);
        videoPlayer.play();
      });
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
