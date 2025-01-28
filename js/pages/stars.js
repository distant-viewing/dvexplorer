// DO NOT EDIT THIS PAGE DIRECTLY; IT WAS CREATED WITH create_html_js.R

import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import modalexample from '../components/modalexample.js';
import modalinfo from '../components/modalinfo.js';
import modalimage from '../components/modalimage.js';
import modalupload from '../components/modalupload.js';

import StarsAnnotation from '../annotation/starsAnnotation.js';

let anno;

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('stars', true, false);
  modalexample();
  modalinfo();
  modalimage();
  modalupload();
  
  // create the annotation and run it
  anno = new StarsAnnotation();
  anno.run()
});
