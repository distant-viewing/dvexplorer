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

  // Create the Video Upload
  const videoDiv = document.createElement('div');
  const videoBodyP = document.createElement('p');
  const videoLabel = document.createElement('label');
  const videoInput = document.createElement('input');

  videoBodyP.className = "py-3";
  videoBodyP.innerHTML = "Or, upload a local video file and we will extract frames at the selected regular time interval and process each individual frame";

  videoDiv.id = 'video-container';
  videoLabel.id = 'video-upload-label';
  videoLabel.className = 'pb-3';
  videoLabel.for = 'fps';
  videoInput.type = 'number';
  videoInput.id = 'video-frame-interval';
  videoInput.min = 0.1;
  videoInput.value = 5; 
  videoLabel.innerHTML = 'Interval between frames (seconds) : '; 

  const uploadVideoFieldset = document.createElement('fieldset');
  uploadVideoFieldset.className = 'py-3';
  uploadVideoFieldset.id = 'upload-video-file';
  uploadVideoFieldset.disabled = false;

  const fileVideoLabel = document.createElement('label');
  fileVideoLabel.className = 'file-label';

  const fileVideoInput = document.createElement('input');
  fileVideoInput.className = 'file-input py-3';
  fileVideoInput.id = 'file-video-input';
  fileVideoInput.type = 'file';
  fileVideoInput.accept = 'video/*';
  fileVideoLabel.appendChild(fileVideoInput);

  const fileVideoCtaSpan = document.createElement('span');
  fileVideoCtaSpan.className = 'file-cta is-success';
  fileVideoCtaSpan.id = 'file-video-cta-custom';

  const uploadVideoIconSpan = document.createElement('span');
  uploadVideoIconSpan.className = 'file-icon';
  const uploadVideoIcon = document.createElement('i');
  uploadVideoIcon.className = 'fas fa-file-arrow-up';
  uploadVideoIconSpan.appendChild(uploadVideoIcon);
  fileVideoCtaSpan.appendChild(uploadVideoIconSpan);

  const uploadVideoTextSpan = document.createElement('span');
  uploadVideoTextSpan.className = 'file-label is-small py-3';
  uploadVideoTextSpan.id = 'annotation-video-upload-span';
  uploadVideoTextSpan.innerHTML = 'Upload video file…';
  fileVideoCtaSpan.appendChild(uploadVideoTextSpan);

  fileVideoLabel.appendChild(fileVideoCtaSpan);
  uploadVideoFieldset.appendChild(fileVideoLabel);

  videoDiv.appendChild(videoBodyP);
  videoDiv.appendChild(videoLabel).appendChild(videoInput);
  videoDiv.appendChild(uploadVideoFieldset);
  messageBody.appendChild(videoDiv);

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
