import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import modalexample from '../components/modalexample.js';
import modalinfo from '../components/modalinfo.js';
import modalimage from '../components/modalimage.js';

import StarsAnnotation from '../annotation/starsAnnotation.js';

let anno;

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('stars');
  modalexample();
  modalinfo();
  modalimage();
  
  // create the annotation and run it
  anno = new StarsAnnotation();
  anno.run()
});
