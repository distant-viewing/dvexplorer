import {
  AutoProcessor,
  AutoModelForAudioFrameClassification,
} from '../extern/transformers.min.js';

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

  const model_id = 'onnx-community/pyannote-segmentation-3.0';
  const model = await AutoModelForAudioFrameClassification.from_pretrained(
    model_id,
    modelSettings,
  );
  const processor = AutoProcessor.from_pretrained(model_id, modelSettings);
  return Promise.all([model, processor]);
};

const runPipeline = async function (msg) {
  const [model, processor] = await modelPipeline;

  try {
    const inputs = await processor(msg.image);
    const { logits } = await model(inputs);
    const segments = processor.post_process_speaker_diarization(
      logits,
      msg.image.length,
    )[0];

    for (const segment of segments) {
      segment.label = model.config.id2label[segment.id];
    }

    postMessage({
      type: 'output',
      input: msg,
      output: segments,
    });
  } catch (error) {
    console.log("Model Error (returning no data):", error);
    postMessage({
      type: 'output',
      input: msg,
      output: null,
    });
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
