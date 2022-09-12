'use strict';


class Buddhabrot {
  
  
  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.image = this.context.createImageData(this.canvas.width, this.canvas.height);
    
    this.imgWidth = this.canvas.width;
    this.imgHeight = this.canvas.height;
    this.imgSize = this.imgWidth * this.imgHeight;
    const ratio = this.imgWidth / this.imgHeight;
    const side = 3.5;
    if (ratio >= 1) {
      this.height = side;
      this.width = side * ratio;
    } else {
      this.width = side;
      this.height = side / ratio;
    }
    this.center = [ -0.25, 0.0 ];
    
    this.maxN = 5000;
    this.maxColor = 1;
    this.itersR = new Float64Array(this.maxN);
    this.itersI = new Float64Array(this.maxN);
    this.color = new Float64Array(this.imgSize);
    for (let i = 0; i < this.imgSize; ++i) {
      this.color[i] = 0;
    }
    this.imageUpdated = false;
    this.scanning = false;
  }
  
  async scan() {
    const halfWidth = this.width / 2.0;
    const halfHeight = this.height / 2.0;
    const top = this.center[0] - halfHeight;
    const left = this.center[1] - halfWidth;
    const factor = this.imgWidth / this.width;
    
    this.scanning = true;
    let t = performance.now();
    let pointsLeft = this.imgSize * 100;
    while (pointsLeft-- > 0) {
      const cr = top + Math.random() * this.height;
      const ci = left + Math.random() * this.width;
      let zr = 0.0;
      let zi = 0.0;
      let tr = 0.0;
      let ti = 0.0;
      let n = 0;
      while (n < this.maxN && tr + ti <= 4.0) {
        this.itersI[n] = zi = 2.0 * zr * zi + ci;
        this.itersR[n] = zr = tr - ti + cr;
        tr = zr * zr;
        ti = zi * zi;
        ++n;
      }
      if (n < this.maxN) {
        for (let i = 0; i < n; ++i) {
          const x = Math.floor((this.itersR[i] - top) * factor);
          const y = Math.floor((this.itersI[i] - left) * factor);
          if (x >= 0 && x < this.imgHeight && y >= 0 && y < this.imgWidth) {
            const z = x * this.imgWidth + y;
            ++this.color[z];
            this.maxColor = Math.max(this.maxColor, this.color[z]);
          }
        }
        this.imageUpdated = true;
      }
      
      if (performance.now() - t > 10) {
        t = await this.sleep();
      }
    }
    this.scanning = false;
  }
  
  renderBuddhabrot() {
    if (this.imageUpdated) {
      this.imageUpdated = false;
      const brightness = 2.5;
      let offset = 0;
      for (let i = 0; i < this.imgSize; ++i) {
        const gray = Math.min(255, Math.round(brightness * 255 * this.color[i] / this.maxColor));
        this.image.data[offset++] = gray;
        this.image.data[offset++] = gray;
        this.image.data[offset++] = gray;
        this.image.data[offset++] = 255;
      }
      this.context.clearRect(0, 0, this.imgWidth, this.imgHeight);
      this.context.putImageData(this.image, 0, 0);
    }
  }
  
  
  start() {
    this.scan();
    this.render();
  }
  
  async render() {
    do {
      this.renderBuddhabrot();
      await this.sleep();
    } while (this.scanning);
  }
  
  // sleep function. use 'await this.sleep()' in async functions
  sleep() { 
    return new Promise(requestAnimationFrame); 
  }
  
}


window.addEventListener('load', event => {
  const canvas = document.getElementById('buddhabrot-canvas');
  const buddhabrot = new Buddhabrot(canvas);
  buddhabrot.start();
});