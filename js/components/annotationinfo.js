const buildAnnotationInfo = function () {
  // Create the main container div
  const annotationInfo = document.createElement('div');
  annotationInfo.id = 'annotation-info';
  annotationInfo.className = 'dv-model-info p-5';

  // Create the content div
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content is-text';

  // Create the title
  const annotationTitle = document.createElement('h2');
  annotationTitle.id = 'annotation-title';
  contentDiv.appendChild(annotationTitle);

  // Create the tags div
  const tagsDiv = document.createElement('div');
  tagsDiv.className = 'tags';

  // Create the "Learn More" tag
  const learnMoreTag = document.createElement('span');
  learnMoreTag.className = 'tag is-warning is-hoverable is-rounded';
  learnMoreTag.id = 'modal-info-open';
  learnMoreTag.textContent = 'Learn More';
  tagsDiv.appendChild(learnMoreTag);

  // Create the Python link
  const pythonLink = document.createElement('a');
  pythonLink.id = 'python-link';
  pythonLink.href = '';
  pythonLink.target = '_blank';
  pythonLink.rel = 'noopener noreferrer';

  const pythonTag = document.createElement('span');
  pythonTag.className = 'tag is-link is-hoverable is-rounded';
  pythonTag.textContent = 'Script';
  pythonLink.appendChild(pythonTag);
  tagsDiv.appendChild(pythonLink);

  // Add the tags div to content
  contentDiv.appendChild(tagsDiv);

  // Create the annotation description div
  const annotationDescription = document.createElement('div');
  annotationDescription.id = 'annotation-description';
  contentDiv.appendChild(annotationDescription);

  // Add content div to annotation info
  annotationInfo.appendChild(contentDiv);

  // Create the file buttons container
  const fileButtonsDiv = document.createElement('div');
  fileButtonsDiv.className = 'file is-small is-boxed buttons has-addons mb-3';

  // Create the Load Model button
  const loadButton = document.createElement('button');
  loadButton.id = 'annotation-load';
  loadButton.className = 'button is-small is-success btn-custom';

  const loadIconSpan = document.createElement('span');
  loadIconSpan.className = 'file-icon';
  const loadIcon = document.createElement('i');
  loadIcon.className = 'fas fa-laptop-code';
  loadIcon.setAttribute('aria-hidden', 'true');
  loadIconSpan.appendChild(loadIcon);
  loadButton.appendChild(loadIconSpan);

  const loadTextSpan = document.createElement('span');
  loadTextSpan.innerHTML = 'Load<br />Model';
  loadButton.appendChild(loadTextSpan);

  fileButtonsDiv.appendChild(loadButton);

  // Create the Load Example button
  const exampleButton = document.createElement('button');
  exampleButton.id = 'annotation-example';
  exampleButton.className = 'button is-small btn-custom';
  exampleButton.disabled = true;

  const exampleIconSpan = document.createElement('span');
  exampleIconSpan.className = 'file-icon';
  const exampleIcon = document.createElement('i');
  exampleIcon.className = 'fas fa-cloud-arrow-up';
  exampleIcon.setAttribute('aria-hidden', 'true');
  exampleIconSpan.appendChild(exampleIcon);
  exampleButton.appendChild(exampleIconSpan);

  const exampleTextSpan = document.createElement('span');
  exampleTextSpan.innerHTML = 'Load<br />Example';
  exampleButton.appendChild(exampleTextSpan);

  fileButtonsDiv.appendChild(exampleButton);

  // Create the Upload fieldset
  const uploadFieldset = document.createElement('fieldset');
  uploadFieldset.id = 'annotation-upload';
  uploadFieldset.disabled = true;

  const fileLabel = document.createElement('label');
  fileLabel.className = 'file-label';

  const fileInput = document.createElement('input');
  fileInput.className = 'file-input';
  fileInput.id = 'file-input';
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileLabel.appendChild(fileInput);

  const fileCtaSpan = document.createElement('span');
  fileCtaSpan.className = 'file-cta';
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
  uploadTextSpan.innerHTML = 'Upload<br />Video…';
  fileCtaSpan.appendChild(uploadTextSpan);

  fileLabel.appendChild(fileCtaSpan);
  uploadFieldset.appendChild(fileLabel);
  fileButtonsDiv.appendChild(uploadFieldset);

  // Create the Download Output button
  const downloadButton = document.createElement('button');
  downloadButton.id = 'annotation-download';
  downloadButton.className = 'button is-small btn-custom has-no-left-border';
  downloadButton.disabled = true;

  const downloadIconSpan = document.createElement('span');
  downloadIconSpan.className = 'file-icon';
  const downloadIcon = document.createElement('i');
  downloadIcon.className = 'fas fa-file-arrow-down';
  downloadIcon.setAttribute('aria-hidden', 'true');
  downloadIconSpan.appendChild(downloadIcon);
  downloadButton.appendChild(downloadIconSpan);

  const downloadTextSpan = document.createElement('span');
  downloadTextSpan.innerHTML = 'Download<br />Output';
  downloadButton.appendChild(downloadTextSpan);

  fileButtonsDiv.appendChild(downloadButton);

  // Add the file buttons to annotation info
  annotationInfo.appendChild(fileButtonsDiv);

  // Create the annotation options div
  const annotationOptions = document.createElement('div');
  annotationOptions.id = 'annotation-options';
  annotationInfo.appendChild(annotationOptions);

  // Create the progress container
  const progressContainer = document.createElement('div');
  progressContainer.className = 'px-3 pt-1 pb-2 my-4 has-background-white-ter is-max-tablet';

  // Create the Model load progress label and progress bar
  const loadProgressLabel = document.createElement('span');
  //loadProgressLabel.setAttribute('for', 'file');
  loadProgressLabel.className = 'is-code is-progress-label';
  loadProgressLabel.textContent = 'Model load progress:';
  progressContainer.appendChild(loadProgressLabel);

  const loadProgress = document.createElement('progress');
  loadProgress.className = 'progress is-success';
  loadProgress.id = 'file-progress-load';
  loadProgress.max = '100';
  loadProgress.value = '0';
  progressContainer.appendChild(loadProgress);

  // Create the Model run progress label and progress bar
  const runProgressLabel = document.createElement('span');
  //runProgressLabel.setAttribute('for', 'file');
  runProgressLabel.className = 'is-code is-progress-label';
  runProgressLabel.textContent = 'Model run progress:';
  progressContainer.appendChild(runProgressLabel);

  const runProgress = document.createElement('progress');
  runProgress.className = 'progress is-success';
  runProgress.id = 'file-progress-run';
  runProgress.max = '100';
  runProgress.value = '0';
  progressContainer.appendChild(runProgress);

  // Create the run time
  const runTimeLabel = document.createElement('span');
  runTimeLabel.className = 'is-progress-label p-5';
  runTimeLabel.id = "time-label";
  runTimeLabel.textContent = '';
  progressContainer.appendChild(runTimeLabel);

  // Add the progress container to annotation info
  annotationInfo.appendChild(progressContainer);

  // Append annotation info to the dv-container
  const container = document.getElementById('dv-container');
  container.appendChild(annotationInfo);
}


export default function annotationinfo() {
  buildAnnotationInfo();

  // open the info modal when clicking on the 'Learn More' tag
  document.getElementById('modal-info-open').addEventListener('click', () => {
    document.getElementById('modal-info').classList.add('is-active');
  });
}