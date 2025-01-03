import { closeModal } from '../utils/modal.js';

const buildModalImage = function () {
  // Create the main modal div
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'modal-image';

  // Create the modal background
  const modalBackground = document.createElement('div');
  modalBackground.className = 'modal-background';
  modalBackground.id = 'modal-image-background';
  modal.appendChild(modalBackground);

  // Create the modal content container
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content has-background-white-ter';
  modalContent.id = 'modal-image-container';

  // Create the close button
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close is-large';
  closeButton.id = 'modal-image-delete';
  closeButton.setAttribute('aria-label', 'close');
  modalContent.appendChild(closeButton);

  // Create the image element
  const image = document.createElement('img');
  image.src = 'https://bulma.io/assets/images/placeholders/1280x960.png';
  image.alt = '';
  image.id = 'modal-image-img';
  modalContent.appendChild(image);

  // Create the caption container
  const captionSpan = document.createElement('span');
  const captionStrong = document.createElement('strong');
  captionStrong.id = 'modal-image-caption';
  captionSpan.appendChild(captionStrong);
  modalContent.appendChild(captionSpan);

  // Append the modal content to the modal
  modal.appendChild(modalContent);

  // Append the modal to the body
  document.body.appendChild(modal);
};

export default function modalimage() {
  buildModalImage();
  closeModal('image');
}
