import { closeModal } from '../utils/modal.js';

const buildModalExample = function () {
  // Create the main modal div
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'modal-example';

  // Create the modal background
  const modalBackground = document.createElement('div');
  modalBackground.className = 'modal-background';
  modalBackground.id = 'modal-example-background';
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
  headerTitle.textContent = 'Example Images';
  messageHeader.appendChild(headerTitle);

  // Add the delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.setAttribute('aria-label', 'delete');
  deleteButton.id = 'modal-example-delete';
  messageHeader.appendChild(deleteButton);

  // Append the message header to the article
  article.appendChild(messageHeader);

  // Create the message body
  const messageBody = document.createElement('div');
  messageBody.className = 'message-body';
  messageBody.id = 'example-body';

  // Append the message body to the article
  article.appendChild(messageBody);

  // Append the article to the modal content
  modalContent.appendChild(article);

  // Append the modal content to the modal
  modal.appendChild(modalContent);

  // Append the modal to the body
  document.body.appendChild(modal);
};

export default function modalexample() {
  buildModalExample();
  closeModal('example');
}
