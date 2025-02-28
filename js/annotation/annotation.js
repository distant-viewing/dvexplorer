/**
 * Constants for common CSS classes and element IDs
 */
const CLASSES = {
  LOADING: 'is-loading',
  SUCCESS: 'is-success',
  LIGHT: 'is-light',
  HIDDEN: 'is-hidden'
};

const ELEMENTS = {
  LOAD_BUTTON: 'annotation-load',
  EXAMPLE_BUTTON: 'annotation-example',
  UPLOAD_BUTTON: 'annotation-upload',
  DOWNLOAD_BUTTON: 'annotation-download',
  PROGRESS_LOAD: 'file-progress-load',
  PROGRESS_RUN: 'file-progress-run',
  TIME_LABEL: 'time-label',
  FILE_INPUT: 'file-input',
  VIDEO_INPUT: 'file-video-input',
  OPTIONS: 'annotation-options',
  UPLOAD_SPAN: 'annotation-upload-span',
  INSTRUCTIONS: 'upload-instructions',
  URL_INPUT: 'url-input',
  VIDEO_CONTAINER: 'video-container',
  TITLE: 'annotation-title',
  SPAN_MORE_INFO: 'span-more-info',
  PYTHON_LINK: 'python-link',
  DESCRIPTION: 'annotation-description',
  MODAL_CONTENT: 'modal-info-content',
  EXAMPLE_BODY: 'example-body',
  OUTPUT: 'annotation-output'
};

/**
 * Setup configurations for different input types
 */
const SETUP_CONFIGS = {
  text: {
    accept: '.txt',
    webkitdirectory: false,
    multiple: false,
    uploadSpanText: 'Upload text file…',
    instructionsText: 'Select a text file to upload, with one entry on each line.',
    showUrlInput: false,
    showVideoContainer: false
  },
  image: {
    accept: 'image/*',
    webkitdirectory: false,
    multiple: true,
    uploadSpanText: 'Upload image file(s)…',
    instructionsText: 'Select one or more image files to upload.',
    showUrlInput: true,
    showVideoContainer: true
  },
  'image-corpus': {
    accept: '',
    webkitdirectory: false,
    multiple: true,
    uploadSpanText: 'Upload image file(s)…',
    instructionsText: 'Select one or more image files to upload.',
    showUrlInput: false,
    showVideoContainer: true
  },
  video: {
    accept: 'video/*',
    webkitdirectory: false,
    multiple: false,
    uploadSpanText: 'Upload video file…',
    instructionsText: 'Select a video file to upload.',
    showUrlInput: false,
    showVideoContainer: false
  },
  audiovideo: {
    accept: 'video/*,audio/*',
    webkitdirectory: false,
    multiple: false,
    uploadSpanText: 'Upload video or audio file…',
    instructionsText: 'Select an video or audio file to upload.',
    showUrlInput: false,
    showVideoContainer: false
  }
};

import { getData } from '../utils/utils.js';
import DOMUtils from '../utils/domutils.js';

/**
 * Resets the UI state
 */
const handleReset = function() {
  DOMUtils.setElementHTML(ELEMENTS.OPTIONS, '');
  DOMUtils.getElement(ELEMENTS.PROGRESS_LOAD).value = 0;
  DOMUtils.getElement(ELEMENTS.PROGRESS_RUN).value = 0;
  
  // Reset load button
  DOMUtils.setElementEnabled(ELEMENTS.LOAD_BUTTON, true);
  DOMUtils.toggleElementClass(ELEMENTS.LOAD_BUTTON, CLASSES.SUCCESS, true);
  DOMUtils.toggleElementClass(ELEMENTS.LOAD_BUTTON, CLASSES.LIGHT, true);
  
  // Reset example button
  DOMUtils.setElementEnabled(ELEMENTS.EXAMPLE_BUTTON, false);
  DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.LIGHT, false);
  DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.LOADING, false);
  DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.SUCCESS, false);
  
  // Reset upload button
  DOMUtils.setElementEnabled(ELEMENTS.UPLOAD_BUTTON, false);
  DOMUtils.toggleElementClass(ELEMENTS.UPLOAD_BUTTON, CLASSES.LIGHT, false);
  DOMUtils.toggleElementClass(ELEMENTS.UPLOAD_BUTTON, CLASSES.LOADING, false);
  
  // Reset download button
  DOMUtils.setElementEnabled(ELEMENTS.DOWNLOAD_BUTTON, false);
  DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.LIGHT, false);
  DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.SUCCESS, false);
};

