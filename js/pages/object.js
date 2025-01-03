import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import modalexample from '../components/modalexample.js';
import modalinfo from '../components/modalinfo.js';
import modalimage from '../components/modalimage.js';

import ObjectAnnotation from '../annotation/objectAnnotation.js';

let anno;

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('object');
  modalexample();
  modalinfo();
  modalimage();
  
  // create the annotation and run it
  anno = new ObjectAnnotation();
  anno.run()
});
