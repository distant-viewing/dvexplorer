import { getData } from '../utils/utils.js';

const buildTextinfo = function(contentFileName) {
  const generalContainer = document.createElement('div');
  generalContainer.className = 'dv-welcome p-5 pb-6';
  const contentContainer = document.createElement('div');
  contentContainer.className = 'content is-text';
  contentContainer.id = 'content-container';

  const dvContainer = document.getElementById('dv-container');
  dvContainer.appendChild(generalContainer).appendChild(contentContainer);

  getData(contentFileName).then((dt) => {
    contentContainer.innerHTML = dt['text'];
  });
}

export default function textinfo(contentFileName) {
  buildTextinfo(contentFileName);
}