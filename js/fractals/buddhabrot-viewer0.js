'use strict';



class Buddhabrot {
  
  static DEFAULTS = {
    squareIters: 15,
    maxNRed: 5000,
    maxNGreen: 500,
    maxNBlue: 50,
    histMaxN: 5000,
    minN: 1,
    brightness: 3.0,
    colorCap: 15000,
    itersWaitHistogram: 10,
    itersWaitBuddhabrot: 2,
    latitude: 0.0,
    longitude: 0.0,
    angRot: [
        0.0,
        0.0,
        0.0
      ],
    volumeA: [ 
        'zr', 
        'zi', 
        'cr' 
      ],
    volumeB: [ 
        'cr', 
        'ci', 
        'zi' 
      ],
    progressColor: '#0f0',
    axesColors: [ 
        '#9606b4', 
        '#ff8d12', 
        '#fff000' 
      ]
  };
  
  static DIMENSIONS = {
    'zr': 0,
    'zi': 1,
    'cr': 2,
    'ci': 3
  };
  
  
  constructor(canvas, options) {
    
    // these variables control the render
    this.initialized = false;       // true if histogram for current parameters is built
    this.repaint = false;           // true if there is a need to repaint the canvas
    this.donePainting = false;      // true if all image data has been gathered
    this.progress = -1;             // 0-1, how much of the plane has been scanned to render the buddhabrot
    this.awaitingPromise = false;   // true if repaint was called, but the process has not yet started
    this.cancelRender = false;      // true when the render needs to get canceled
    this.showAxes = false;          // true if axes are to be painted
    
    // get graphics context from canvas
    // then get image data (pixel array) to paint on
    this.context = canvas[0].getContext('2d');
    this.context.lineJoin = 'round';
    this.context.lineWidth = 3;
    this.context.font = '18px Georgia';
    this.context.fillStyle = '#fff';
    this.image = this.context.createImageData(canvas.width(), canvas.height());
    
    // get image dimensions from canvas
    this.imgWidth = canvas.width();
    this.imgHeight = canvas.height();
    this.imgSize = this.imgWidth * this.imgHeight;
    
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
    
    this.imgHist = new Uint32Array(256);
    this.maxRed = 1;
    this.maxGreen = 1;
    this.maxBlue = 1;
    this.initDataStructures();
    
    this.applyOptions(options);
  };
  
  
  applyOptions(options) {
    // create options by merging argument and defaults
    options = Object.assign({}, Buddhabrot.DEFAULTS, options || {});
    
    // sample (this.squareIters)^2 points per pixel
    this.squareIters = options.squareIters;
    
    // max n values for red, green and blue
    this.maxNRed = options.maxNRed; 
    this.maxNGreen = options.maxNGreen; 
    this.maxNBlue = options.maxNBlue; 
    this.histMaxN = options.histMaxN;
    
    this.minN = options.minN;
    
    this.brightness = options.brightness;
    this.colorCap = options.colorCap;
    
    this.itersWaitHistogram = options.itersWaitHistogram;
    this.itersWaitBuddhabrot = options.itersWaitBuddhabrot;
    
    this.latitude = options.latitude;    // Math.PI / 4 = 45deg;
    this.longitude = options.longitude;
    this.buildRotationMatrix();
    
    this.angRotX = options.angRot[0];
    this.angRotY = options.angRot[1];
    this.angRotZ = options.angRot[2];
    
    this.volumeAX = Buddhabrot.DIMENSIONS[options.volumeA[0]];
    this.volumeAY = Buddhabrot.DIMENSIONS[options.volumeA[1]];
    this.volumeAZ = Buddhabrot.DIMENSIONS[options.volumeA[2]];
    
    this.volumeBX = Buddhabrot.DIMENSIONS[options.volumeB[0]];
    this.volumeBY = Buddhabrot.DIMENSIONS[options.volumeB[1]];
    this.volumeBZ = Buddhabrot.DIMENSIONS[options.volumeB[2]];
      
    this.progressColor = options.progressColor;
    
    this.axisXColor = options.axesColors[0];
    this.axisYColor = options.axesColors[1];
    this.axisZColor = options.axesColors[2];
  }
  