/**
 * Setup interface for a specific input type
 * @param {string} type - Input type (text, image, video, etc.)
 */
const setupInterface = function(type) {
  const config = SETUP_CONFIGS[type];
  if (!config) {
    console.error(`Unknown input type: ${type}`);
    return;
  }
  
  const fileInput = DOMUtils.getElement(ELEMENTS.FILE_INPUT);
  
  if (config.accept) {
    fileInput.accept = config.accept;
  } else {
    DOMUtils.removeElementAttribute(ELEMENTS.FILE_INPUT, 'accept');
  }
  
  fileInput.webkitdirectory = config.webkitdirectory;
  fileInput.multiple = config.multiple;
  
  DOMUtils.setElementHTML(ELEMENTS.UPLOAD_SPAN, config.uploadSpanText);
  DOMUtils.setElementHTML(ELEMENTS.INSTRUCTIONS, config.instructionsText);
  
  // Toggle visibility of URL input and video container
  DOMUtils.toggleElementClass(ELEMENTS.URL_INPUT, CLASSES.HIDDEN, !config.showUrlInput);
  DOMUtils.toggleElementClass(ELEMENTS.VIDEO_CONTAINER, CLASSES.HIDDEN, !config.showVideoContainer);
};

/**
 * Base class for annotations
 */
export default class Annotation {
  /**
   * Initialize class properties
   */
  setup() {
    this.worker = null;
    this.outputCnt = 0;
    this.startTime = 0;
    this.endTime = 0;
  }

  /**
   * Build output container - to be implemented by subclasses
   */
  buildOutput() {}

  /**
   * Handle file upload - to be implemented by subclasses
   * @param {Event} uploadInput - Upload input event
   */
  handleUpload(uploadInput) {}

  /**
   * Handle URL input - to be implemented by subclasses
   * @param {string} url - URL to process
   */
  handleUrl(url) {}

  /**
   * Handle output data - to be implemented by subclasses
   * @param {Object} data - Output data
   */
  handleOutput(data) {}

  /**
   * Handle download action - to be implemented by subclasses
   */
  handleDownload() {}

  /**
   * Handle example selection - to be implemented by subclasses
   * @param {Object} example - Example data
   */
  handleExample() {}

  /**
   * Handle video upload - to be implemented by subclasses
   * @param {Event} uploadInput - Upload input event
   */
  handleUploadVideo() {}

  /**
   * Handle input processing - to be implemented by subclasses
   * @param {string} objUrl - Object URL
   * @param {string} caption - Caption
   * @param {string} fname - File name
   * @param {number} index - Index
   * @param {number} inputLen - Input length
   */
  handleInput(objUrl, caption, fname, index, inputLen) {}

  /**
   * Actions to perform after model is loaded - to be implemented by subclasses
   */
  afterLoad() {}

  /**
   * Start web workers - to be implemented by subclasses
   */
  startWorkers() {}

  /**
   * Terminate workers and reset UI
   */
  terminate() {
    handleReset();

    if (this.worker !== null) {
      this.worker.terminate();
    }
  }

