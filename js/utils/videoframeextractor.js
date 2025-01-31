import { formatTime } from '../utils/utils.js';

export default class VideoFrameExtractor {
  constructor() {
    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.framesContainer = document.getElementById('frames-container');

    this.createElements();
  }

  createElements() {
    const output = document.getElementById('annotation-output');
    if (!this.framesContainer) {
      const frames = document.createElement('div');
      frames.style.display = "none";
      frames.id = "frames-container";
      frames.className = 'frames-container';
      output.appendChild(frames);
      this.framesContainer = document.getElementById('frames-container');
    }
  }
  
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    
    const frameInterval = parseFloat(
      document.getElementById('video-frame-interval').value
    ) || 1;
    this.framesContainer.innerHTML = '';
    await this.extractFrames(file, frameInterval);
  }
  
  async extractFrames(file, frameInterval) {
    const videoUrl = URL.createObjectURL(file);
    this.video.src = videoUrl;
    
    try {
      await new Promise((resolve, reject) => {
          this.video.onloadedmetadata = resolve;
          this.video.onerror = reject;
      });
      
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      
      const duration = this.video.duration;
      const totalFrames = Math.floor(duration / frameInterval);
      let extractedFrames = 0;
      
      for (let i = 0; i < totalFrames; i++) {
        const currentTime = i * frameInterval;
        if (currentTime > duration) break;
        
        this.video.currentTime = currentTime;
        await new Promise(resolve => {
            this.video.onseeked = resolve;
        });
        
        this.ctx.drawImage(this.video, 0, 0);
        const frameUrl = this.canvas.toDataURL('image/jpeg');
        this.addFrameToPage(frameUrl, i + 1);
        extractedFrames++;
      }
    } catch (error) {
    } finally {
      URL.revokeObjectURL(videoUrl);
    }
  }
  
  addFrameToPage(frameUrl, frameNumber) {
    const wrapper = document.createElement('div');
    wrapper.className = 'frame-wrapper';
    
    const img = document.createElement('img');
    img.src = frameUrl;
    img.className = 'frame';
    img.dataset.time = formatTime(this.video.currentTime);

    wrapper.appendChild(img);
    this.framesContainer.appendChild(wrapper);
  }

  async getImageBlobUrls() {
    const frameImg = [...document.getElementsByClassName('frame')];

    const imageArray = [];    
    for (let i = 0; i < frameImg.length; i++) {
      const response = await fetch(frameImg[i].src);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      imageArray.push({'url': objectURL, 'title': frameImg[i].dataset.time});
    }

    return imageArray;
  }
}