import Annotation from './annotation.js';
import { extractAudioData } from '../utils/tutils.js';

export default class TranscriptionAnnotation extends Annotation {
  section = 'menu-video';
  name = 'transcription';
  title = '3.2 Transcription';
  dtype = 'q8';
  task = 'automatic-speech-recognition';
  model = 'Xenova/whisper-base';
  itype = 'audiovideo';
  pylink = 'https://distantviewing.org/dvscripts/3.2_transcription.html';
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

    const outputTranscription = document.createElement('p');
    outputTranscription.id = 'output-transcription';
    outputTranscription.className = 'pt-4';

    output.appendChild(outputTranscription);
  }

  afterLoad() {
    document.getElementById('select-lang').disabled = false;
  }

  startWorkers() {
    if (this.worker !== null) {
      this.worker.terminate();
    }

    this.worker = new Worker(
      new URL('../workers/worker.js', import.meta.url),
      {
        type: 'module',
      },
    );

    const opts = document.getElementById('annotation-options');
    opts.innerHTML = '';
    const langSelect = document.createElement('div');
    langSelect.classList = 'language-select';
    const labelSpan = document.createElement('div');
    labelSpan.classList = 'select-label';
    labelSpan.innerHTML = 'Select language:';
    const selectElem = document.createElement('select');
    selectElem.classList = 'select';
    selectElem.name = 'lang';
    selectElem.id = 'select-lang';

    opts.appendChild(langSelect).appendChild(labelSpan);
    langSelect.appendChild(selectElem);

    for (const [key, value] of Object.entries(LANGUAGES)) {
      const op = document.createElement('option');
      op.value = key;
      op.innerHTML = value;
      selectElem.appendChild(op);
    }
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

  async handleUrl(value) {
    this.dataToDownload = {};

    this.handleInput(
      value,
      value,
      value,
      0,
      1,
    );
  }

  async handleInput(objUrl, caption, fname, index, inputLen) {
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.src = objUrl;
    videoPlayer.play();

    const audioData = await extractAudioData(objUrl);
    const dropdown = document.getElementById('select-lang');
    const lang = dropdown.value;

    this.worker.postMessage({
      type: 'pipeline',
      image: audioData,
      modelOpts: {
        return_timestamps: 'word',
        chunk_length_s: 30,
        stride_length_s: 5,
        language: lang,
        task: 'transcribe',
      },
      fileName: fname,
      index: 0,
      inputLen: 1,
    });

    dropdown.disabled = true;
    dropdown.value = lang;
  }

  handleOutput(dt) {
    if (dt.output === null) {
      return;
    }
    
    const outTrans = document.getElementById('output-transcription');
    const ch = dt.output.chunks;

    let outText = '';
    for (let i = 0; i < ch.length; i++) {
      outText += `<span class='seek' title='${ch[i].timestamp[0]} &rarr; ${ch[i].timestamp[1]}'`;
      outText += `data-timestamp="${ch[i].timestamp[0]}">`;
      outText += ch[i].text + '</span>';
    }
    outTrans.innerHTML = outText;

    const videoPlayer = document.getElementById('videoPlayer');
    const spanObjs = [...document.getElementsByClassName('seek')];

    spanObjs.forEach((span) => {
      span.addEventListener('click', () => {
        const timestamp = span.getAttribute('data-timestamp');
        videoPlayer.currentTime = parseFloat(timestamp);
        videoPlayer.play();
      });
    });

    this.dataToDownload[dt.input.fileName] = ch;
  }

  handleDownload() {

    const rows = [];
    Object.entries(this.dataToDownload).forEach(([path, segments]) => {
      segments.forEach(({ text, timestamp }) => {
        const [start, end] = timestamp;
        rows.push([path, text.trim(), start, end]);
      });
    });

    const headers = ["path", "text", "start", "end"];
    const csvWithHeaders = [headers, ...rows.map(row => row.map(value => `"${value}"`).join(","))].join("\n");

    document.getElementById('select-lang').disabled = false;
    document
      .getElementById('annotation-download')
      .addEventListener('click', () => {
        const blob = new Blob([csvWithHeaders], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'data.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }
}

const LANGUAGES = {
  en: 'English',
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  as: 'Assamese',
  az: 'Azerbaijani',
  ba: 'Bashkir',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bs: 'Bosnian',
  br: 'Breton',
  bg: 'Bulgarian',
  ca: 'Catalan / Valencian',
  zh: 'Chinese',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch / Flemish',
  et: 'Estonian',
  fo: 'Faroese',
  fi: 'Finnish',
  fr: 'French',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole / Haitian',
  ha: 'Hausa',
  haw: 'Hawaiian',
  he: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  is: 'Icelandic',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  jw: 'Javanese',
  kn: 'Kannada',
  kk: 'Kazakh',
  km: 'Khmer',
  ko: 'Korean',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  ln: 'Lingala',
  lt: 'Lithuanian',
  lb: 'Luxembourgish / Letzeburgesch',
  mk: 'Macedonian',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mi: 'Maori',
  mr: 'Marathi',
  mn: 'Mongolian',
  my: 'Myanmar / Burmese',
  ne: 'Nepali',
  no: 'Norwegian',
  nn: 'Nynorsk',
  oc: 'Occitan',
  ps: 'Pashto / Pushto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi / Panjabi',
  ro: 'Romanian / Moldavian / Moldovan',
  ru: 'Russian',
  sa: 'Sanskrit',
  sr: 'Serbian',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala / Sinhalese',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish / Castilian',
  su: 'Sundanese',
  sw: 'Swahili',
  sv: 'Swedish',
  tl: 'Tagalog',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  bo: 'Tibetan',
  tr: 'Turkish',
  tk: 'Turkmen',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  cy: 'Welsh',
  yi: 'Yiddish',
  yo: 'Yoruba',
};
