import { pipeline, Pipeline, RawImage } from '../extern/transformers.min.js';

let lastBuffer;
let offscreen = null;
let gl = null;

const loadModel = async function () {
  postMessage({
    type: 'progress',
    file: 'onnx',
    progress: { status: 'ready', file: '.onnx', progress: 100 },
  });
  postMessage({
    type: 'progress',
    file: 'onnx',
    progress: { status: 'progress', file: '.onnx', progress: 100 },
  });
};

const runPipeline = async function (msg) {
  postMessage({
    type: 'output',
    input: msg,
    output: null,
  });
};

onmessage = (e) => {
  if (e.data.type === 'load') {
    loadModel();
  }

  if (e.data.type === 'pipeline') {
    runPipeline(e.data);
  }
};
