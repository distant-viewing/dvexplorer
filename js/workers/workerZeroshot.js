import {
  AutoTokenizer,
  SiglipTextModel,
  AutoProcessor,
  SiglipVisionModel,
  RawImage,
} from '../extern/transformers.min.js';

const loadModel = async function (msg) {
  const device = 'wasm';

  const tokenizer = AutoTokenizer.from_pretrained(
    'Xenova/siglip-base-patch16-224',
    {
      dtype: msg.dtype,
      device: device,
      progress_callback: (progress) => {
        postMessage({
          type: 'progress',
          progress: progress,
        });
      },
    },
  );
  const text_model = SiglipTextModel.from_pretrained(
    'Xenova/siglip-base-patch16-224',
    {
      dtype: msg.dtype,
      device: device,
      progress_callback: (progress) => {
        postMessage({
          type: 'progress',
          progress: progress,
        });
      },
    },
  );
  const processor = AutoProcessor.from_pretrained(
    'Xenova/siglip-base-patch16-224',
    {
      dtype: msg.dtype,
      device: device,
      progress_callback: (progress) => {
        postMessage({
          type: 'progress',
          progress: progress,
        });
      },
    },
  );
  const vision_model = SiglipVisionModel.from_pretrained(
    'Xenova/siglip-base-patch16-224',
    {
      dtype: msg.dtype,
      device: device,
      progress_callback: (progress) => {
        postMessage({
          type: 'progress',
          progress: progress,
        });
      },
    },
  );

  return Promise.all([tokenizer, text_model, processor, vision_model]);
};

const runPipeline = async function (msg) {
  if (modelPipeline !== null) {
    const [tokenizer, text_model, processor, vision_model] =
      await modelPipeline;

    const imgRaw = await RawImage.fromURL(msg.image);
    const image_inputs = await processor(imgRaw);
    const pooler_output2 = await vision_model(image_inputs);
    const vec = pooler_output2['pooler_output'].normalize(2, 1);

    postMessage(
      {
        type: 'output',
        input: msg,
        output: { data: vec.data.buffer, type: vec.type, dims: vec.dims },
      },
      [vec.data.buffer],
    );
  }
};

const runPipelineText = async function (msg) {
  if (modelPipeline !== null) {
    const [tokenizer, text_model, processor, vision_model] =
      await modelPipeline;

    const text_inputs = tokenizer([msg.text], {
      padding: 'max_length',
      truncation: true,
    });
    const { pooler_output } = await text_model(text_inputs);
    const vecText = pooler_output.normalize(2, 1);

    postMessage(
      {
        type: 'output-text',
        input: msg,
        output: {
          data: vecText.data.buffer,
          type: vecText.type,
          dims: vecText.dims,
        },
      },
      [vecText.data.buffer],
    );
  }
};

const runPipelineFake = function (msg) {
  postMessage({
    type: 'output',
    input: msg,
    output: null,
  });
};

let modelPipeline = null;

onmessage = (e) => {
  if (e.data.type === 'load') {
    modelPipeline = loadModel(e.data);
  }

  if (e.data.type === 'pipeline') {
    runPipeline(e.data);
  }

  if (e.data.type === 'pipeline-text') {
    runPipelineText(e.data);
  }

  if (e.data.type === 'pipeline-fake') {
    runPipelineFake(e.data);
  }
};
