var canvas;
var context;
var image;

var drawing = true;

var mouseXIni;
var mouseYIni;
var mouseX;
var mouseY;

var mouseDown = false;

var ratio;
var center;
var width;
var height;

var limit;
var minLimit;
var maxLimit;

var increment;
var crIni;
var ciIni;
var currentLine;

var logBase = 1.0 / Math.log(2.0);
var logHalfBase = Math.log(0.5) * logBase;

var time;
var fInterval;

var resetBtn;
var iterationsInput;
var repaintBtn;
var zoomOutBtn;

var mandelbrotParams;

function initVars() {
  canvas = $("#mandelbrot-canvas");
  ratio = canvas.width() / canvas.height();
  context = canvas[0].getContext("2d");
  context.lineWidth = 2;
  context.strokeStyle = '#0F0';
  image = context.createImageData(canvas.width(), canvas.height());
  
  defaultCenterAndWidth();
  
  timeout = 100;
  
  minLimit = 100;
  maxLimit = 100000;
  
  iterationsInput = $('#iter-inp');
  iterationsInput.attr({ 'max' : maxLimit, 'min' : minLimit });
  
  defaultIterations();
  
  resetBtn = $('#reset-btn');
  repaintBtn = $('#repaint-btn');
  zoomOutBtn = $('#zoom-out-btn');
  
  mandelbrotParams = $('#mandelbrot-params');
  setMandelbrotParams();
  
  startDrawing();
}

function setMandelbrotParams() {
  var str = 'Center @ (' + center[0] + ', ' + center[1] + 'i); &nbsp; Width: ' + width + '; &nbsp; Height: ' + height;
  mandelbrotParams.html(str);
}

function defaultCenterAndWidth() {
  // canvas.width     image.width      canvas.height   image.height
  // ------------- = ------------  =>  ------------- = ------------  
  // canvas.height   image.height      canvas.width     image.width
  center = [ -0.5, 0.0 ];
  height = 3.0;
  width = height * ratio;
}

function defaultIterations() {
  limit = 100;
  iterationsInput.val(limit);
}

function startDrawing() {
  drawing = true;
  
  // disable buttons
  canvas.css('cursor', 'progress');
  
  
  var newLimit = iterationsInput.val();
  if ($.isNumeric(newLimit) && newLimit >= minLimit && newLimit <= maxLimit) limit = newLimit;
  else iterationsInput.val(limit);
  
  setMandelbrotParams();
  
  increment = width / canvas.width();
  var hincrement = increment / 2.0;
  var hwidth = width / 2.0;
  var hheight = height / 2.0;
  ciIni = center[1] - hwidth + hincrement;
  crIni = center[0] - hheight + hincrement;
  currentLine = 0;
  
  requestAnimationFrame(doDraw);
}

function doDraw() {
  time = Date.now();
  draw();
}

function draw() {
  // draw 1 mandelbrot line
  var offset = 4 * canvas.width() * currentLine;
  var cr = crIni + increment * currentLine;
  var ci = ciIni;
  for (var i = 0; i < canvas.width(); ++i, ci += increment) {
    var zr = 0.0;
    var zi = 0.0;
    var tr = 0.0;
    var ti = 0.0;
    var n = 0;
    while (n < limit && tr + ti <= 4.0) {
      zi = 2 * zr * zi + ci;
      zr = tr - ti + cr;
      tr = zr * zr;
      ti = zi * zi;
      ++n;
    }
    var c = n == limit ? [ 0, 0, 0 ] : color(n, tr, ti);
    image.data[offset++] = c[2];
    image.data[offset++] = c[1];
    image.data[offset++] = c[0];
    image.data[offset++] = 255;
  }
  
  ++currentLine;
  if (currentLine != canvas.height()) {
    if (Date.now() - time >= timeout) {
      bottomLine();
      render();
      requestAnimationFrame(doDraw);
    } else {
      draw();
    }
  } else {
    render();
    drawing = false;
    canvas.css('cursor', 'default');
  }
}

function hsvToRgb(h, s, v) {
  if (v > 1.0) v = 1.0;
  var hp = h / 60.0;
  var c = v * s;
  var x = c * (1 - Math.abs((hp % 2) - 1));
  var r, g, b;

  if (0 <= hp && hp < 1) r = c, g = x, b = 0;
  else if (1 <= hp && hp < 2) r = x, g = c, b = 0;
  else if (2 <= hp && hp < 3) r = 0, g = c, b = x;
  else if (3 <= hp && hp < 4) r = 0, g = x, b = c;
  else if (4 <= hp && hp < 5) r = x, g = 0, b = c;
  else if (5 <= hp && hp < 6) r = c, g = 0, b = x;

  var m = v - c;
  r += m;
  g += m;
  b += m;
  return [ r * 255, g * 255, b * 255 ];
}

