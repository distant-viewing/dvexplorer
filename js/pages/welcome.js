import navbar from '../components/navbar.js';
import dvcontainer from '../components/dvcontainer.js';
import textinfo from '../components/textinfo.js';

document.addEventListener('DOMContentLoaded', () => {
  // build the page elements
  navbar();
  dvcontainer('welcome', false);

  // load content into the page
  textinfo('../../info/welcome.json');
});
