const buildNavBar = function () {
  // Create the nav element
  const nav = document.createElement('nav');
  nav.id = 'elemNavbarTop';
  nav.className = 'navbar is-fixed-top has-text-white-ter';

  // Create the div for navbar-brand
  const navbarBrand = document.createElement('div');
  navbarBrand.className = 'navbar-brand';

  // Create the anchor element for the navbar item
  const navHomeLink = document.createElement('a');
  navHomeLink.id = 'linkNavHome';
  navHomeLink.className = 'navbar-item section-link';
  navHomeLink.dataset.linkSection = 'welcome';
  navHomeLink.href = "/dvexplorer";

  // Create the SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-name', 'Layer 1');
  svg.setAttribute('height', '24');
  svg.id = 'Layer_1';
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Create the first circle
  const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle1.setAttribute('fill', '#fff');
  circle1.setAttribute('cx', '9.25');
  circle1.setAttribute('cy', '9.25');
  circle1.setAttribute('r', '0.75');
  svg.appendChild(circle1);

  // Create the second circle
  const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle2.setAttribute('fill', '#fff');
  circle2.setAttribute('cx', '14.75');
  circle2.setAttribute('cy', '9.25');
  circle2.setAttribute('r', '0.75');
  svg.appendChild(circle2);

  // Create the path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', '#fff');
  path.setAttribute('d', 'M18,9.11047V3.20709a.5.5,0,0,0-.85358-.35358L15.11865,4.88135a5.95958,5.95958,0,0,0-6.27173.02087l-1.99-2.02863A.5.5,0,0,0,6,3.22369V9.11047C4.85895,9.62012,4,11.83917,4,14.5,4,17.53754,5.11926,20,6.5,20a1.33406,1.33406,0,0,0,.79272-.28693,5.98805,5.98805,0,0,0,9.41455,0A1.33406,1.33406,0,0,0,17.5,20c1.38074,0,2.5-2.46246,2.5-5.5C20,11.83917,19.14105,9.62012,18,9.11047ZM9.25,11.25a2,2,0,1,1,2-2A2,2,0,0,1,9.25,11.25ZM12,14l-1-2c0-.3595,2-.3595,2,0Zm2.75-2.75a2,2,0,1,1,2-2A2,2,0,0,1,14.75,11.25Z');
  svg.appendChild(path);

  // Add the SVG to the link
  const newImage = document.createElement('img');
  newImage.src = "/dvexplorer/icon/owl3.png"
  navHomeLink.appendChild(newImage);

  // Add text to the link
  navHomeLink.appendChild(document.createTextNode(' Distant Viewing Explorer'));

  // Add the link to the navbar brand
  navbarBrand.appendChild(navHomeLink);

  // Create the burger menu
  const burgerButton = document.createElement('a');
  burgerButton.setAttribute('role', 'button');
  burgerButton.className = 'navbar-burger';
  burgerButton.setAttribute('aria-label', 'menu');
  burgerButton.setAttribute('aria-expanded', 'false');
  burgerButton.dataset.target = 'navbarBasicExample';

  for (let i = 0; i < 4; i++) {
    const span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    burgerButton.appendChild(span);
  }

  // Add the burger button to the navbar brand
  navbarBrand.appendChild(burgerButton);

  // Add the navbar brand to the nav
  nav.appendChild(navbarBrand);

  // Create the navbar menu
  const navbarMenu = document.createElement('div');
  navbarMenu.className = 'navbar-menu';

  // Create the navbar-end div
  const navbarEnd = document.createElement('div');
  navbarEnd.className = 'navbar-end';
  navbarEnd.id = 'nabar-end';

  // Add the navbar-end to the navbar menu
  navbarMenu.appendChild(navbarEnd);

  // Add the navbar menu to the nav
  nav.appendChild(navbarMenu);

  // Append the nav to the body
  document.body.appendChild(nav);
};

export default function navbar() {
  buildNavBar();
}
