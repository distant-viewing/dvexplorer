import Annotation from './annotation.js';
import { renderBox } from '../utils/tutils.js';

import { RawImage } from '../extern/transformers.min.js';

export default class StarsAnnotation extends Annotation {
  section = 'menu-text';
  name = 'stars';
  title = '4.2 Review Prediction';
  dtype = 'q8';
  task = 'sentiment-analysis';
  model = 'Xenova/bert-base-multilingual-uncased-sentiment';
  itype = 'text';
  pylink = 'https://distantviewing.org/dvscripts/review.html';
  dataToDownload = {};
  exampleNames = ['afi', 'sotu-text', 'amazon', 'macron-text'];

  constructor() {
    super();
    this.setup();
  }

  buildOutput() {
    const output = document.getElementById('annotation-output');
    output.innerHTML = '';

    const searchControl = document.createElement('div');
    const searchBar = document.createElement('input');

    searchControl.id = 'search-bar-control';
    searchControl.className = 'control mx-6 my-3';
    searchBar.id = 'search-bar';
    searchBar.className = 'input is-success';
    searchBar.type = 'text';
    searchBar.placeholder = 'input text';
    searchBar.disabled = true;

    output.appendChild(searchControl).appendChild(searchBar);

    document.getElementById('search-bar').addEventListener('keypress', (e) => {
      if (this.worker !== null) {
        this.handleManualInput(e);
      } else {
      }
    });
  }

  afterLoad() {
    this.startTime = new Date().getTime() / 1000;
    this.dataToDownload = { manualInput: [] };
    document.getElementById('search-bar').disabled = false;
    this.handleInput(
      'This is the best movie I have ever seen!',
      '',
      'manualInput',
      0,
      1,
    );
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
  }

  async handleManualInput(e) {
    this.dataToDownload = { manualInput: [] };

    if (e.key === 'Enter') {
      this.handleRunning();

      [...document.getElementsByClassName('output-paragraph')].forEach(
        (element) => {
          element.remove();
        },
      );
      [...document.getElementsByClassName('output-result-classify')].forEach(
        (element) => {
          element.remove();
        },
      );

      this.handleInput(
        document.getElementById('search-bar').value,
        '',
        'manualInput',
        0,
        1,
      );

      //document.getElementById("search-bar").disabled = true;
      //setClass(document.getElementById("search-bar-control"), "is-loading", true);
    }
  }

  async handleUpload(uploadInput) {
    this.dataToDownload = {};
    const reader = new FileReader();

    reader.onload = (e) => {
      let lines = e.target.result.split('\n');
      lines = lines.filter((s) => (s !== ""));
      this.dataToDownload[uploadInput.target.files[0].name] = Array.apply(
        null,
        Array(lines.length),
      ).map(function () {});

      for (let i = 0; i < lines.length; i++) {
        this.handleInput(
          lines[i],
          lines[i],
          uploadInput.target.files[0].name,
          i,
          lines.length,
        );
      }
    };

    reader.readAsText(uploadInput.target.files[0]);
  }

  async handleExample(value) {
    this.dataToDownload = {};

    fetch(value[0].url)
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        let lines = data.split('\n');
        lines = lines.filter((s) => (s !== ""));
        this.dataToDownload[value[0].url] = Array.apply(
          null,
          Array(lines.length),
        ).map(function () {});

        for (let i = 0; i < lines.length; i++) {
          this.handleInput(lines[i], lines[i], value[0].url, i, lines.length);
        }
      });
  }

  async handleInput(objUrl, caption, fname, index, inputLen) {
    const output = document.getElementById('annotation-output');

    const par = document.createElement('p');
    const spRes = document.createElement('span');

    par.className = 'output-paragraph';
    spRes.className = 'output-result-classify pb-5';

    par.innerHTML = objUrl;

    output.appendChild(par);
    output.appendChild(spRes);

    this.worker.postMessage({
      type: 'pipeline',
      image: objUrl,
      modelOpts: { top_k: 5 },
      fileName: fname,
      index: index,
      inputLen: inputLen,
    });
  }

  handleOutput(dt) {
    if (dt.output === null) {
      return;
    }
    
    const outputResults = document.getElementsByClassName(
      'output-result-classify',
    );

    let outMsg = '<strong>Predicted Stars</strong>: ';

    for (let i = 0; i < dt.output.length; i++) {
      outMsg += `<span class="has-text-success">${dt.output[i].label}</span> `;
      outMsg += `(${(dt.output[i].score * 100).toFixed(2)}%)`;
      if (i !== dt.output.length - 1) {
        outMsg += '; ';
      }
    }

    outputResults[dt.input.index].innerHTML = outMsg;
    this.dataToDownload[dt.input.fileName][dt.input.index] = {
      input: dt.input.image,
      output: dt.output,
    };
  }

  handleDownload() {

    const rows = [];
    Object.entries(this.dataToDownload).forEach(([path, entries]) => {
      entries.forEach(entry => {
        const { input, output } = entry;
        output.forEach(({ label, score }) => {
          rows.push([path, input, label, score]);
        });
      });
    });

    const headers = ["path", "input", "label", "score"];
    const csvWithHeaders = [headers, ...rows.map(row => row.map(value => `"${value}"`).join(","))].join("\n");

    document.getElementById('search-bar').disabled = false;
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

  afterLoad() {
    const value = [{
      "url":"../../text/amazonsmall.txt",
      "caption": ""
    }];

    this.handleRunModel();
    this.handleExample(value);
  }
}