  /**
   * Set up message handlers for the worker
   */
  handleOnMessage() {
    this.worker.onmessage = (event) => {
      const data = event.data;
      
      if (data.type === 'progress') {
        this.handleLoad(data);
      } else if (data.type === 'output') {
        this.outputCnt += 1;
        this.handleOutput(data);

        const proportionFinished = this.outputCnt / data.input.inputLen;
        DOMUtils.getElement(ELEMENTS.PROGRESS_RUN).value = 100 * proportionFinished;

        const curTime = new Date().getTime() / 1000;
        const curDuration = (curTime - this.startTime);
        const estimatedTime = (curDuration / this.outputCnt) * (data.input.inputLen - this.outputCnt); 

        DOMUtils.setElementHTML(
          ELEMENTS.TIME_LABEL, 
          `Estimated time remaining: <strong>${estimatedTime.toFixed(1)}</strong> seconds.`
        );

        if (this.outputCnt >= data.input.inputLen) {
          this.handleDownload();
          this.handleResult();
        }
      } else if (data.type === 'output-text') {
        this.handleOutput(data);
      }
    };
  }

  /**
   * Load the model
   */
  loadModel() {
    DOMUtils.toggleElementClass(ELEMENTS.LOAD_BUTTON, CLASSES.LOADING, true);

    this.startWorkers();
    this.handleOnMessage();

    this.worker.postMessage({
      type: 'load',
      dtype: this.dtype,
      task: this.task,
      model: this.model,
    });
  }

  /**
   * Handle loading progress
   * @param {Object} data - Progress data
   */
  handleLoad(data) {
    if (data.progress.status === 'ready') {
      this.handleReady();
      this.afterLoad();
    }
    
    if (
      data.progress.status === 'progress' &&
      data.progress.file !== undefined &&
      data.progress.file.slice(-4) === 'onnx'
    ) {
      DOMUtils.getElement(ELEMENTS.PROGRESS_LOAD).value = data.progress.progress;
    }
  }

