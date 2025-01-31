import { getData } from '../utils/utils.js';

const handleReset = function () {
  document.getElementById('annotation-options').innerHTML = '';
  document.getElementById('file-progress-load').value = 0;
  document.getElementById('file-progress-run').value = 0;
  document.getElementById('annotation-load').disabled = false;
  document.getElementById('annotation-load').classList.add('is-success');
  document.getElementById('annotation-load').classList.add('is-light');
  document.getElementById('annotation-example').disabled = true;
  document.getElementById('annotation-example').classList.remove('is-light');
  document.getElementById('annotation-example').classList.remove('is-loading');
  document.getElementById('annotation-upload').disabled = true;
  document.getElementById('annotation-upload').classList.remove('is-light');
  document.getElementById('annotation-upload').classList.remove('is-loading');
  document.getElementById('annotation-download').disabled = true;
  document.getElementById('annotation-download').classList.remove('is-light');

  document.getElementById('annotation-example').classList.remove('is-success');
  document
    .getElementById('annotation-download')
    .classList.remove('is-success');
};

const setupText = function () {
  const finput = document.getElementById('file-input');
  finput.accept = '.txt';
  finput.webkitdirectory = false;
  finput.multiple = false;

  const uploadSpan = document.getElementById('annotation-upload-span');
  uploadSpan.innerHTML = 'Upload text file…';

  const uploadInstructions = document.getElementById('upload-instructions');
  uploadInstructions.innerHTML = 'Select a text file to upload, with one entry on each line.';

  const urlInput = document.getElementById('url-input');
  urlInput.classList.add('is-hidden');

  const videoUploadContainer = document.getElementById('video-container');
  videoUploadContainer.classList.add('is-hidden');
};

const setupImage = function () {
  const finput = document.getElementById('file-input');
  finput.accept = 'image/*';
  finput.webkitdirectory = false;
  finput.multiple = true;

  const uploadSpan = document.getElementById('annotation-upload-span');
  uploadSpan.innerHTML = 'Upload image file(s)…';

  const uploadInstructions = document.getElementById('upload-instructions');
  uploadInstructions.innerHTML = 'Select one or more image files to upload.';

  const urlInput = document.getElementById('url-input');
  urlInput.classList.remove('is-hidden');

  const videoUploadContainer = document.getElementById('video-container');
  videoUploadContainer.classList.remove('is-hidden');
};

const setupImageCorpus = function () {
  const finput = document.getElementById('file-input');
  finput.removeAttribute('accept');
  finput.webkitdirectory = false;
  finput.multiple = true;

  const uploadSpan = document.getElementById('annotation-upload-span');
  uploadSpan.innerHTML = 'Upload image file(s)…';

  const uploadInstructions = document.getElementById('upload-instructions');
  uploadInstructions.innerHTML = 'Select one or more image files to upload.';

  const urlInput = document.getElementById('url-input');
  urlInput.classList.add('is-hidden');

  const videoUploadContainer = document.getElementById('video-container');
  videoUploadContainer.classList.remove('is-hidden');
};

const setupVideo = function () {
  const finput = document.getElementById('file-input');
  finput.accept = 'video/*';
  finput.webkitdirectory = false;
  finput.multiple = false;

  const uploadSpan = document.getElementById('annotation-upload-span');
  uploadSpan.innerHTML = 'Upload video file…';

  const uploadInstructions = document.getElementById('upload-instructions');
  uploadInstructions.innerHTML = 'Select a video file to upload.';

  const urlInput = document.getElementById('url-input');
  urlInput.classList.add('is-hidden');

  const videoUploadContainer = document.getElementById('video-container');
  videoUploadContainer.classList.add('is-hidden');
};

const setupAudioVideo = function () {
  const finput = document.getElementById('file-input');
  finput.accept = 'video/*,audio/*';
  finput.webkitdirectory = false;
  finput.multiple = false;

  const uploadSpan = document.getElementById('annotation-upload-span');
  uploadSpan.innerHTML = 'Upload video or audio file…';

  const uploadInstructions = document.getElementById('upload-instructions');
  uploadInstructions.innerHTML = 'Select an video or audio file to upload.';

  const urlInput = document.getElementById('url-input');
  urlInput.classList.add('is-hidden');

  const videoUploadContainer = document.getElementById('video-container');
  videoUploadContainer.classList.add('is-hidden');
};

export default class Annotation {
  setup() {
    this.worker = null;
    this.outputCnt = 0;
  }

  buildOutput() {}

  handleUpload(uploadInput) {}

  handleUrl(url) {}

  handleOutput(dt) {}

  handleDownload() {}

  handleExample() {}

  handleUploadVideo() {}

  handleInput(objUrl, caption, fname, index, inputLen) {}

  afterLoad() {}

  startWorkers() {}

  terminate() {
    handleReset();

    if (this.worker !== null) {
      this.worker.terminate();
    }
  }