  initDataStructures() {
    this.hist = new Uint8Array(this.imgSize);
    this.gray = new Uint32Array(this.imgSize);
    this.red = new Uint32Array(this.imgSize);
    this.green = new Uint32Array(this.imgSize);
    this.blue = new Uint32Array(this.imgSize);
    for (let i = 0; i < this.imgSize; ++i) {
      this.hist[i] = 0;
      this.gray[i] = 0;
      this.red[i] = 0;
      this.green[i] = 0;
      this.blue[i] = 0;
    }
  }
  
  resetDataStructures() {
    this.maxRed = 1;
    this.maxGreen = 1;
    this.maxBlue = 1;
    for (let i = 0; i < this.imgSize; ++i) {
      this.red[i] = 0;
      this.green[i] = 0;
      this.blue[i] = 0;
    }
  }
  
  setLatitudeLongitude(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.buildRotationMatrix();
  }
  
  buildRotationMatrix() {
    let cosb = Math.cos(this.longitude);
    let sinb = Math.sin(this.longitude);

    let cosc = Math.cos(this.latitude);
    let sinc = Math.sin(this.latitude);
    
    this.Axx = cosb;
    this.Axy = sinb * sinc;
    this.Axz = sinb * cosc;

    this.Ayy = cosc;
    this.Ayz = -sinc;

    this.Azx = -sinb;
    this.Azy = cosb * sinc;
    this.Azz = cosb * cosc;
  }
  
  
  // initializer function
  async initialize(callback) {
    // build a histogram first to paint faster
    // then paint buddhabrot
    await this.buildHistogram();
    this.buddhabrotPromise = this.buildBuddhabrot();
    this.buddhabrotPromise.then(callback);
  }
  
  
  async requestRepaint(callback) {
    if (!this.initialized || this.awaitingPromise) {
      callback();
      return;
    }
    
    this.awaitingPromise = true;
    if (this.buddhabrotPromise) {
      this.cancelRender = true;
      await this.buddhabrotPromise;
    }
    
    this.resetDataStructures();
    this.buddhabrotPromise = this.buildBuddhabrot();
    this.buddhabrotPromise.then(callback);
    
    this.awaitingPromise = false;
  }
  
