import Annotation from './annotation.js';
import VideoFrameExtractor from '../utils/videoframeextractor.js'
import DOMUtils from '../utils/domutils.js';
import { RawImage } from '../extern/transformers.min.js';
import {
  BlobReader,
  BlobWriter,
  ZipWriter,
} from '../extern/zip.min.js';

/**
 * Constants for DOM elements and classes
 */
const ELEMENTS = {
  OUTPUT: 'annotation-output',
  DOWNLOAD_BUTTON: 'annotation-download'
};

/**
 * CSS class names for depth annotation elements
 */
const DEPTH_CLASSES = {
  CONTAINER: 'image-container-depth',
  INNER: 'inner-image-depth',
  IMG: 'inner-image-img-depth',
  IMG_1: 'inner-image-img-depth-1',
  IMG_2: 'inner-image-img-depth-2',
  OUTPUT_LABEL: 'output-label pb-5'
};

/**
 * Class for depth estimation annotation
 */
export default class DepthAnnotation extends Annotation {
  // Configuration properties
  section = 'menu-image';
  name = 'depth';
  title = '2.5 Depth Estimation';
  dtype = 'q8';
  task = 'depth-estimation';
  model = 'Xenova/depth-anything-base-hf';
  itype = 'image';
  pylink = 'https://distantviewing.org/dvscripts/depth.html';
  exampleNames = null;

  /**
   * Constructor
   */
  constructor() {
    super();
    this.setup();
    this.dataToDownload = {};
  }

  /**
   * Clear and prepare the output container
   */
  buildOutput() {
    const output = DOMUtils.getElement(ELEMENTS.OUTPUT);
    output.innerHTML = '';
  }

  /**
   * Initialize worker for depth estimation
   */
  startWorkers() {
    if (this.worker !== null) {
      this.worker.terminate();
    }

    this.worker = new Worker(
      new URL('../workers/workerDepth.js', import.meta.url),
      { type: 'module' }
    );
  }

  /**
   * Handle file upload
   * @param {Event} uploadEvent - Upload event
   */
  async handleUpload(uploadEvent) {
    try {
      const filesArray = uploadEvent.target.files;
      const imageArray = [...filesArray].filter((file) => file.type.includes('image'));

      this.resetData();

      for (let i = 0; i < imageArray.length; i++) {
        const objUrl = URL.createObjectURL(imageArray[i]);
        await this.handleInput(
          objUrl,
          filesArray[i].name,
          filesArray[i].name,
          i,
          imageArray.length
        );
      }
    } catch (error) {
      console.error('Error handling upload:', error);
      this.handleError();
    }
  }

  /**
   * Handle example
   * @param {Array} exampleData - Example data
   */
  async handleExample(exampleData) {
    try {
      this.resetData();

      const imageArray = exampleData.filter((item) => !item.url.endsWith('json'));

      for (let i = 0; i < imageArray.length; i++) {
        await this.handleInput(
          imageArray[i].url,
          imageArray[i].caption,
          imageArray[i].url,
          i,
          imageArray.length
        );
      }
    } catch (error) {
      console.error('Error handling example:', error);
      this.handleError();
    }
  }

  /**
   * Handle URL input
   * @param {string} url - URL to process
   */
  async handleUrl(url) {
    try {
      this.resetData();
      
      await this.handleInput(
        url,
        url,
        url,
        0,
        1
      );
    } catch (error) {
      console.error('Error handling URL:', error);
      this.handleError();
    }
  }

  /**
   * Reset data structures for a new processing session
   */
  resetData() {
    this.dataToDownload = {};
    this.imageDataArray = [];
    this.imageNameArray = [];
  }

  /**
   * Handle video upload
   * @param {Event} uploadEvent - Upload event
   */
  async handleUploadVideo(uploadEvent) {
    try {
      this.resetData();

      const videoFrameExtractor = new VideoFrameExtractor();
      await videoFrameExtractor.handleFileSelect(uploadEvent);
      const imageArray = await videoFrameExtractor.getImageBlobUrls();

      for (let i = 0; i < imageArray.length; i++) {
        await this.handleInput(
          imageArray[i].url,
          imageArray[i].title,
          imageArray[i].title,
          i,
          imageArray.length
        );
      }
    } catch (error) {
      console.error('Error handling video upload:', error);
      this.handleError();
    }
  }

