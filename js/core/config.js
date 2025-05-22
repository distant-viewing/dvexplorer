/**
 * Central configuration for the Distant Viewing Explorer
 */

export const CONFIG = {
  // API endpoints and paths
  PATHS: {
    INFO: '../../info',
    EXAMPLES: '../../info/examples.json',
    WORKERS: '../workers',
    ASSETS: {
      IMAGES: '../../img',
      VIDEOS: '../../video',
      ICONS: '../../icon'
    }
  },

  // Model configurations
  MODELS: {
    DEFAULT_DTYPE: 'q8',
    TIMEOUT_MS: 30000,
    MAX_RETRIES: 3
  },

  // UI constants
  UI: {
    CLASSES: {
      LOADING: 'is-loading',
      SUCCESS: 'is-success',
      ERROR: 'is-danger',
      LIGHT: 'is-light',
      HIDDEN: 'is-hidden',
      ACTIVE: 'is-active'
    },
    
    ELEMENTS: {
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
    },

    // Input type configurations
    INPUT_TYPES: {
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
    }
  },

  // Error messages
  ERRORS: {
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    FILE_LOAD_ERROR: 'Failed to load file. Please try again.',
    MODEL_LOAD_ERROR: 'Failed to load AI model. Please refresh and try again.',
    INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
    WORKER_ERROR: 'Processing error occurred. Please try again.',
    GENERIC_ERROR: 'An unexpected error occurred. Please refresh and try again.'
  }
};

export default CONFIG;