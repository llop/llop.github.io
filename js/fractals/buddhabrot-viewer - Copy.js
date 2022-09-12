'use strict';



class Buddhabrot {
  
  
  constructor(canvas) {
    // these variables control the render
    this.initialized = false;   // true if histogram for current parameters is built
    this.repaint = false;       // true if there is a need to repaint the canvas
    this.donePainting = false;  // true if all image data has been gathered
    
    // get graphics context from canvas
    // then get image data (pixel array) to paint on
    this.context = canvas[0].getContext("2d");
    this.image = this.context.createImageData(canvas.width(), canvas.height());
    
    // get image dimensions from canvas
    this.imgWidth = canvas.width();
    this.imgHeight = canvas.height();
    
    // center coords
    this.centerX = 0.0;
    this.centerY = 0.0;
    let initialSide = 4.0;
    
    // fit the initial 4x4 area in the canvas
    // the rendered area is centered at (this.centerX, this.centerY) 
    // and its dimensions are this.width * this.height
    this.ratio = this.imgWidth / this.imgHeight;
    if (this.ratio >= 1) {
      this.height = initialSide;
      this.width = initialSide * this.ratio;
    } else {
      this.width = initialSide;
      this.height = initialSide / this.ratio;
    }
    
    // histogram
    this.hist = [];
    
    // sample (this.squareIters)^2 points per pixel
    this.squareIters = 15;

    // color channels
    this.red = [];
    this.green = [];
    this.blue = [];
    
    this.maxRed = 1;
    this.maxGreen = 1;
    this.maxBlue = 1;
    
    // max n values for red, green and blue
    this.maxNRed = 5000;      // red
    this.maxNGreen = 500;     // green
    this.maxNBlue = 50;       // blue
    
    this.minN = 1;
    
    this.brightness = 2.0;
    
    this.itersWaitHistogram = 10;
    this.itersWaitBuddhabrot = 1;
    
    this.volume = 0;
    
    this.latitude = 0.0;    // Math.PI / 4 = 45deg;
    this.longitude = 0.0;   // Math.PI / 4;
    
    this.angRotX = 0.0;     // Math.sin(Math.PI / 4);
    this.angRotY = 0.0;     // Math.sin(Math.PI / 4);
    this.angRotZ = 0.0;     // Math.sin(Math.PI / 4);
      
    // initialize
    this.reload();
  };
  
  
  
  resetDataStructures() {
    this.hist = [];
    this.red = [];
    this.green = [];
    this.blue = [];
    this.maxRed = 1;
    this.maxGreen = 1;
    this.maxBlue = 1;
    for (let i = 0; i < this.imgHeight; ++i) {
      this.hist.push([]);
      this.red.push([]);
      this.green.push([]);
      this.blue.push([]);
      for (let j = 0; j < this.imgWidth; ++j) {
        this.hist[i].push(0);
        this.red[i].push(0);
        this.green[i].push(0);
        this.blue[i].push(0);
      }
    }
  }
  
  
  // initializer function
  // call whenever render parameters change
  async reload() {
    // build a histogram first to paint faster
    // then paint buddhabrot
    this.resetDataStructures();
    await this.buildHistogram();
    this.buildBuddhabrot();
  }

  
  // creates an array of ints of size this.imgWidth * this.imgHeight
  // this.hist[x][y] = 1 if (x, yi) is sure to be outside M; 0 otherwise
  async buildHistogram() {
    // pick the highest this.maxN as max n to build the histogram
    this.histMaxN = Math.max(Math.max(this.maxNRed, this.maxNGreen), this.maxNBlue);
    
    // set proper render vars
    this.initialized = false;
    this.donePainting = false;
    this.repaint = true;
    
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;
    let halfImgWidth = this.imgWidth / 2;
    let inc = this.width / this.imgWidth;
    let halfInc = inc / 2;
    let cr = this.centerX - halfHeight + halfInc;
    let ciIni = this.centerY - halfWidth + halfInc;
    for (let x = 0; x < this.imgHeight; ++x, cr += inc) {
      let ci = ciIni;
      for (let y = 0; y < halfImgWidth; ++y, ci += inc) {
        let zr = 0.0;
        let zi = 0.0;
        let tr = 0.0;
        let ti = 0.0;
        let n = 0;
        while (n < this.histMaxN && tr + ti <= 4.0) {
          zi = 2.0 * zr * zi + ci;
          zr = tr - ti + cr;
          tr = zr * zr;
          ti = zi * zi;
          ++n;
        }
        this.hist[x][y] = this.hist[x][this.imgWidth - y - 1] = n < this.histMaxN;
      }
      if (x % this.itersWaitHistogram == 0) await this.sleep();
    }
    
    let histTmp = [];
    for (let x = 0; x < this.imgHeight; ++x) {
      histTmp.push([]);
      for (let y = 0; y < this.imgWidth; ++y) {
        histTmp[x].push(this.isHistPointGood(x, y));
      }
    }
    this.hist = histTmp;
    
    this.initialized = true;
    this.donePainting = true;
  }
  
  
  // return true if this.hist[x][y] or any of its neighbors is true
  isHistPointGood(x, y) {
    for (let a = Math.max(x - 1, 0); a < Math.min(x + 2, this.imgHeight); ++a)
      for (let b = Math.max(y - 1, 0); b < Math.min(y + 2, this.imgWidth); ++b)
        if (this.hist[a][b]) return true;
    return false;
  }
  
  
  
