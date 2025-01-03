import verticalmenu from '../components/verticalmenu.js'
import annotationinfo from '../components/annotationinfo.js'

const buildDvContainer = function(activeId, buildInner) {
  // create the container and append it to the body of the webpage
  const dvContainer = document.createElement('div');
  dvContainer.className = 'dv-container';
  dvContainer.id = 'dv-container';
  document.body.appendChild(dvContainer);

  // add vertical menu (left component) + annotation info (middle component)
  verticalmenu(activeId);
  if (buildInner) { annotationinfo(); }

  // add the output container; it is built out by the annotation itself
  if (buildInner) {
    const annoOutput = document.createElement('div');
    annoOutput.className = 'dv-model-output py-5';
    annoOutput.id = 'annotation-output';
    dvContainer.appendChild(annoOutput);
  }
}

export default function dvcontainer(activeId, buildInner = true) {
  buildDvContainer(activeId, buildInner);
}