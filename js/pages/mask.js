import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import modalexample from '../components/modalexample.js';
import modalinfo from '../components/modalinfo.js';
import modalimage from '../components/modalimage.js';

import MaskAnnotation from '../annotation/maskAnnotation.js';

let anno;

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('mask');
  modalexample();
  modalinfo();
  modalimage();
  
  // create the annotation and run it
  anno = new MaskAnnotation();
  anno.run()
});