  get painting() {
    return !this.donePainting;
  }
  
  
  // creates an array of ints of size this.imgWidth * this.imgHeight
  // this.hist[x][y] = 1 if (x, yi) is sure to be outside M; 0 otherwise
  async buildHistogram() {
    
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
        this.hist[x * this.imgWidth + y] = this.hist[x * this.imgWidth + (this.imgWidth - y - 1)] = n < this.histMaxN;
      }
      if (x % this.itersWaitHistogram == 0) await this.sleep();
    }
    
    let histTmp = new Uint8Array(this.imgSize);
    for (let x = 0; x < this.imgHeight; ++x) for (let y = 0; y < this.imgWidth; ++y) 
      histTmp[x * this.imgWidth + y] = this.isHistPointGood(x, y);
    this.hist = histTmp;
    this.initialized = true;
  }
  
  // return true if this.hist[x][y] or any of its neighbors is true
  isHistPointGood(x, y) {
    for (let a = Math.max(x - 1, 0); a < Math.min(x + 2, this.imgHeight); ++a)
      for (let b = Math.max(y - 1, 0); b < Math.min(y + 2, this.imgWidth); ++b)
        if (this.hist[a * this.imgWidth + b]) return 1;
    return 0;
  }
  
  
  setColorsMaxN(maxNRed, maxNGreen, maxNBlue) {
    this.maxNRed = maxNRed;
    this.maxNGreen = maxNGreen;
    this.maxNBlue = maxNBlue;
  }
  
  setAngRot(angRotX, angRotY, angRotZ) {
    this.angRotX = angRotX;
    this.angRotY = angRotY;
    this.angRotZ = angRotZ;
  }
  
  
  setVolumeA(x, y, z) {
    this.volumeAX = Buddhabrot.DIMENSIONS[x];
    this.volumeAY = Buddhabrot.DIMENSIONS[y];
    this.volumeAZ = Buddhabrot.DIMENSIONS[z];
  }
  
  setVolumeB(x, y, z) {
    this.volumeBX = Buddhabrot.DIMENSIONS[x];
    this.volumeBY = Buddhabrot.DIMENSIONS[y];
    this.volumeBZ = Buddhabrot.DIMENSIONS[z];
  }
  
  getXYZ(zr, zi, cr, ci) {
    let coords = [ zr, zi, cr, ci ];
    let x1 = coords[this.volumeAX];
    let y1 = coords[this.volumeAY];
    let z1 = coords[this.volumeAZ];
    let x2 = coords[this.volumeBX];
    let y2 = coords[this.volumeBY];
    let z2 = coords[this.volumeBZ];
    return [
        x1 + (x2 - x1) * this.angRotX,
        y1 + (y2 - y1) * this.angRotY,
        z1 + (z2 - z1) * this.angRotZ,
      ];
  }

  
  // start painting the buddhabrot
  async buildBuddhabrot() {
    // set proper render vars
    this.donePainting = false;
    this.repaint = true;
    this.progress = 0;
    this.cancelRender = false;
    
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;
    let halfImgWidth = this.imgWidth / 2;
    let crIni = this.centerX - halfHeight;
    let ciIni = this.centerY - halfWidth;
    let inc = this.width / (this.imgWidth * this.squareIters);
    let ratioTmp = this.imgWidth / this.width;
    
    let iteratesR = new Float64Array(this.histMaxN);
    let iteratesI = new Float64Array(this.histMaxN);
    for (let i = 0; i < this.histMaxN; ++i) {
      iteratesR[i] = 0.0;
      iteratesI[i] = 0.0;
    }
    
    this.buildRotationMatrix();
    
    let maxN = Math.max(Math.max(this.maxNRed, this.maxNGreen), this.maxNBlue);
    
    for (let a = 0; a < this.imgHeight; ++a) {
      for (let b = 0; b < this.imgWidth; ++b) {
        if (this.cancelRender) return;
        if (this.hist[a * this.imgWidth + b]) {
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
              while (n < maxN && tr + ti <= 4.0) {
                iteratesI[n] = zi = 2.0 * zr * zi + ci;
                iteratesR[n] = zr = tr - ti + cr;
                tr = zr * zr;
                ti = zi * zi;
                ++n;
              }
              
              if (n >= this.minN && n < maxN) {
                for (let k = 0; k < n; ++k) {
                  let coords = this.getXYZ(iteratesR[k], iteratesI[k], cr, ci);
                  
                  let x = Math.round(((this.Axx * coords[0] + this.Axy * coords[1] + this.Axz * coords[2]) - crIni) * ratioTmp);
                  let y = Math.round(((this.Ayy * coords[1] + this.Ayz * coords[2]) - ciIni) * ratioTmp);
                  
                  if (x >= 0 && x < this.imgHeight && y >= 0 && y < this.imgWidth) {
                    let z = x * this.imgWidth + y;
                    if (n < this.maxNRed && ++this.red[z] > this.maxRed) this.maxRed = this.red[z];
                    if (n < this.maxNGreen && ++this.green[z] > this.maxGreen) this.maxGreen = this.green[z];
                    if (n < this.maxNBlue && ++this.blue[z] > this.maxBlue) this.maxBlue = this.blue[z];
                  }
                }
              }
            }
          }
        }
      }
      this.progress = (a + 1) / this.imgHeight;
      if (a % this.itersWaitBuddhabrot == 0) await this.sleep();      
    }
    
    this.progress = -1;
    this.donePainting = true;
  }
  
  
  
  // draw the buddhabrot
  renderBuddhabrot() {
    for (let i = 0; i < 256; ++i) this.imgHist[i] = 0;
    let offset = 0;
    for (let i = 0; i < this.imgSize; ++i) {
      let redCh = Math.floor(255.0 * Math.min(this.colorCap, this.red[i]) / Math.min(this.colorCap, this.maxRed));
      let greenCh = Math.floor(255.0 * Math.min(this.colorCap, this.green[i]) / Math.min(this.colorCap, this.maxGreen));
      let blueCh = Math.floor(255.0 * Math.min(this.colorCap, this.blue[i]) / Math.min(this.colorCap, this.maxBlue));
      this.gray[i] = Math.round(redCh * 0.299 + greenCh * 0.587 + blueCh * 0.114);
      ++this.imgHist[this.gray[i]];
      
      this.image.data[offset++] = redCh;
      this.image.data[offset++] = greenCh;
      this.image.data[offset++] = blueCh;
      ++offset;
    }
    
    for (let i = 1; i < 256; ++i) this.imgHist[i] += this.imgHist[i - 1];
    for (let i = offset = 0; i < this.imgSize; ++i) {
      let factor = this.brightness * this.imgHist[this.gray[i]] / this.imgSize;
      this.image.data[offset] = Math.min(255, factor * this.image.data[offset++]);
      this.image.data[offset] = Math.min(255, factor * this.image.data[offset++]);
      this.image.data[offset] = Math.min(255, factor * this.image.data[offset++]);
      this.image.data[offset++] = 255;
    }
    if (this.donePainting) this.repaint = false;
  }
  
  
  // draw the histogram
  renderHistogram() {
    let offset = 0;
    for (let i = 0; i < this.imgSize; ++i) {
      let color = this.hist[i] ? 255 : 0;
      this.image.data[offset++] = color;
      this.image.data[offset++] = color;
      this.image.data[offset++] = color;
      this.image.data[offset++] = 255;
    }
  }
  
  
  renderProgress() {
    this.context.lineWidth = 4;
    this.context.strokeStyle = this.progressColor;
    this.context.beginPath();
    this.context.moveTo(1, this.imgHeight - 1);
    this.context.lineTo(this.progress * this.imgWidth, this.imgHeight - 1);
    this.context.closePath();
    this.context.stroke();
  }
  
  /*
  rotate(x, y, z) {
    let cosa = Math.cos(0.0);   // yaw
    let sina = Math.sin(0.0);

    let cosb = Math.cos(this.longitude);  // pitch
    let sinb = Math.sin(this.longitude);

    let cosc = Math.cos(this.latitude);   // roll
    let sinc = Math.sin(this.latitude);

    let Axx = cosa * cosb;
    let Axy = cosa * sinb * sinc - sina * cosc;
    let Axz = cosa * sinb * cosc + sina * sinc;

    let Ayx = sina * cosb;
    let Ayy = sina * sinb * sinc + cosa * cosc;
    let Ayz = sina * sinb * cosc - cosa * sinc;

    let Azx = -sinb;
    let Azy = cosb * sinc;
    let Azz = cosb * cosc;
    
    return [
        Axx * x + Axy * y + Axz * z,
        Ayx * x + Ayy * y + Ayz * z,
        Azx * x + Azy * y + Azz * z
      ];
  }
  
  //let sinA1 = Math.sin(0);
  //let sinA2 = Math.sin(0);
  //let cosA1 = Math.cos(0);
  //let cosA2 = Math.cos(0);
  
  //let coords = this.rotate(-1.5, 0.0, 0.0);
  //let x = Math.round(((-coords[1] * sinA2 + coords[0] * cosA2) - crIni) * ratioTmp);
  //let y = Math.round((((coords[1] * cosA2 + coords[0] * sinA2) * cosA1 - coords[2] * sinA1) - ciIni) * ratioTmp);
  */
  
  
  renderAxes() {
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;
    let crIni = this.centerX - halfHeight;
    let ciIni = this.centerY - halfWidth;
    let ratioTmp = this.imgWidth / this.width;
    
    let x0 = this.imgHeight / 2;
    let y0 = this.imgWidth / 2;
    let factor = 1.1;
    
    let axes = [
        [ 
          Math.round(((-1.5 * this.Axx) - crIni) * ratioTmp), 
          Math.round(-ciIni * ratioTmp), 
          -1.5 * this.Azx, 
          this.axisXColor
        ],
        [ 
          Math.round(((-1.5 * this.Axy) - crIni) * ratioTmp), 
          Math.round(((-1.5 * this.Ayy) - ciIni) * ratioTmp), 
          -1.5 * this.Azy, 
          this.axisYColor
        ],
        [ 
          Math.round(((-1.5 * this.Axz) - crIni) * ratioTmp), 
          Math.round(((-1.5 * this.Ayz) - ciIni) * ratioTmp), 
          -1.5 * this.Azz, 
          this.axisZColor
        ]
      ];
    axes.sort((a, b) => { return a[2] - b[2]; });  
    
    this.context.lineWidth = 3;
    for (let i = 0; i < 3; ++i) {
      let x = axes[i][0];
      let y = axes[i][1];
      this.context.strokeStyle = axes[i][3];
      this.context.beginPath();
      this.context.moveTo(y0, x0);
      this.context.lineTo(y, x);
      this.context.closePath();
      this.context.stroke();
      //y = y0 + (y - y0) * factor;
      //x = x0 + (x - x0) * factor;
      //this.context.fillText(axes[i][4], y, x);
    }
  }
  
  // render 
  render() {
    this.context.clearRect(0, 0, this.imgWidth, this.imgHeight);
    if (this.repaint) {
      if (this.initialized) this.renderBuddhabrot();
      else this.renderHistogram();
    }
    this.context.putImageData(this.image, 0, 0);
    if (this.progress >= 0) this.renderProgress();
    if (this.showAxes) this.renderAxes();
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

var canvas;

var rotationRepaint;

var redSlider;
var greenSlider;
var blueSlider;

var redInput;
var greenInput;
var blueInput;

var redValue;
var greenValue;
var blueValue;

var mouseDown;
var mouseXIni;
var mouseYIni;

var repaintButton;
var resetButton;

var densitySelect;
var densityMap;

var volAXSelect;
var volAYSelect;
var volAZSelect;
var volBXSelect;
var volBYSelect;
var volBZSelect;

var volumeSlider;
var volumeSliderMax;

var defaultOptions;


function reset() {
  // set defaults on buddhabrot then repaint
  setUIOptions(defaultOptions);
  setOptionsAndRepaint(defaultOptions);
}

function repaint() {
  let options = getUIOptions();
  setOptionsAndRepaint(options);
}

function setOptionsAndRepaint(options) {
  buddhabrot.squareIters = options.squareIters;
  buddhabrot.setColorsMaxN(options.maxNRed, options.maxNGreen, options.maxNBlue);
  buddhabrot.setLatitudeLongitude(options.latitude, options.longitude);
  buddhabrot.setAngRot(options.angRot[0], options.angRot[1], options.angRot[2]);
  buddhabrot.setVolumeA(options.volumeA[0], options.volumeA[1], options.volumeA[2]);
  buddhabrot.setVolumeB(options.volumeB[0], options.volumeB[1], options.volumeB[2]);
  canvas.css('cursor', 'wait');
  buddhabrot.requestRepaint(() => { canvas.css('cursor', 'default'); });
}

function mouseDownHandler(event) {
  if (buddhabrot.painting) return;
  
  if (event.which == 1) {
    rotationRepaint = false;
    buddhabrot.showAxes = true;
    mouseDown = true;
    mouseXIni = event.pageX - canvas.position().left;
    mouseYIni = event.pageY - canvas.position().top;
    
    canvas.css('cursor', 'pointer');
  }
}

function mouseMoveHandler(event) {
  if (mouseDown) {
    let mouseX = event.pageX - canvas.position().left;
    let mouseY = event.pageY - canvas.position().top;
    
    let offsetX = (mouseX - mouseXIni) * Math.PI / 500;
    let offsetY = (mouseY - mouseYIni) * Math.PI / 500;
    
    let newLat = buddhabrot.latitude + offsetX;
    while (newLat > 2.0 * Math.PI) newLat -= 2.0 * Math.PI;
    while (newLat < 0.0) newLat += 2.0 * Math.PI;
    
    let newLon = buddhabrot.longitude + offsetY;
    while (newLon > 2.0 * Math.PI) newLon -= 2.0 * Math.PI;
    while (newLon < 0.0) newLon += 2.0 * Math.PI;
    
    buddhabrot.setLatitudeLongitude(newLat, newLon);
    rotationRepaint = true;
    
    mouseXIni = mouseX;
    mouseYIni = mouseY;
  }
}

function mouseUpHandler(event) {
  if (mouseDown) {
    mouseDown = false;
    buddhabrot.showAxes = false;
    canvas.css('cursor', 'default');
    if (rotationRepaint) {
      rotationRepaint = false;
      repaint();
    }
  }
}


function getUIOptions() {
  let newAngRot = Math.sin((Math.PI * volumeSlider.val()) / (2.0 * volumeSliderMax));
  return {
      squareIters: densityMap[densitySelect.val()],
      maxNRed: redValue,
      maxNGreen: greenValue,
      maxNBlue: blueValue,
      latitude: buddhabrot.latitude,
      longitude: buddhabrot.longitude,
      angRot: [ newAngRot, newAngRot, newAngRot ],
      volumeA: [
          volAXSelect.children('option:selected').val(),
          volAYSelect.children('option:selected').val(),
          volAZSelect.children('option:selected').val()
        ],
      volumeB: [
          volBXSelect.children('option:selected').val(),
          volBYSelect.children('option:selected').val(),
          volBZSelect.children('option:selected').val()
        ]
    };  
  return options;
}

function initUI() {
  canvas = $('#buddhabrot-canvas');
  
  // add mouse event handlers
  canvas.mousedown(mouseDownHandler);
  $(document).mousemove(mouseMoveHandler);
  $(document).mouseup(mouseUpHandler);
  
  
  // color inputs
  redInput = $('#red-input');
  greenInput = $('#green-input');
  blueInput = $('#blue-input');
  
  redInput.bind('input keyup mouseup', () => {
    let val = redInput.val();
    if ($.isNumeric(val)) {
      val = Number(val) | 0;
      if (val < 1 || val > 5000) val = redValue;
    } else {
      val = redValue;
    }
    redValue = val;
    redInput.val(val);
    redSlider.val(val);
  });
  greenInput.bind('input keyup mouseup', () => {
    let val = greenInput.val();
    if ($.isNumeric(val)) {
      val = Number(val) | 0;
      if (val < 1 || val > 5000) val = greenValue;
    } else {
      val = greenValue;
    }
    greenValue = val;
    greenInput.val(val);
    greenSlider.val(val);
  });
  blueInput.bind('input keyup mouseup', () => {
    let val = blueInput.val();
    if ($.isNumeric(val)) {
      val = Number(val) | 0;
      if (val < 1 || val > 5000) val = blueValue;
    } else {
      val = blueValue;
    }
    blueValue = val;
    blueInput.val(val);
    blueSlider.val(val);
  });
  
  // color sliders
  redSlider = $('#red-slider');
  greenSlider = $('#green-slider');
  blueSlider = $('#blue-slider');
  
  redSlider.on('input change', () => { 
    redValue = redSlider.val();
    redInput.val(redValue);
  });
  greenSlider.on('input change', () => { 
    greenValue = greenSlider.val();
    greenInput.val(greenValue);
  });
  blueSlider.on('input change', () => { 
    blueValue = blueSlider.val();
    blueInput.val(blueValue);
  });
  
  resetButton = $('#reset-btn');
  repaintButton = $('#repaint-btn');
  
  resetButton.click(() => { reset(); });
  repaintButton.click(() => { repaint(); });

  volAXSelect = $('#volAX');
  volAYSelect = $('#volAY');
  volAZSelect = $('#volAZ');
  volBXSelect = $('#volBX');
  volBYSelect = $('#volBY');
  volBZSelect = $('#volBZ');
  
  volumeSlider = $('#volume-slider');
  volumeSliderMax = 1000;
  
  densitySelect = $('#density-select');
  
  setUIOptions(defaultOptions);
}

function setUIOptions(options) {
  if (options.squareIters == densityMap.low) densitySelect.val('low');
  else if (options.squareIters == densityMap.standard) densitySelect.val('standard');
  else densitySelect.val('hi');
  
  volumeSlider.val(Math.asin(options.angRot[0]) * volumeSliderMax);
  
  redValue = options.maxNRed;
  greenValue = options.maxNGreen;
  blueValue = options.maxNBlue;
  
  redInput.val(redValue);
  greenInput.val(greenValue);
  blueInput.val(blueValue);
  
  redSlider.val(redValue);
  greenSlider.val(greenValue);
  blueSlider.val(blueValue);
  
  volAXSelect.val(options.volumeA[0]);
  volAYSelect.val(options.volumeA[1]);
  volAZSelect.val(options.volumeA[2]);
  volBXSelect.val(options.volumeB[0]);
  volBYSelect.val(options.volumeB[1]);
  volBZSelect.val(options.volumeB[2]);
}

function renderLoop() {
  buddhabrot.render();
  requestAnimationFrame(renderLoop);    // setTimeout(renderLoop, 200);
}

$(() => {
  defaultOptions = {
      squareIters: 7.5,
      maxNRed: 5000,
      maxNGreen: 500,
      maxNBlue: 50,
      latitude: 0.0,
      longitude: 0.0,
      angRot: [ 0.0, 0.0, 0.0 ],
      volumeA: [ 'zr', 'zi', 'cr' ],
      volumeB: [ 'cr', 'ci', 'zi' ]
    };
  densityMap = {
      'low': 3.75,
      'standard': 7.5,
      'hi': 15
    };
  initUI();
  
  canvas.css('cursor', 'wait');
  buddhabrot = new Buddhabrot(canvas, defaultOptions);
  buddhabrot.initialize(() => { canvas.css('cursor', 'default'); });
  renderLoop();
});

