function color(n, tr, ti) {
  var col = 1.0 + n - logHalfBase - Math.log(Math.log(tr + ti)) * logBase;
  col = Math.floor(360.0 * col / limit);
  return hsvToRgb(col, 1.0, 16.0 * col / limit);
}

function bottomLine() {
  // draw a red line at the bottom
  var offset = 4 * canvas.width() * currentLine;
  for (var i = 0; i < Math.min(2, canvas.width() - currentLine); ++i) {
    for (var j = 0; j < canvas.width(); ++j) {
      image.data[offset++] = 255;
      image.data[offset++] = 0;
      image.data[offset++] = 0;
      image.data[offset++] = 255;
    }
  }
}

function render() {
  context.clearRect(0, 0, canvas.width(), canvas.height());
  context.putImageData(image, 0, 0);
  if (mouseDown) drawSelection();
}

function drawSelection() {
  var x0 = Math.max(0, Math.min(mouseXIni, mouseX));
  var y0 = Math.max(0, Math.min(mouseYIni, mouseY));
  var x1 = Math.min(canvas.width(), Math.max(mouseXIni, mouseX));
  var y1 = Math.min(canvas.height(), Math.max(mouseYIni, mouseY));
  context.strokeRect(x0, y0, x1 - x0, y1 - y0);
}

function mouseDownHandler(event) {
  if (drawing) return;
  if (mouseDown) {
    mouseDown = false;
    render();
  } else {
    if (event.which == 1) {
      mouseDown = true;
      mouseXIni = event.pageX - canvas.position().left;
      mouseYIni = event.pageY - canvas.position().top;
    }
  }
}

function setMouseCoords(event) {
  mouseX = event.pageX - canvas.position().left;
  mouseY = event.pageY - canvas.position().top;
  
  mouseX = Math.max(0, Math.min(canvas.width(), mouseX));
  mouseY = Math.max(0, Math.min(canvas.height(), mouseY));
  
  var disX = Math.abs(mouseX - mouseXIni);
  var disY = Math.abs(mouseY - mouseYIni);
  var sratio = disX / disY;
  if (sratio > ratio) disX = disY * ratio;
  else disY = disX / ratio;
  
  mouseX = mouseX < mouseXIni ? mouseXIni - disX : mouseXIni + disX;
  mouseY = mouseY < mouseYIni ? mouseYIni - disY : mouseYIni + disY;
}

function mouseMoveHandler(event) {
  if (drawing) return;
  if (mouseDown) {
    setMouseCoords(event);
    render();
  }
}

function setSelectionCenterAndWidth() {
  var hwidth = width / 2.0;
  var hheight = height / 2.0;
  var top = center[1] - hwidth;
  var left = center[0] - hheight;
  
  var x0 = Math.max(0, Math.min(mouseXIni, mouseX));
  var y0 = Math.max(0, Math.min(mouseYIni, mouseY));
  var x1 = Math.min(canvas.width(), Math.max(mouseXIni, mouseX));
  var y1 = Math.min(canvas.height(), Math.max(mouseYIni, mouseY));
  
  center[1] = top + ((x0 + x1) / 2) * width / canvas.width();
  center[0] = left + ((y0 + y1) / 2) * height / canvas.height();
  width = (x1 - x0) * width / canvas.width();
  height = width / ratio;
}

function mouseUpHandler(event) {
  if (drawing) return;
  if (mouseDown) {
    mouseDown = false;
    if (event.which == 1) {
      setMouseCoords(event);
      setSelectionCenterAndWidth();
      startDrawing();
    } else render();
  }
}

function zoomOut() {
  width *= 2.0;
  height *= 2.0;
  if (height >= 3.0) defaultCenterAndWidth();
  startDrawing();
}

function keyDownHandler(event) {
  if (drawing) return;
  if (iterationsInput.is(":focus")) return;
  var code = event.keyCode || event.which;
  if (code == 109 || code == 189) {
    zoomOut();
  }
}

function reset() {
  defaultCenterAndWidth();
  defaultIterations();
  startDrawing();
}

function resetClickHandler() {
  if (drawing) return;
  reset();
}

function repaintClickHandler() {
  if (drawing) return;
  startDrawing();
}

function zoomOutClickHandler() {
  if (drawing) return;
  zoomOut();
}

function iterationsKeyPressHandler(event) {
  if ((event.keyCode || event.which) == 13) {
    if (drawing) return;
    startDrawing();
    return false;
  }
}

$(function(){
  initVars();
  
  canvas.mousedown(mouseDownHandler);
  $(document).mousemove(mouseMoveHandler);
  $(document).mouseup(mouseUpHandler);
  
  $(document).keydown(keyDownHandler);
  
  resetBtn.click(resetClickHandler);
  repaintBtn.click(repaintClickHandler);
  zoomOutBtn.click(zoomOutClickHandler);
  
  iterationsInput.keypress(iterationsKeyPressHandler);
});