  /**
   * Handle model ready state
   */
  handleReady() {
    // Update load button
    DOMUtils.toggleElementClass(ELEMENTS.LOAD_BUTTON, CLASSES.LOADING, false);
    DOMUtils.toggleElementClass(ELEMENTS.LOAD_BUTTON, CLASSES.SUCCESS, false);
    DOMUtils.toggleElementClass(ELEMENTS.LOAD_BUTTON, CLASSES.LIGHT, false);
    DOMUtils.setElementEnabled(ELEMENTS.LOAD_BUTTON, false);
    
    // Update example button
    DOMUtils.setElementEnabled(ELEMENTS.EXAMPLE_BUTTON, true);
    DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.LIGHT, true);
    DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.SUCCESS, true);
    
    // Update upload button
    DOMUtils.setElementEnabled(ELEMENTS.UPLOAD_BUTTON, true);
    DOMUtils.toggleElementClass(ELEMENTS.UPLOAD_BUTTON, CLASSES.LIGHT, true);
    DOMUtils.toggleElementClass(ELEMENTS.UPLOAD_BUTTON, CLASSES.SUCCESS, true);
  }

  /**
   * Handle model execution
   */
  handleRunModel() {
    this.handleRunning();
    this.outputCnt = 0;
    this.buildOutput();
  }

  /**
   * Create example items
   * @param {HTMLElement} modalExample - Example modal element
   */
  makeExamples(modalExample) {
    getData('../../info/examples.json')
      .then((data) => {
        const exampleBody = DOMUtils.getElement(ELEMENTS.EXAMPLE_BODY);
        exampleBody.innerHTML = '';
        
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Determine the input type to filter examples
        let inputType = (this.itype === 'image-corpus') ? 'image' : this.itype;
        inputType = (this.itype === 'audiovideo') ? 'video' : inputType;

        // Filter data if exampleNames is provided
        let filteredData = data;
        if (this.exampleNames !== null) {
          filteredData = this.exampleNames.reduce((obj, key) => {
            if (key in filteredData) {
              obj[key] = filteredData[key];
            }
            return obj;
          }, {});
        }

        // Loop through and create example elements
        for (const [key, value] of Object.entries(filteredData)) {
          if (value.type === inputType) {
            const article = this.createExampleElement(value, modalExample);
            fragment.appendChild(article);
          }
        }
        
        exampleBody.appendChild(fragment);
      })
      .catch(error => {
        console.error('Error loading examples:', error);
      });
  }

  /**
   * Create a single example element
   * @param {Object} example - Example data
   * @param {HTMLElement} modalExample - Example modal element
   * @returns {HTMLElement} - Created article element
   */
  createExampleElement(example, modalExample) {
    // Create article container
    const article = DOMUtils.createElement('article');
    article.className = 'media';
    
    // Create image figure
    const figure = DOMUtils.createElement('figure');
    figure.className = 'media-left';
    const p = DOMUtils.createElement('p');
    p.className = 'image is-128x128';
    const img = DOMUtils.createElement('img');
    img.src = example.thm;
    article.appendChild(figure).appendChild(p).appendChild(img);

    // Create content section
    const divMedia = DOMUtils.createElement('div');
    divMedia.className = 'media-content';
    const divContent = DOMUtils.createElement('div');
    divContent.className = 'content';
    const pEx = DOMUtils.createElement('p');
    pEx.className = 'example-par';
    pEx.innerHTML = example.title + '<br />' + example.description;
    article.appendChild(divMedia).appendChild(divContent).appendChild(pEx);

    // Create buttons container
    const divButton = DOMUtils.createElement('div');
    divButton.className = 'buttons';
    divContent.appendChild(divButton);
    
    // Add "Use It" button
    const button = DOMUtils.createElement('button');
    button.className = 'button is-small is-success btn-use-it';
    button.innerHTML = 'Use It';
    divButton.appendChild(button);

    button.addEventListener('click', () => {
      this.handleRunModel();
      this.handleExample(example.short);
      modalExample.classList.remove('is-active');
    });

    // Add "Use It (long)" button if long example exists
    if ('long' in example) {
      const buttonLong = DOMUtils.createElement('button');
      buttonLong.className = 'button is-small is-success btn-use-it';
      buttonLong.innerHTML = 'Use It (long)';
      divButton.appendChild(buttonLong);
      
      buttonLong.addEventListener('click', () => {
        this.handleRunModel();
        this.handleExample(example.long);
        modalExample.classList.remove('is-active');
      });
    }

    // Add "Explore the Collection" button
    const aExplore = DOMUtils.createElement('a');
    aExplore.href = example.link;
    aExplore.target = '_blank';
    aExplore.rel = 'noopener noreferrer';
    const buttonExplore = DOMUtils.createElement('button');
    buttonExplore.className = 'button is-small is-success is-light';
    buttonExplore.innerHTML = 'Explore the Collection';
    aExplore.appendChild(buttonExplore);
    divButton.appendChild(aExplore);

    return article;
  }

  /**
   * Handle running state
   */
  handleRunning() {
    DOMUtils.setElementHTML(ELEMENTS.TIME_LABEL, '');

    this.startTime = new Date().getTime() / 1000;
    DOMUtils.getElement(ELEMENTS.PROGRESS_RUN).value = 0;

    // Update button states
    DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.LOADING, true);
    DOMUtils.toggleElementClass(ELEMENTS.UPLOAD_BUTTON, CLASSES.LOADING, true);
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.LOADING, true);
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.LIGHT, true);
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.SUCCESS, true);

    DOMUtils.setElementEnabled(ELEMENTS.EXAMPLE_BUTTON, false);
    DOMUtils.setElementEnabled(ELEMENTS.UPLOAD_BUTTON, false);
    DOMUtils.setElementEnabled(ELEMENTS.DOWNLOAD_BUTTON, false);
  }

  /**
   * Handle errors
   */
  handleError() {
    this.handleResult();
    DOMUtils.setElementEnabled(ELEMENTS.DOWNLOAD_BUTTON, false);
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.SUCCESS, false);
  }

  /**
   * Handle completion
   */
  handleResult() {
    this.endTime = new Date().getTime() / 1000;

    const timeDuration = (this.endTime - this.startTime).toFixed(1);
    DOMUtils.setElementHTML(
      ELEMENTS.TIME_LABEL,
      `Finished in <strong>${timeDuration}</strong> seconds.`
    );

    // Re-enable buttons
    DOMUtils.setElementEnabled(ELEMENTS.EXAMPLE_BUTTON, true);
    DOMUtils.setElementEnabled(ELEMENTS.UPLOAD_BUTTON, true);
    DOMUtils.setElementEnabled(ELEMENTS.DOWNLOAD_BUTTON, true);
    
    // Update button states
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.SUCCESS, true);
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.LIGHT, true);
    DOMUtils.toggleElementClass(ELEMENTS.EXAMPLE_BUTTON, CLASSES.LOADING, false);
    DOMUtils.toggleElementClass(ELEMENTS.UPLOAD_BUTTON, CLASSES.LOADING, false);
    DOMUtils.toggleElementClass(ELEMENTS.DOWNLOAD_BUTTON, CLASSES.LOADING, false);
  }

  /**
   * Run the annotation
   */
  run() {
    try {
      // Set title and description
      DOMUtils.setElementHTML(ELEMENTS.TITLE, this.title);
      DOMUtils.setElementHTML(ELEMENTS.SPAN_MORE_INFO, this.title);
      DOMUtils.getElement(ELEMENTS.PYTHON_LINK).href = this.pylink;

      // Ensure we start with a fresh page
      this.terminate();
      this.buildOutput();

      // Load model description
      getData(`../../info/${this.name}.json`)
        .then(data => {
          DOMUtils.setElementHTML(ELEMENTS.DESCRIPTION, data.short);
          DOMUtils.setElementHTML(ELEMENTS.MODAL_CONTENT, data.long);
        })
        .catch(error => {
          console.error('Error loading description:', error);
        });

      // Set up interface based on input type
      setupInterface(this.itype);

      // Clone elements to remove existing event listeners
      const annotationLoad = DOMUtils.replaceElementWithClone(ELEMENTS.LOAD_BUTTON);
      const annotationExample = DOMUtils.replaceElementWithClone(ELEMENTS.EXAMPLE_BUTTON);
      const fileInput = DOMUtils.replaceElementWithClone(ELEMENTS.UPLOAD_BUTTON);
      
      // Replace "Use It" buttons
      const useItButtons = DOMUtils.getElementsByClass('btn-use-it');
      for (let i = 0; i < useItButtons.length; i++) {
        useItButtons[i].replaceWith(useItButtons[i].cloneNode(true));
      }

      // Get modal elements
      const modalExample = DOMUtils.getElement('modal-example');
      const modalUpload = DOMUtils.getElement('modal-upload');

      // Set up event listeners
      DOMUtils.getElement(ELEMENTS.LOAD_BUTTON).addEventListener('click', () => {
        this.loadModel();
      });

      DOMUtils.getElement(ELEMENTS.EXAMPLE_BUTTON).addEventListener('click', () => {
        modalExample.classList.add('is-active');
      });

      this.makeExamples(modalExample);

      DOMUtils.getElement(ELEMENTS.FILE_INPUT).addEventListener('change', (event) => {
        this.handleRunModel();
        this.handleUpload(event);
        modalUpload.classList.remove('is-active');
      });

      DOMUtils.getElement(ELEMENTS.VIDEO_INPUT).addEventListener('change', (event) => {
        this.handleRunModel();
        this.handleUploadVideo(event);
        modalUpload.classList.remove('is-active');
      });

      DOMUtils.getElement(ELEMENTS.UPLOAD_BUTTON).addEventListener('click', () => {
        modalUpload.classList.add('is-active');
      });

      DOMUtils.getElement(ELEMENTS.URL_INPUT).addEventListener('keypress', (event) => {
        if (event.key === "Enter") {
          this.handleRunModel();
          this.handleUrl(DOMUtils.getElement(ELEMENTS.URL_INPUT).value);
          modalUpload.classList.remove('is-active');          
        }
      });
    } catch (error) {
      console.error('Error running annotation:', error);
    }
  }
}
