// MyHair - Camera & Image Upload Module
class CameraModule {
  constructor() {
    this.stream = null;
    this.videoEl = null;
    this.capturedImage = null;
    this.onCapture = null; // callback(imageDataURL)
  }

  async startCamera(videoElement) {
    this.videoEl = videoElement;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      videoElement.srcObject = this.stream;
      await videoElement.play();
      return true;
    } catch (e) {
      console.warn('Camera access denied or unavailable:', e);
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl = null;
    }
  }

  captureFrame(videoEl) {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoEl, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  loadImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'));
        return;
      }
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Simulated AI analysis
  analyzeHair(imageDataURL) {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate AI detection results
        const volumes = ['浓密', '中等', '适中', '稀疏'];
        const colors = ['自然黑', '深棕', '暖棕', '栗色', '焦糖棕'];
        const lengths = ['短发', '中短发', '中长发', '长发', '超长发'];
        const textures = ['直发', '微波浪', '波浪卷', '大卷'];

        resolve({
          volume: volumes[Math.floor(Math.random() * 4)],
          color: colors[Math.floor(Math.random() * 5)],
          length: lengths[Math.floor(Math.random() * 5)],
          texture: textures[Math.floor(Math.random() * 4)],
          confidence: 0.85 + Math.random() * 0.13
        });
      }, 2200 + Math.random() * 800);
    });
  }
}