  /*
  4D to 3D: First of all, we have to decide which 3D object we want to see. 
  Consequently, we have to declare X, Y, and Z. 
  If we want points between two of the Buddhabrot's dimensions to be in these coordinates, we'll also have to define the angle.
  
  3D to 2D: Once defined the 3D object's coordinates, we can easily proceed to 2D -we just have to place the point of view. 
  For that, let's imagine the Buddhabrot is inside a sphere -that belongs to a hypersphere, but a sphere nonetheless. 
  To define where the observer is, we'll use an angle to indicate the latitude, and another for longitude 
  -this procedure would be also useful to render virtual images of the Earth, where it is necessary to flatten the visible part of the planet on the plane. 
  The generic formula to get the coordinates is this:
  
  
  coordX = -x * Sin(long) + y * Cos(long)
  coordY = (x * Cos(long) + y * Sin(long)) * Cos(lat) - z * Sin(lat)
  
  
  As always, a practical example is much more enlightening; 
  the following code will paint a high-angle shot, half turned, of the BuddhaBrot 3D (Zr,Zi,Cr), rotated 45degrees; towards (Cr,Ci,Zi)</p>
  */
  
  
  // 0 - (zr, zi, cr)
  // 1 - (zr, zi, ci)
  // 2 - (cr, ci, zr)
  // 3 - (cr, ci, zi)
  /*
  // rotate from volumeA to volumeB
  getVolumeXYZ(volume, cr, ci, zr, zi) {
    if (volume == 0) return [ zr, zi, cr ];
    if (volume == 1) return [ zr, zi, ci ];
    if (volume == 2) return [ cr, ci, zr ];
    return [ cr, ci, zi ];
  }
  calcXYZ(cr, ci, zr, zi) {
    let coordsA = this.getVolumeXYZ(this.volumeA, cr, ci, zr, zi);
    let coordsB = this.getVolumeXYZ(this.volumeB, cr, ci, zr, zi);
    return [
        coordsA[0] + (coordsB[0] - coordsA[0]) * this.angRotX,
        coordsA[1] + (coordsB[1] - coordsA[1]) * this.angRotY,
        coordsA[2] + (coordsB[2] - coordsA[2]) * this.angRotZ
      ];
  }
  */
  
