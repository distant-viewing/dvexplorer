/**
 * Worker script for model loading and inference
 * Handles pipeline operations in a separate thread
 */
import { pipeline, Pipeline, RawImage } from '../extern/transformers.min.js';

/**
 * Message types for worker communication
 */
const MESSAGE_TYPES = {
  LOAD: 'load',
  PIPELINE: 'pipeline',
  PIPELINE_FAKE: 'pipeline-fake',
  PROGRESS: 'progress',
  OUTPUT: 'output'
};

/**
 * Default configuration values
 */
const DEFAULTS = {
  DEVICE: 'wasm'
};

// Store the model pipeline promise
let modelPipeline = null;

/**
 * Load a model based on task and configuration
 * @param {Object} config - Configuration object containing task, model, and dtype
 * @returns {Promise<Pipeline>} - Promise resolving to the loaded model pipeline
 */
const loadModel = async function(config) {
  // Handle the case where no task is specified
  if (!config.task) {
    sendProgressUpdate({ 
      status: 'ready', 
      file: '.onnx', 
      progress: 100 
    });
    
    sendProgressUpdate({ 
      status: 'progress', 
      file: '.onnx', 
      progress: 100 
    });
    
    return null;
  }

  // Configure model settings
  const modelSettings = {
    dtype: config.dtype,
    device: DEFAULTS.DEVICE,
    progress_callback: (progress) => {
      sendProgressUpdate(progress);
    }
  };

  try {
    // Load the model pipeline
    const modelObj = await pipeline(config.task, config.model, modelSettings);
    return modelObj;
  } catch (error) {
    console.error('Error loading model:', error);
    sendProgressUpdate({ 
      status: 'error', 
      error: error.message 
    });
    return null;
  }
};

/**
 * Send a progress update message to the main thread
 * @param {Object} progress - Progress information
 */
function sendProgressUpdate(progress) {
  postMessage({
    type: MESSAGE_TYPES.PROGRESS,
    progress: progress
  });
}

/**
 * Send output data back to the main thread
 * @param {Object} inputData - Original input data
 * @param {Object|null} outputData - Processing results
 */
function sendOutput(inputData, outputData) {
  postMessage({
    type: MESSAGE_TYPES.OUTPUT,
    input: inputData,
    output: outputData
  });
}

/**
 * Run the model pipeline with the given input
 * @param {Object} inputData - Data containing image and model options
 */
const runPipeline = function(inputData) {
  if (!modelPipeline) {
    console.error('No model pipeline available');
    sendOutput(inputData, null);
    return;
  }

  modelPipeline.then(model => {
    if (!model) {
      console.warn('Model failed to load');
      sendOutput(inputData, null);
      return;
    }

    model(inputData.image, inputData.modelOpts)
      .then(output => {
        sendOutput(inputData, output);
      })
      .catch(error => {
        console.error("Model inference error:", error);
        sendOutput(inputData, null);
      });
  });
};

/**
 * Run a fake pipeline that returns null output
 * @param {Object} inputData - Input data
 */
const runPipelineFake = function(inputData) {
  sendOutput(inputData, null);
};

/**
 * Message handler for worker thread
 */
onmessage = (event) => {
  const data = event.data;
  
  switch (data.type) {
    case MESSAGE_TYPES.LOAD:
      modelPipeline = loadModel(data);
      break;
      
    case MESSAGE_TYPES.PIPELINE:
      runPipeline(data);
      break;
      
    case MESSAGE_TYPES.PIPELINE_FAKE:
      runPipelineFake(data);
      break;
      
    default:
      console.warn(`Unknown message type: ${data.type}`);
  }
};