  handleOnMessage() {
    this.worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        this.handleLoad(e.data);
      } else if (e.data.type === 'output') {
        this.outputCnt += 1;
        this.handleOutput(e.data);

        const proportionFinished = this.outputCnt / e.data.input.inputLen;
        document.getElementById('file-progress-run').value = 100 * (proportionFinished);

        const curTime = new Date().getTime() / 1000;
        const curDuration = (curTime - this.startTime);
        const estimatedTime = (curDuration / this.outputCnt) * (e.data.input.inputLen - this.outputCnt); 

        const timeLabel = document.getElementById('time-label');
        timeLabel.innerHTML = `Estimated time remaining: <strong>${estimatedTime.toFixed(1)}</strong> seconds.`;


        if (this.outputCnt >= e.data.input.inputLen) {
          this.handleDownload();
          this.handleResult();
        }
      } else if (e.data.type === 'output-text') {
        this.handleOutput(e.data);
      }
    };
  }

  loadModel() {
    document.getElementById('annotation-load').classList.add('is-loading');

    this.startWorkers();
    this.handleOnMessage();

    this.worker.postMessage({
      type: 'load',
      dtype: this.dtype,
      task: this.task,
      model: this.model,
    });
  }

  handleLoad(dt) {
    if (dt.progress.status === 'ready') {
      this.handleReady();
      this.afterLoad();
    }
    if (
      dt.progress.status === 'progress' &&
      dt.progress.file !== undefined &&
      dt.progress.file.slice(-4) === 'onnx'
    ) {
      document.getElementById('file-progress-load').value =
        dt.progress.progress;
    }
  }

  handleReady() {
    document.getElementById('annotation-load').classList.remove('is-loading');
    document.getElementById('annotation-load').classList.remove('is-success');
    document.getElementById('annotation-load').classList.remove('is-light');
    document.getElementById('annotation-load').disabled = true;
    document.getElementById('annotation-example').disabled = false;
    document.getElementById('annotation-example').classList.add('is-light');
    document.getElementById('annotation-example').classList.add('is-success');
    document.getElementById('annotation-upload').disabled = false;
    document.getElementById('annotation-upload').classList.add('is-light');
    document.getElementById('annotation-upload').classList.add('is-success');
  }

  handleRunModel() {
    this.handleRunning();
    this.outputCnt = 0;
    this.buildOutput();
  }

  makeExamples(modalExample) {
    getData('../../info/examples.json').then((dt) => {
      const exampleBody = document.getElementById('example-body');
      exampleBody.innerHTML = '';

      let itype2 = (this.itype === 'image-corpus') ? 'image' : this.itype;
      itype2 = (this.itype === 'audiovideo') ? 'video' : itype2;

      let dtFilter = dt;
      if (this.exampleNames !== null) {
        dtFilter = this.exampleNames.reduce((obj, key) => {
          if (key in dtFilter) {
            obj[key] = dtFilter[key];
          }
          return obj;
        }, {});
      }

      for (const [key, value] of Object.entries(dtFilter)) {
        if (value['type'] === itype2) {
          const article = document.createElement('article');
          article.className = 'media';
          const figure = document.createElement('figure');
          figure.className = 'media-left';
          const p = document.createElement('p');
          p.className = 'image is-128x128';
          const img = document.createElement('img');
          img.src = value.thm;
          article.appendChild(figure).appendChild(p).appendChild(img);

          const divMedia = document.createElement('div');
          divMedia.className = 'media-content';
          const divContent = document.createElement('div');
          divContent.className = 'content';
          const pEx = document.createElement('p');
          pEx.className = 'example-par';
          pEx.innerHTML = value.title + '<br />' + value.description;
          article.appendChild(divMedia).appendChild(divContent).appendChild(pEx);

          const divButton = document.createElement('div');
          divButton.className = 'buttons';
          const button = document.createElement('button');
          button.className = 'button is-small is-success btn-use-it';
          button.innerHTML = 'Use It';
          divContent.appendChild(divButton).appendChild(button);

          button.addEventListener('click', (e) => {
            this.handleRunModel();
            this.handleExample(value.short);
            modalExample.classList.remove('is-active');
          });

          if ('long' in value) {
            const buttonLong = document.createElement('button');
            buttonLong.className = 'button is-small is-success btn-use-it';
            buttonLong.innerHTML = 'Use It (long)';
            divButton.appendChild(buttonLong);
            buttonLong.addEventListener('click', (e) => {
              this.handleRunModel();
              this.handleExample(value.long);
              modalExample.classList.remove('is-active');
            });
          }

          const aExplore = document.createElement('a');
          aExplore.href = value.link;
          aExplore.target = '_blank';
          aExplore.rel = 'noopener noreferrer';
          const buttonExplore = document.createElement('button');
          buttonExplore.className = 'button is-small is-success is-light';
          buttonExplore.innerHTML = 'Explore the Collection';
          divButton.appendChild(aExplore).appendChild(buttonExplore);

          exampleBody.appendChild(article);
        }
      }
    });
  }

  handleRunning() {
    const timeLabel = document.getElementById('time-label');
    timeLabel.innerHTML = '';

    this.startTime = new Date().getTime() / 1000;
    const fileProgress = document.getElementById('file-progress-run');
    fileProgress.value = 0;

    document.getElementById('annotation-example').classList.add('is-loading');
    document.getElementById('annotation-upload').classList.add('is-loading');
    document.getElementById('annotation-download').classList.add('is-loading');
    document.getElementById('annotation-download').classList.add('is-light');
    document.getElementById('annotation-download').classList.add('is-success');

    document.getElementById('annotation-example').disabled = true;
    document.getElementById('annotation-upload').disabled = true;
    document.getElementById('annotation-download').disabled = true;
  }

  handleError () {
    this.handleResult();
    document.getElementById('annotation-download').disabled = true;
    document.getElementById('annotation-download').classList.remove('is-success');
  }

  handleResult() {
    this.endTime = new Date().getTime() / 1000;

    const timeLabel = document.getElementById('time-label');
    const timeDuration = (this.endTime - this.startTime).toFixed(1);
    timeLabel.innerHTML = `Finished in <strong>${timeDuration}</strong> seconds.`;

    document.getElementById('annotation-example').disabled = false;
    document.getElementById('annotation-upload').disabled = false;

    document.getElementById('annotation-download').disabled = false;
    document.getElementById('annotation-download').classList.add('is-success');
    document.getElementById('annotation-download').classList.add('is-light');
    document.getElementById('annotation-example').classList.remove('is-loading');
    document.getElementById('annotation-upload').classList.remove('is-loading');
    document.getElementById('annotation-download').classList.remove('is-loading');
  }

  run() {
    document.getElementById('annotation-title').innerHTML = this.title;
    document.getElementById('span-more-info').innerHTML = this.title;
    document.getElementById('python-link').href = this.pylink;

    // ensure that we are starting with a fresh version of the page
    this.terminate();
    this.buildOutput();

    // Load longer description of the model
    getData('../../info/' + this.name + '.json').then((dt) => {
      document.getElementById('annotation-description').innerHTML = dt.short;
      document.getElementById('modal-info-content').innerHTML = dt.long;
    });

    // setup elements based on the itype (video or image)
    if (this.itype === 'image') {
      setupImage();
    } else if (this.itype === 'image-corpus') {
      setupImageCorpus();
    } else if (this.itype === 'text') {
      setupText();
    } else if (this.itype === 'audiovideo') {
      setupAudioVideo();
    }else if (this.itype === 'video') {
      setupVideo();
    }

    // This removes all existing event listeners on these two nodes;
    // otherwise it will keep adding more listeners even if they are copies
    // see: https://stackoverflow.com/questions/4386300
    const annotationLoad = document.getElementById('annotation-load');
    const annotationExample = document.getElementById('annotation-example');
    const fileInput = document.getElementById('annotation-upload');
    annotationLoad.replaceWith(annotationLoad.cloneNode(true));
    annotationExample.replaceWith(annotationExample.cloneNode(true));
    fileInput.replaceWith(fileInput.cloneNode(true));

    let btnArray = [...document.getElementsByClassName('btn-use-it')];
    for (let i = 0; i < btnArray.length; i++) {
      btnArray[i].replaceWith(btnArray[i].cloneNode(true));
    }

    // NOTE: cannot reuse objects above (i.e., annotationLoad) because
    // they point to the previous versions of the nodes before cloning
    const modalExample = document.getElementById('modal-example');
    const modalUpload = document.getElementById('modal-upload');

    document
      .getElementById('annotation-load')
      .addEventListener('click', () => {
        this.loadModel();
      });

    document
      .getElementById('annotation-example')
      .addEventListener('click', () => {
        modalExample.classList.add('is-active');
      });

    this.makeExamples(modalExample);

    document
      .getElementById('file-input')
      .addEventListener('change', (e) => {
        this.handleRunModel();
        this.handleUpload(e);
        modalUpload.classList.remove('is-active');
    });

    document
      .getElementById('file-video-input')
      .addEventListener('change', (e) => {
        this.handleRunModel();
        this.handleUploadVideo(e);
        modalUpload.classList.remove('is-active');
    });

    document
      .getElementById('annotation-upload')
      .addEventListener('click', () => {
        modalUpload.classList.add('is-active');
      });

    document
      .getElementById('url-input')
      .addEventListener('keypress', (e) => {
        if (e.key === "Enter") {
          this.handleRunModel();
          this.handleUrl(document.getElementById('url-input').value);
          modalUpload.classList.remove('is-active');          
        }
    });
    
  }
}
