//-----------------------------------------------------------------------------------------------------
// 
// Animated Penrose triangle
// 
//-----------------------------------------------------------------------------------------------------
var ctx;  // graphics context

var f;    // current frame
var tf;   // total frames for the animation loop (the higher the value, the slower the animation)
var b;    // side of a cube
var h;    // height of an equilateral triangle with base 'b'
var hb;   // half the side of a cube

var offset;   // offset coordinates to fit drawing in the canvas
var base;     // base of the triangle
var height;   // height of the triangle
var v;        // coordinates for the squares
var sps;      // squares per side (3 * sps = total number of squares)
var mid;      // number of the cube on the bottom we will draw first
var finc;     // distance increment for a frame
var vinc1;    // vector increment along the right side
var vinc2;    // vector increment along the left side

var cubeStrokeColor;  // line color
var cubeFace1Color;   // fill colors for 3 visible faces of a cube 
var cubeFace2Color;
var cubeFace3Color;

//  drawing function
function draw() {
  ctx.clearRect(0, 0, 500, 500);
  
  var k = 0;
  var vt = [];
  var i0 = finc * f;
  var i10 = vinc1[0] * f;
  var i11 = vinc1[1] * f;
  var i20 = vinc2[0] * f;
  var i21 = vinc2[1] * f;
  for (var i = mid; i < sps; ++i, ++k) vt.push([ v[k][0] + i0, v[k][1] ]);        // bottom-right
  for (var i = 0; i < sps; ++i, ++k) vt.push([ v[k][0] + i10, v[k][1] + i11 ]);   // right side
  for (var i = 0; i < sps; ++i, ++k) vt.push([ v[k][0] + i20, v[k][1] + i21 ]);   // left side
  for (var i = 0; i < mid; ++i, ++k) vt.push([ v[k][0] + i0, v[k][1] ]);          // bottom-left
  
  drawCube2(vt[0][0], vt[0][1]);
  for (var i = 1; i < vt.length; ++i) drawCube(vt[i][0], vt[i][1]);
  drawCube1(vt[0][0], vt[0][1]);
  
  if (++f == tf) f = 0;
  requestAnimationFrame(draw);
}

// draw faces 1 and 2
function drawCube1(x, y) {
  ctx.beginPath();                    // face1
  ctx.moveTo(x, y);
  ctx.lineTo(x - b, y);
  ctx.lineTo(x - hb, y - h);
  ctx.lineTo(x + hb, y - h);
  ctx.closePath();
  ctx.fillStyle = cubeFace1Color;
  ctx.strokeStyle = cubeStrokeColor;
  ctx.stroke();
  ctx.fill();
  
  ctx.beginPath();                    // face 2
  ctx.moveTo(x, y);
  ctx.lineTo(x + hb, y + h);
  ctx.lineTo(x - hb, y + h);
  ctx.lineTo(x - b, y);
  ctx.closePath();
  ctx.fillStyle = cubeFace2Color;
  ctx.strokeStyle = cubeStrokeColor;
  ctx.stroke();
  ctx.fill();
}

// draw face 3
function drawCube2(x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + hb, y - h);
  ctx.lineTo(x + b, y);
  ctx.lineTo(x + hb, y + h);
  ctx.closePath();
  ctx.fillStyle = cubeFace3Color;
  ctx.strokeStyle = cubeStrokeColor;
  ctx.stroke();
  ctx.fill();
}

// draw the whole cube, centered at (x, y)
function drawCube(x, y) {
  drawCube2(x, y);
  drawCube1(x, y);
}

// init everything
function initVars() {
  ctx = $('#penrose-canvas')[0].getContext('2d');
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  
  f = 0;
  tf = 100;
  b = 30.0;
  h = b * Math.sqrt(3.0) / 2;
  hb = b / 2.0;
  
  offset = [ 50.5, 0.5 ];
  base = 300;
  height = base * Math.sqrt(3.0) / 2;
  v = [];
  
  var va = [ offset[0], base + offset[1] ];                         // vertices of the triangle:     vc
  var vb = [ base + offset[0], base + offset[1] ];                  //                               /\
  var vc = [ base / 2.0 + offset[0], base - height + offset[1] ];   //                           va /__\ vb
  
  sps = 6;
  mid = ((sps - 1) / 2) | 0;
  
  var inc = base / sps;
  var minc = sps * tf;
  finc = base / minc;
  vinc1 = [ (vc[0] - vb[0]) / minc, (vc[1] - vb[1]) / minc ];
  vinc2 = [ (va[0] - vc[0]) / minc, (va[1] - vc[1]) / minc ];
  
  for (var i = mid; i < sps; ++i) v.push([ va[0] + inc * i, va[1] ]);                   // bottom-right
  var vdir = [ (vc[0] - vb[0]) / sps, (vc[1] - vb[1]) / sps ];
  for (var i = 0; i < sps; ++i) v.push([ vb[0] + vdir[0] * i, vb[1] + vdir[1] * i ]);   // right side
  vdir = [ (va[0] - vc[0]) / sps, (va[1] - vc[1]) / sps ];
  for (var i = 0; i < sps; ++i) v.push([ vc[0] + vdir[0] * i, vc[1] + vdir[1] * i ]);   // left side
  for (var i = 0; i < mid; ++i) v.push([ va[0] + inc * i, va[1] ]);                     // bottom-left
  
  cubeStrokeColor = "#0041a3";
  cubeFace1Color = "#c0d8fc";
  cubeFace2Color = "#87b7ff";
  cubeFace3Color = "#4f9bf7";
}

// init vars and start animation
//$(document).ready(function(){
//  initVars();
//  requestAnimationFrame(draw);
//});