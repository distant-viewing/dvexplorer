const renderBox = function ({ box, label }) {
  const { xmax, xmin, ymax, ymin } = box;

  // Generate a random color for the box
  const color =
    '#' +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, 0);

  // Draw the box
  const boxElement = document.createElement('div');
  boxElement.className = 'bounding-box';
  Object.assign(boxElement.style, {
    borderColor: color,
    left: 100 * xmin + '%',
    top: 100 * ymin + '%',
    width: 100 * (xmax - xmin) + '%',
    height: 100 * (ymax - ymin) + '%',
  });

  // Draw the label
  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  labelElement.className = 'bounding-box-label';
  labelElement.style.backgroundColor = color;

  boxElement.appendChild(labelElement);
  return boxElement;
};

const extractAudioData = async function (url) {
  try {
    const audioContext = new AudioContext({ sampleRate: 16000 });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);

    return channelData;
  } catch (error) {
    console.error('Error extracting audio data:', error);
  }
};

export { renderBox, extractAudioData };
