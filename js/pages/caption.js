import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import modalexample from '../components/modalexample.js';
import modalinfo from '../components/modalinfo.js';
import modalimage from '../components/modalimage.js';

import CaptionAnnotation from '../annotation/captionAnnotation.js';

let anno;

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('caption');
  modalexample();
  modalinfo();
  modalimage();
  
  // create the annotation and run it
  anno = new CaptionAnnotation();
  anno.run()
});
