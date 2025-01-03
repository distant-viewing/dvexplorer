import { closeModal } from '../utils/modal.js';

const buildModalInfo = function () {
  // Create the main modal div
  const modalInfo = document.createElement('div');
  modalInfo.className = 'modal';
  modalInfo.id = 'modal-info';

  // Create the modal background
  const modalInfoBackground = document.createElement('div');
  modalInfoBackground.className = 'modal-background';
  modalInfoBackground.id = 'modal-info-background';
  modalInfo.appendChild(modalInfoBackground);

  // Create the modal content div
  const modalInfoContent = document.createElement('div');
  modalInfoContent.className = 'modal-content';

  // Create the article element
  const article = document.createElement('article');
  article.className = 'message is-warning';

  // Create the message header
  const messageHeader = document.createElement('div');
  messageHeader.className = 'message-header';

  // Add the span for additional info
  const spanMoreInfo = document.createElement('span');
  spanMoreInfo.id = 'span-more-info';
  messageHeader.appendChild(spanMoreInfo);

  // Add the delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.setAttribute('aria-label', 'delete');
  deleteButton.id = 'modal-info-delete';
  messageHeader.appendChild(deleteButton);

  // Append the message header to the article
  article.appendChild(messageHeader);

  // Create the message body
  const messageBody = document.createElement('div');
  messageBody.className = 'message-body';

  // Create the content element
  const contentElement = document.createElement('content');
  contentElement.id = 'modal-info-content';
  messageBody.appendChild(contentElement);

  // Append the message body to the article
  article.appendChild(messageBody);

  // Append the article to the modal content
  modalInfoContent.appendChild(article);

  // Append the modal content to the modal
  modalInfo.appendChild(modalInfoContent);

  // Append the modal to the body
  document.body.appendChild(modalInfo);
};

export default function modalinfo() {
  buildModalInfo();
  closeModal('info');
}
