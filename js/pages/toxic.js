// DO NOT EDIT THIS PAGE DIRECTLY; IT WAS CREATED WITH create_html_js.R

import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import modalexample from '../components/modalexample.js';
import modalinfo from '../components/modalinfo.js';
import modalimage from '../components/modalimage.js';

import ToxicAnnotation from '../annotation/toxicAnnotation.js';

let anno;

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('toxic', true, false);
  modalexample();
  modalinfo();
  modalimage();
  
  // create the annotation and run it
  anno = new ToxicAnnotation();
  anno.run()
});