  getVolumeXYZ(cr, ci, zr, zi) {
    if (this.volume == 0) return [ zr, zi, cr ];
    if (this.volume == 1) return [ zr, zi, ci ];
    if (this.volume == 2) return [ cr, ci, zr ];
    return [ cr, ci, zi ];
  }

  
  // start painting the buddhabrot
  async buildBuddhabrot() {
    // set proper render vars
    this.donePainting = false;
    this.repaint = true;
    
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;
    let halfImgWidth = this.imgWidth / 2;
    let crIni = this.centerX - halfHeight;
    let ciIni = this.centerY - halfWidth;
    let inc = this.width / (this.imgWidth * this.squareIters);
    let ratioTmp = this.imgWidth / this.width;
    
    let iteratesR = [];
    let iteratesI = [];
    for (let i = 0; i < this.histMaxN; ++i) {
      iteratesR.push(0.0);
      iteratesI.push(0.0);
    }
    
    let sinA1 = Math.sin(this.latitude);
    let sinA2 = Math.sin(this.latitude);
    let cosA1 = Math.cos(this.longitude);
    let cosA2 = Math.cos(this.longitude);
    
    for (let a = 0; a < this.imgHeight; ++a) {
      for (let b = 0; b < this.imgWidth; ++b) {
        if (this.hist[a][b]) {
          let cr = crIni + a * this.width / this.imgWidth;
          let ciIniRow = ciIni + b * this.width / this.imgWidth;
          for (let i = 0; i < this.squareIters; ++i, cr += inc) {
            let ci = ciIniRow;
            for (let j = 0; j < this.squareIters; ++j, ci += inc) {
              
              let zr = 0.0;
              let zi = 0.0;
              let tr = 0.0;
              let ti = 0.0;
              let n = 0;
              while (n < this.histMaxN && tr + ti <= 4.0) {
                iteratesI[n] = zi = 2.0 * zr * zi + ci;
                iteratesR[n] = zr = tr - ti + cr;
                tr = zr * zr;
                ti = zi * zi;
                ++n;
              }
              
              if (n >= this.minN && n < this.histMaxN) {
                for (let k = 0; k < n; ++k) {
                  let coords = this.getVolumeXYZ(cr, ci, iteratesR[k], iteratesI[k]);
                  let x = Math.round(((-coords[1] * sinA2 + coords[0] * cosA2) - crIni) * ratioTmp);
                  let y = Math.round((((coords[1] * cosA2 + coords[0] * sinA2) * cosA1 - coords[2] * sinA1) - ciIni) * ratioTmp);
                  if (x >= 0 && x < this.imgHeight && y >= 0 && y < this.imgWidth) {
                    if (n < this.maxNRed && ++this.red[x][y] > this.maxRed) this.maxRed = this.red[x][y];
                    if (n < this.maxNGreen && ++this.green[x][y] > this.maxGreen) this.maxGreen = this.green[x][y];
                    if (n < this.maxNBlue && ++this.blue[x][y] > this.maxBlue) this.maxBlue = this.blue[x][y];
                  }
                }
              }
            }
          }
        }
      }
      if (a % this.itersWaitBuddhabrot == 0) await this.sleep();      
    }
    this.donePainting = true;
  }
  
  
  
  // draw the buddhabroot 1000*800 = 800000
  renderBuddhabrot() {
    let offset = 0;
    
    for (let x = 0; x < this.imgHeight; ++x) {
      for (let y = 0; y < this.imgWidth; ++y) {
        
      }
    }
    for (let x = 0; x < this.imgHeight; ++x) {
      for (let y = 0; y < this.imgWidth; ++y) {
        let redCh = (255 * this.red[x][y] / this.maxRed) | 0;
        let greenCh = (255 * this.green[x][y] / this.maxGreen) | 0;
        let blueCh = (255 * this.blue[x][y] / this.maxBlue) | 0;
        
        //let gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        
        this.image.data[offset++] = redCh;
        this.image.data[offset++] = greenCh;
        this.image.data[offset++] = blueCh;
        this.image.data[offset++] = 255;
      }
    }
    if (this.donePainting) this.repaint = false;
  }
  
  // draw the histogram
  renderHistogram() {
    let offset = 0;
    for (let x = 0; x < this.imgHeight; ++x) {
      for (let y = 0; y < this.imgWidth; ++y) {
        let color = this.hist[x][y] ? 255 : 0;
        this.image.data[offset++] = color;
        this.image.data[offset++] = color;
        this.image.data[offset++] = color;
        this.image.data[offset++] = 255;
      }
    }
    if (this.donePainting) this.repaint = false;
  }
  
  // render 
  render() {
    if (!this.repaint) return;
    this.context.clearRect(0, 0, this.imgWidth, this.imgHeight);
    if (this.initialized) this.renderBuddhabrot();
    else this.renderHistogram();
    this.context.putImageData(this.image, 0, 0);
  }

  
  // sleep function. use 'await this.sleep()' in async functions
  sleep() { return new Promise(res => setTimeout(res, 0)); }
  
}



//-----------------------------------------------------------------------------------------
// 
// 
// 
//-----------------------------------------------------------------------------------------

var buddhabrot;

function renderLoop() {
  buddhabrot.render();
  requestAnimationFrame(renderLoop);    // setTimeout(renderLoop, 200);
}

$(() => {
  buddhabrot = new Buddhabrot($('#buddhabrot-canvas'));
  renderLoop();
});

