  /**
   * Create and prepare DOM elements for an input
   * @param {string} objUrl - Object URL
   * @param {string} caption - Caption
   * @param {string} fname - File name
   * @param {number} index - Index
   * @param {number} inputLen - Input length
   */
  async handleInput(objUrl, caption, fname, index, inputLen) {
    try {
      const output = DOMUtils.getElement(ELEMENTS.OUTPUT);
      
      // Create container elements
      const imageContainer = DOMUtils.createElement('div');
      const imageInner = DOMUtils.createElement('div');
      const img1 = DOMUtils.createElement('img');
      const img2 = DOMUtils.createElement('img');
      const captionElement = DOMUtils.createElement('p');

      // Set classes
      imageContainer.className = DEPTH_CLASSES.CONTAINER;
      imageInner.className = DEPTH_CLASSES.INNER;
      img1.className = `${DEPTH_CLASSES.IMG} ${DEPTH_CLASSES.IMG_1}`;
      img2.className = `${DEPTH_CLASSES.IMG} ${DEPTH_CLASSES.IMG_2}`;
      captionElement.className = DEPTH_CLASSES.OUTPUT_LABEL;

      // Set caption content
      captionElement.innerHTML = caption;
      
      // Build DOM structure
      output.appendChild(imageContainer).appendChild(imageInner).appendChild(img1);
      imageInner.appendChild(img2);
      output.appendChild(captionElement);

      // Set source for original image
      img1.src = objUrl;
      
      // Handle image loading errors
      img1.onerror = () => {
        this.buildOutput();

        const output = DOMUtils.getElement(ELEMENTS.OUTPUT);
        const errorMessage = DOMUtils.createElement('p');
        errorMessage.innerHTML = `Not able to load image from URL <b>${objUrl}</b>. Please try again with another input or example!`;
        output.appendChild(errorMessage);

        this.handleError();
      };

      // Configure image once loaded
      img1.onload = () => {
        // Calculate appropriate dimensions while maintaining aspect ratio
        const aspectRatio = img1.width / img1.height;
        const containerHeight = Math.min(616 / aspectRatio, 500);
        const containerWidth = containerHeight * aspectRatio;
        
        // Set container dimensions
        imageContainer.style.height = `${containerHeight}px`;
        imageContainer.style.width = `${containerWidth}px`;

        // Send to worker for processing
        this.worker.postMessage({
          type: 'pipeline',
          image: img1.src,
          fileName: fname,
          index: index,
          inputLen: inputLen,
        });
      };
    } catch (error) {
      console.error('Error handling input:', error);
      this.handleError();
    }
  }

  /**
   * Process worker output
   * @param {Object} data - Data from worker
   */
  handleOutput(data) {
    try {
      // Ignore null output
      if (data.output === null) {
        return;
      }

      // Get the target output image
      const outputImages = DOMUtils.getElementsByClass(DEPTH_CLASSES.IMG_2);
      if (!outputImages || !outputImages[data.input.index]) {
        console.warn('Output image element not found');
        return;
      }

      // Create raw image from data
      const rawImage = new RawImage(
        data.output.data,
        data.output.width,
        data.output.height,
        data.output.channels
      );
      
      // Convert to RGBA format
      rawImage.rgba();

      // Render to canvas
      const canvas = DOMUtils.createElement('canvas');
      canvas.width = rawImage.width;
      canvas.height = rawImage.height;
      const context = canvas.getContext('2d');

      // Create image data and render to canvas
      const imageData = new ImageData(
        new Uint8ClampedArray(rawImage.data),
        rawImage.width,
        rawImage.height
      );
      context.putImageData(imageData, 0, 0);

      // Convert canvas to data URL for display
      const dataURL = canvas.toDataURL('image/png');
      outputImages[data.input.index].src = dataURL;

      // Store processed data for download
      this.imageDataArray.push(imageData);
      this.imageNameArray.push(data.input.fileName);
    } catch (error) {
      console.error('Error processing output:', error);
    }
  }

  /**
   * Prepare download functionality
   */
  async handleDownload() {
    try {
      // Create an array of promises for converting images to blobs
      const conversionPromises = this.imageDataArray.map(imageData => {
        const offscreenCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const context = offscreenCanvas.getContext('2d');
        context.putImageData(imageData, 0, 0);
        return offscreenCanvas.convertToBlob({ type: 'image/png' });
      });

      // Wait for all conversions to complete
      const imageBlobs = await Promise.all(conversionPromises);

      // Set up ZIP writer
      const zipFileWriter = new BlobWriter();
      const zipWriter = new ZipWriter(zipFileWriter);

      // Add each image to the ZIP archive
      for (let i = 0; i < imageBlobs.length; i++) {
        // Clean up filename
        let filename = this.imageNameArray[i];
        filename = filename.split('\\').pop().split('/').pop();
        
        // Ensure PNG extension
        if (!filename.endsWith('.png')) {
          filename += '.png';
        }

        // Add to ZIP
        await zipWriter.add(filename, new BlobReader(imageBlobs[i]));
      }

      // Finalize ZIP file
      await zipWriter.close();
      const zipFileBlob = await zipFileWriter.getData();
      const zipUrl = URL.createObjectURL(zipFileBlob);

      // Set up download button
      const downloadButton = DOMUtils.getElement(ELEMENTS.DOWNLOAD_BUTTON);
      
      // Remove any existing click listeners by cloning
      const newDownloadButton = downloadButton.cloneNode(true);
      downloadButton.parentNode.replaceChild(newDownloadButton, downloadButton);
      
      // Add event listener for download
      newDownloadButton.addEventListener('click', () => {
        const link = DOMUtils.createElement('a');
        link.href = zipUrl;
        link.download = 'depth_maps.zip';
        link.click();
        URL.revokeObjectURL(link.href);
      });
    } catch (error) {
      console.error('Error preparing download:', error);
      this.handleError();
    }
  }

  /**
   * Load example after model is ready
   */
  afterLoad() {
    // Default example to show after loading
    const defaultExample = [{
      "url":"../../img/fsac/service-pnp-fsac-1a35000-1a35000-1a35022v.png",
      "caption": "Russell Lee, August 1942 <i>Shepherd with his horse and " +
                "dog on Gravelly Range, Madison County, Montana</i>" +
                " <a href='https://www.loc.gov/pictures/collection/fsac/item/2017878800/'" +
                "target='_blank' rel='noopener noreferrer'>[link]</a>"
    }];

    this.handleRunModel();
    this.handleExample(defaultExample);
  }
}
