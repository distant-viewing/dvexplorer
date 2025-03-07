import { pipeline, Pipeline, RawImage } from '../extern/transformers.min.js';

const loadModel = async function (msg) {
  const device = 'wasm';

  const modelSettings = {
    dtype: msg.dtype,
    device: device,
    progress_callback: (progress) => {
      postMessage({
        type: 'progress',
        progress: progress,
      });
    },
  };

  const modelObj = await pipeline(msg.task, msg.model, modelSettings);
  return modelObj;
};

const runPipeline = function (msg) {
  if (modelPipeline !== null) {
    modelPipeline.then((model) => {
      model(msg.image, msg.modelOpts).then((output) => {
        const depth = { ...output.depth };
        postMessage({
          type: 'output',
          input: msg,
          output: depth,
        });
      });
    }).catch(
      (error) => {
        console.log("Model Error (returning no data):", error);
        postMessage({
          type: 'output',
          input: msg,
          output: null,
        });
      }
    );
  }
};

let modelPipeline = null;

onmessage = (e) => {
  if (e.data.type === 'load') {
    modelPipeline = loadModel(e.data);
  }

  if (e.data.type === 'pipeline') {
    runPipeline(e.data);
  }
};
