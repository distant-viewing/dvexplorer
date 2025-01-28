import { closeModal } from '../utils/modal.js';

const buildModalUpload = function () {
  // Create the main modal div
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'modal-upload';

  // Create the modal background
  const modalBackground = document.createElement('div');
  modalBackground.className = 'modal-background';
  modalBackground.id = 'modal-upload-background';
  modal.appendChild(modalBackground);

  // Create the modal content div
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Create the article element
  const article = document.createElement('article');
  article.className = 'message is-success';

  // Create the message header
  const messageHeader = document.createElement('div');
  messageHeader.className = 'message-header';

  // Add the header title
  const headerTitle = document.createElement('p');
  headerTitle.textContent = 'Upload Files';
  messageHeader.appendChild(headerTitle);

  // Add the delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.setAttribute('aria-label', 'delete');
  deleteButton.id = 'modal-upload-delete';
  messageHeader.appendChild(deleteButton);

  // Append the message header to the article
  article.appendChild(messageHeader);

  // Create the message body
  const messageBody = document.createElement('div');
  messageBody.className = 'message-body';
  messageBody.id = 'upload-body';

  // Create message text
  const messageBodyP = document.createElement('p');
  messageBodyP.id = 'upload-instructions';
  messageBodyP.className = "pb-3";
  messageBodyP.innerHTML = "Instructions";
  messageBody.appendChild(messageBodyP);

  // Create the Upload fieldset
  const uploadFieldset = document.createElement('fieldset');
  uploadFieldset.id = 'upload-file';
  uploadFieldset.disabled = false;

  const fileLabel = document.createElement('label');
  fileLabel.className = 'file-label';

  const fileInput = document.createElement('input');
  fileInput.className = 'file-input';
  fileInput.id = 'file-input';
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileLabel.appendChild(fileInput);

  const fileCtaSpan = document.createElement('span');
  fileCtaSpan.className = 'file-cta is-success';
  fileCtaSpan.id = 'file-cta-custom';

  const uploadIconSpan = document.createElement('span');
  uploadIconSpan.className = 'file-icon';
  const uploadIcon = document.createElement('i');
  uploadIcon.className = 'fas fa-file-arrow-up';
  uploadIconSpan.appendChild(uploadIcon);
  fileCtaSpan.appendChild(uploadIconSpan);

  const uploadTextSpan = document.createElement('span');
  uploadTextSpan.className = 'file-label is-small';
  uploadTextSpan.id = 'annotation-upload-span';
  uploadTextSpan.innerHTML = 'Upload Video…';
  fileCtaSpan.appendChild(uploadTextSpan);

  fileLabel.appendChild(fileCtaSpan);
  uploadFieldset.appendChild(fileLabel);
  messageBody.appendChild(uploadFieldset);

  // Create input URL bar
  const inputUrlContainer = document.createElement('div');
  inputUrlContainer.className = "control mx-7 my-3";
  const inputUrl = document.createElement('input');
  inputUrl.id = "url-input";
  inputUrl.type = "text";
  inputUrl.placeholder = "URL to file (hit Enter when ready)";
  inputUrl.className = "input is-success";
  inputUrlContainer.appendChild(inputUrl);
  messageBody.appendChild(inputUrlContainer);

  // Append the message body to the article
  article.appendChild(messageBody);

  // Append the article to the modal content
  modalContent.appendChild(article);

  // Append the modal content to the modal
  modal.appendChild(modalContent);

  // Append the modal to the body
  document.body.appendChild(modal);
};

export default function modalupload() {
  buildModalUpload();
  closeModal('upload');
}
