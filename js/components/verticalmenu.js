// Function to create a menu section
const createMenuSection = function (iconClass, labelText, listId, listItems = []) {
  const menuAside = document.getElementById('menu-aside');

  // Create the menu-label paragraph
  const menuLabel = document.createElement('p');
  menuLabel.className = 'menu-label';

  // Create the icon span
  const iconSpan = document.createElement('span');
  const icon = document.createElement('i');
  icon.className = `${iconClass} has-text-tertiary`;
  iconSpan.appendChild(icon);
  menuLabel.appendChild(iconSpan);

  // Create the strong label
  const strongLabel = document.createElement('strong');
  strongLabel.className = 'has-text-tertiary';
  strongLabel.textContent = ' ' + labelText;
  menuLabel.appendChild(strongLabel);

  // Create the menu-list ul
  const menuList = document.createElement('ul');
  menuList.className = 'menu-list';
  menuList.id = listId;

  // Add list items if provided
  listItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'menu-link';
    a.id = item.id;
    a.textContent = item.text;
    li.appendChild(a);
    menuList.appendChild(li);
  });

  // Append the menu label and list to the aside
  menuAside.appendChild(menuLabel);
  menuAside.appendChild(menuList);
}

const buildVerticalMenu = function () {

  const container = document.getElementById('dv-container');

  // Create the main container div
  const verticalMenu = document.createElement('div');
  verticalMenu.className = 'dv-vertical-menu';

  // Create the aside element
  const menuAside = document.createElement('aside');
  menuAside.className = 'menu p-3';
  menuAside.id = 'menu-aside';
  verticalMenu.appendChild(menuAside);
  verticalMenu.appendChild(menuAside);
  container.appendChild(verticalMenu);

  // Create the "General" section
  createMenuSection('fas fa-eye', 'General', 'menu-general', [
    { id: 'welcome', text: 'Welcome' },
    { id: 'started', text: '1.1 Getting Started' },
    { id: 'moreinfo', text: '1.2 Further Resources' }, 
    { id: 'citation', text: '1.3 Citation + Funding' },
  ]);

  // Create the "Image" section
  createMenuSection('fas fa-image', 'Image', 'menu-image', [
    { id: 'classify', text: '2.1 Image Classification' },
    { id: 'object', text: '2.2 Object Detection' },
    { id: 'depth', text: '2.3 Depth Estimation' },
    { id: 'segment', text: '2.4 Image Segmentation' },
    { id: 'embed', text: '2.5 Embedding' },
  ]);

  // Create the "Video + Audio" section
  createMenuSection('fas fa-video', 'Video + Audio', 'menu-video', [
    { id: 'shotboundary', text: '3.1 Shot Boundary' },
    { id: 'transcription', text: '3.2 Transcription' },
    { id: 'diarization', text: '3.3 Diarization' },
  ]);

  // Create the "Text" section
  createMenuSection('fas fa-book', 'Text', 'menu-text', [
    { id: 'sentiment', text: '4.1 Sentiment Analysis' },
    { id: 'stars', text: '4.2 Review Prediction' },
    { id: 'toxic', text: '4.3 Comment Labels' },
    { id: 'mask', text: '4.4 Text Mask' },
  ]);

  // Create the "Multimodal" section
  createMenuSection('fas fa-pen-nib', 'Multimodal', 'menu-multimodal', [
    { id: 'zeroshot', text: '5.1 Zero-Shot Model' },
    { id: 'caption', text: '5.2 Image Caption' },
  ]);

};

export default function verticalmenu(activeId, isRoot) {
  buildVerticalMenu();

  const activeLink = document.getElementById(activeId);
  activeLink.classList.add('is-active');

  const path = isRoot ? "./pages/" : "../";
  console.log(isRoot);

  const allLinks = [...document.getElementsByClassName('menu-link')];
  for (let i = 0; i < allLinks.length; i++) {
    if (allLinks[i].id === "welcome") {
      allLinks[i].href = "/";
    } else {
      allLinks[i].href = path + allLinks[i].id;
    }
  }
}

