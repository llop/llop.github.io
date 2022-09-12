var zRot = [
    [
      [ 0, 0, 0 ], 
      [ 1, 1, 0 ], 
      [ 0, 1, 1 ]
    ], 
    [
      [ 0, 0, 1 ], 
      [ 0, 1, 1 ], 
      [ 0, 1, 0 ]
    ]
  ];
  
var sRot = [
    [
      [ 0, 0, 0 ],
      [ 0, 1, 1 ],
      [ 1, 1, 0 ]
    ],
    [
      [ 0, 1, 0 ],
      [ 0, 1, 1 ],
      [ 0, 0, 1 ]
    ]
  ];
  
var oRot = [
    [
      [ 1, 1 ],
      [ 1, 1 ]
    ]
  ];
  
var lRot = [
    [
      [ 0, 0, 0 ],
      [ 1, 1, 1 ],
      [ 1, 0, 0 ]
    ],
    [
      [ 1, 1, 0 ],
      [ 0, 1, 0 ],
      [ 0, 1, 0 ]
    ],
    [
      [ 0, 0, 1 ],
      [ 1, 1, 1 ],
      [ 0, 0, 0 ]
    ],
    [
      [ 0, 1, 0 ],
      [ 0, 1, 0 ],
      [ 0, 1, 1 ]
    ]
  ];
  
var jRot = [
    [
      [ 0, 0, 0 ],
      [ 1, 1, 1 ],
      [ 0, 0, 1 ]
    ],
    [
      [ 0, 1, 0 ],
      [ 0, 1, 0 ],
      [ 1, 1, 0 ]
    ],
    [
      [ 1, 0, 0 ],
      [ 1, 1, 1 ],
      [ 0, 0, 0 ]
    ],
    [
      [ 0, 1, 1 ],
      [ 0, 1, 0 ],
      [ 0, 1, 0 ]
    ]
  ];
  
var tRot = [
    [
      [ 0, 0, 0 ],
      [ 1, 1, 1 ],
      [ 0, 1, 0 ]
    ],
    [
      [ 0, 1, 0 ],
      [ 1, 1, 0 ],
      [ 0, 1, 0 ]
    ],
    [
      [ 0, 1, 0 ],
      [ 1, 1, 1 ],
      [ 0, 0, 0 ]
    ],
    [
      [ 0, 1, 0 ],
      [ 0, 1, 1 ],
      [ 0, 1, 0 ]
    ]
  ];
  
var iRot = [
    [
      [ 0, 0, 0, 0 ],
      [ 0, 0, 0, 0 ],
      [ 1, 1, 1, 1 ],
      [ 0, 0, 0, 0 ]
    ], 
    [
      [ 0, 0, 1, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 1, 0 ],
      [ 0, 0, 1, 0 ]
    ]
  ];
  
var zIniPos = [ 4, 1 ];
var sIniPos = [ 4, 1 ];
var oIniPos = [ 4, 2 ];
var lIniPos = [ 4, 1 ];
var jIniPos = [ 4, 1 ];
var tIniPos = [ 4, 1 ];
var iIniPos = [ 3, 0 ];

var zCol = [ '#b70101', '#ff6f6f' ];
var sCol = [ '#8620fd', '#a7c9ff' ];
var oCol = [ '#0660ef', '#ccc' ];
var lCol = [ '#b70101', '#ff6f6f' ];
var jCol = [ '#8620fd', '#a7c9ff' ];
var tCol = [ '#0660ef', '#ccc' ];
var iCol = [ '#0660ef', '#ccc' ];

var gameOverCol = [ '#ddd', '#000' ];

var zBox = [ 1, 0, 2, 3 ]; // x y hei wid
var sBox = [ 1, 0, 2, 3 ];
var oBox = [ 0, 0, 2, 2 ];
var lBox = [ 1, 0, 2, 3 ];
var jBox = [ 1, 0, 2, 3 ];
var tBox = [ 1, 0, 2, 3 ];
var iBox = [ 2, 0, 1, 4 ]; 

var boardX = 30;
var boardY = -35;
var boardWidth = 10;
var boardHeight = 22;

var squareSide = 28;

var boardBorder = [ -0.5 + boardX, -0.5 + boardY + 2 * squareSide, -0.5 + boardX + boardWidth * squareSide, -0.5 + boardY + boardHeight * squareSide ];

var scoreX = 330;
var scoreY = 100;

var levelX = 330;
var levelY = 130;

var linesX = 330;
var linesY = 160;

var nextX = 330;
var nextY = 260;

var nextOffsetX = 330;
var nextOffsetY = 280;

var board = [];
var pieces = [
    { 
      id: 0, 
      rot: zRot,
      iniPos: zIniPos,
      col: zCol,
      box: zBox
    },
    { 
      id: 1,
      rot: sRot,
      iniPos: sIniPos,
      col: sCol,
      box: sBox
    },
    { 
      id: 2,
      rot: oRot,
      iniPos: oIniPos,
      col: oCol,
      box: oBox
    },
    { 
      id: 3,
      rot: lRot,
      iniPos: lIniPos,
      col: lCol,
      box: lBox
    },
    { 
      id: 4,
      rot: jRot,
      iniPos: jIniPos,
      col: jCol,
      box: jBox
    },
    { 
      id: 5,
      rot: tRot,
      iniPos: tIniPos,
      col: tCol,
      box: tBox
    },
    { 
      id: 6,
      rot: iRot,
      iniPos: iIniPos,
      col: iCol,
      box: iBox
    }
  ];

var canvas;
var context;

var score;
var linesCleared;

var piece;
var piecePos;
var pieceRot;
var pieceLock;
var next;
var startLevel;
var level;


var frameDuration = 1000.0 / 60.0;
var loopTimer;

var playing;
var gameOver;
var loopLock;

var dropPoints;
var columnsCleared;
var linesToClear;

var gameOverLine;

var rotSound;
var moveSound;
var setSound;
var gameOverSound;
var lineSound;
var tetrisSound;
var levelUpSound;

var startLevelSpinner;
var startStopButton;

var gameOverTimeout;
var linesClearTimeout;
var nextPieceTimeout;

var gameOverDialog;
var nameInput;
var scoreLabel;
var linesLabel;
var enterScoreBtn;
var errorMsg;

var hiscoreDialog;
var acceptHiscoreBtn;
var hiscoreLabel;
var rankLabel;
var currentId;
var hiscoreNameLabel;

var leaderboardDatagrid;


function initVars() {
  rotSound = new Audio('/sound/tetris/rot.mp3');
  moveSound = new Audio('/sound/tetris/move.mp3');
  setSound = new Audio('/sound/tetris/set.mp3');
  gameOverSound = new Audio('/sound/tetris/gameover.mp3');
  lineSound = new Audio('/sound/tetris/line.mp3');
  tetrisSound = new Audio('/sound/tetris/tetris.mp3');
  levelUpSound = new Audio('/sound/tetris/levelup.mp3');

  for (let i = 0; i < boardHeight; ++i) {
    const row = [];
    for (let j = 0; j < boardWidth; ++j) row.push(7);
    board.push(row);
  }
  
  playing = false;
  gameOver = false;
  loopLock = true;
  pieceLock = true;
  
  score = 0;
  linesCleared = 0;
  level = 0;
  
  canvas = $('#tetris-canvas');
  context = canvas[0].getContext('2d');
  context.lineJoin = 'round';
  context.lineWidth = 1;
  context.font = '17px georgia';
  
  $(document).keydown(keyDownHandler);
}

function keyDownHandler(event) {
  var code = event.keyCode || event.which;
  // up (up arrow):    38 // unnecessary but use as additional rotate clockwise
  // down (down arrow):  40
  // left (left arrow):  37
  // right (right arrow): 39
  // rotate clockwise ('s'): 83
  // rotate anticlockwise ('a'): 65 
  if (playing) {
    if (code == 87) rotate(1);
    else if (code == 83) moveDown(true);
    else if (code == 65) moveLeft();
    else if (code == 68) moveRight();
    else if (code == 77) rotate(1);
    else if (code == 78) rotate(0);
  }
}

function drawBoard() {
  for (let i = 2; i < boardHeight; ++i) {
    for (let j = 0; j < boardWidth; ++j) {
      if (board[i][j] != -1) {
        var x = boardX + j * squareSide;
        var y = boardY + i * squareSide;
        var col = board[i][j] == 7 ? gameOverCol : pieces[board[i][j]].col;
        drawSquare(x, y, col[0], col[1]);
      }
    }
  }
}

function drawSquare(x, y, color, border) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + squareSide - 1, y);
  context.lineTo(x + squareSide - 1, y + squareSide - 1);
  context.lineTo(x, y + squareSide - 1);
  context.closePath();
  context.fillStyle = color;
  context.strokeStyle = border;
  context.stroke();
  context.fill();
}

function drawPiece() {
  if (pieceLock) return;
  var p = piece.rot[pieceRot];
  for (let i = 0; i < p.length; ++i) {
    for (let j = 0; j < p[i].length; ++j) {
      if (p[i][j] != 0 && piecePos[1] + i > 1) {
        var x = boardX + (piecePos[0] + j) * squareSide;
        var y = boardY + (piecePos[1] + i) * squareSide;
        drawSquare(x, y, piece.col[0], piece.col[1]);
      }
    }
  }
}

function drawHUD() {
  var scoreStr = 'Score: ' + score;
  var levelStr = 'Level: ' + level;
  var linesStr = 'Lines: ' + linesCleared;
  
  context.fillStyle = '#fff';
  context.fillText(scoreStr, scoreX, scoreY);
  context.fillText(levelStr, levelX, levelY);
  context.fillText(linesStr, linesX, linesY);
  context.fillText('Next', nextX, nextY);
  
}

function drawNext() {
  if (!playing || gameOver) return;
  
  var p = next.rot[0];
  var b = next.box;
  for (let i = b[0]; i < b[0] + b[2]; ++i) {
    for (let j = b[1]; j < b[1] + b[3]; ++j) {
      if (p[i][j] != 0) {
        var x = nextOffsetX + (j - b[1]) * squareSide;
        var y = nextOffsetY + (i - b[0]) * squareSide;
        drawSquare(x, y, next.col[0], next.col[1]);
      }
    }
  }
}


function drawBackground() {
  context.clearRect(0, 0, canvas.width(), canvas.height());
  context.beginPath();
  context.moveTo(boardBorder[0], boardBorder[1]);
  context.lineTo(boardBorder[2], boardBorder[1]);
  context.lineTo(boardBorder[2], boardBorder[3]);
  context.lineTo(boardBorder[0], boardBorder[3]);
  context.closePath();
  context.fillStyle = '#fff';
  context.strokeStyle = '#000';
  context.stroke();
  context.fill();
}

function canMove(offsetX, offsetY) {
  var p = piece.rot[pieceRot];
  for (let i = 0; i < p.length; ++i) {
    for (let j = 0; j < p[i].length; ++j) {
      if (p[i][j] != 0) {
        var x = offsetX + piecePos[0] + j;
        var y = offsetY + piecePos[1] + i;
        if (x < 0 || x >= boardWidth || y >= boardHeight || board[y][x] != -1) return false;
      }
    }
  }
  return true;
}

function canRot(rotation) {
  var p = piece.rot[rotation];
  for (let i = 0; i < p.length; ++i) {
    for (let j = 0; j < p[i].length; ++j) {
      if (p[i][j] != 0) {
        var x = piecePos[0] + j;
        var y = piecePos[1] + i;
        if (x < 0 || x >= boardWidth || y >= boardHeight || board[y][x] != -1) return false;
      }
    }
  }
  return true;
}

function setPiece() {
  var p = piece.rot[pieceRot];
  for (let i = 0; i < p.length; ++i) {
    for (let j = 0; j < p[i].length; ++j) {
      if (p[i][j] != 0) {
        var x = piecePos[0] + j;
        var y = piecePos[1] + i;
        board[y][x] = piece.id;
      }
    }
  }
}

function getFramesPerGridcell(lvl) {
  if (lvl == 0) return 48;
  else if (lvl == 1) return 43;
  else if (lvl == 2) return 38;
  else if (lvl == 3) return 33;
  else if (lvl == 4) return 28;
  else if (lvl == 5) return 23;
  else if (lvl == 6) return 18;
  else if (lvl == 7) return 13;
  else if (lvl == 8) return 8;
  else if (lvl == 9) return 6;
  else if (lvl <= 12) return 5;
  else if (lvl <= 15) return 4;
  else if (lvl <= 18) return 3;
  else if (lvl <= 28) return 2;
  return 1;
}

function getLinesScore(lines, lvl) {
  if (lines == 1) return 40 * (lvl + 1);
  else if (lines == 2) return 100 * (lvl + 1);
  else if (lines == 3) return 300 * (lvl + 1);
  return 1200 * (lvl + 1);    // tetris!
}


function getLockHeight() {
  var h = 0;
  var p = piece.rot[pieceRot];
  for (let i = 0; i < p.length; ++i) {
    for (let j = 0; j < p[i].length; ++j) {
      if (p[i][j] != 0) {
        var y = piecePos[1] + i;
        h = Math.max(h, y);
      }
    }
  }
  return boardHeight - 1 - h;
}

// ARE is 10~18 frames depending on the height at which the piece locked; 
// pieces that lock in the bottom two rows are followed by 10 frames of entry delay, 
// and each group of 4 rows above that has an entry delay 2 frames longer than the last
function getARE() {
  var h = getLockHeight();
  var delay = 10 + (((h + 2) / 4) | 0) * 2;
  return delay;
}

// 0, 1 - 10
// 2

// line clear delay is an additional 17~20 frames depending on the frame that the piece locks; 
// the animation has 5 steps that advance when the global frame counter modulo 4 equals 0. 
// As a consequence, the first step of the line clear animation is not always a set number of frames
function getLinesCleared() {
  var arr = [];
  for (let i = 0; i < boardHeight; ++i) {
    let b = true;
    for (let j = 0; b && j < boardWidth; ++j) 
      if (board[i][j] == -1) b = false;
    if (b) arr.push(i);
  }
  return arr;
}


function doGameOver() {
  if (gameOverLine < boardHeight) {
    for (let i = 0; i < boardWidth; ++i) board[gameOverLine][i] = 7;
    ++gameOverLine;
    gameOverTimeout = setTimeout(doGameOver, frameDuration * 4);
    repaint();
  } else {
    gameOver = true;
    repaint();
    
    scoreLabel.text('Score: ' + score);
    linesLabel.text('Lines: ' + linesCleared);
    gameOverDialog.dialog('open');
    nameInput.focus();
    
    playing = false;
    startStopButton.text('Start game');
  }
}

function nextPiece() {
  // get next piece
  piece = next;
  piecePos = piece.iniPos.slice(0);
  pieceRot = 0;
  next = pieces[(Math.random() * pieces.length) | 0];
  
  dropPoints = 0;
  
  if (canMove(0, 0)) {
    pieceLock = false;
    loopLock = false;
    loopTimer = setTimeout(loop, frameDuration * getFramesPerGridcell(level));
  } else {
    // if unable to appear, game over
    setPiece();
    
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    
    gameOverLine = 2;
    gameOverTimeout = setTimeout(doGameOver, frameDuration * 4);
  }
  repaint();
}

// when the player clears (startLevel × 10 + 10) or max(100, (startLevel × 10 - 50)) lines, 
// whatever comes first, the level advances by 1. After this, the level advances by 1 for every 10 lines.
function getLevel() {
  var a = linesCleared - Math.min(startLevel * 10 + 10, Math.max(100, startLevel * 10 - 50));
  return startLevel + (a >= 0 ? ((a / 10) | 0) + 1 : 0);
}

function doLinesClear() {
  if (columnsCleared < 5) {
    // remove squares for animation
    var mid = boardWidth / 2;
    for (let i = 0; i < linesToClear.length; ++i) {
      board[linesToClear[i]][mid + columnsCleared] = -1;
      board[linesToClear[i]][mid - 1 - columnsCleared] = -1;
    }
    
    ++columnsCleared;
    linesClearTimeout = setTimeout(doLinesClear, frameDuration * 4);
    repaint();
  } else {
    // add score and lines
    score += dropPoints + getLinesScore(linesToClear.length, level);
    linesCleared += linesToClear.length;
    var levelTmp = getLevel();


  console.log(levelTmp);
    
    if (level != levelTmp) {
      level = levelTmp;
      levelUpSound.currentTime = 0;
      levelUpSound.play();
    }
    
    // clean board up and repaint
    for (let i = linesToClear.length - 1; i >= 0; --i)
      board.splice(linesToClear[i], 1);
    while (board.length < boardHeight) {
      let row = [];
      for (let i = 0; i < boardWidth; ++i) row.push(-1);
      board.unshift(row);
    }
    nextPieceTimeout = setTimeout(nextPiece, frameDuration * getARE());
    repaint();
  }
}

function moveDown(press) {
  if (pieceLock) return;
  
  if (canMove(0, 1)) {
    if (press) ++dropPoints;
    ++piecePos[1];
    repaint();
  } else {
    loopLock = true;
    clearTimeout(loopTimer);
    
    // set piece on board
    pieceLock = true;
    setPiece();
    
    // check for line clears
    linesToClear = getLinesCleared();
    if (linesToClear.length > 0) {
    
      var sound = linesToClear.length == 4 ? tetrisSound : lineSound;
      sound.currentTime = 0;
      sound.play();
      
      // clear those lines
      columnsCleared = 0;
      linesClearTimeout = setTimeout(doLinesClear, frameDuration * 4);
    } else {
    
      setSound.currentTime = 0;
      setSound.play();
      
      score += dropPoints;
      
      // entry delay for next piece
      nextPieceTimeout = setTimeout(nextPiece, frameDuration * getARE());
      repaint();
    }
  }
}

function moveLeft() {
  if (pieceLock) return;
  if (canMove(-1, 0)) {
    --piecePos[0];
    
    moveSound.currentTime = 0;
    moveSound.play();
    
    repaint();
  }
}

function moveRight() {
  if (pieceLock) return;
  if (canMove(1, 0)) {
    ++piecePos[0];
    
    moveSound.currentTime = 0;
    moveSound.play();
    
    repaint();
  }
}

function rotate(clockwise) {
  if (pieceLock) return;
  var newRot = (clockwise == 1 ? pieceRot + 1 : pieceRot + piece.rot.length - 1) % piece.rot.length;
  if (canRot(newRot)) {
    pieceRot = newRot;
    
    rotSound.currentTime = 0;
    rotSound.play();
    
    repaint();
  }
}

function repaint() {
  drawBackground();
  drawBoard();
  drawPiece();
  drawHUD();
  drawNext();
}

function startGame() {
  playing = true;
  gameOver = false;
  
  score = 0;
  linesCleared = 0;
  dropPoints = 0;
  
  for (let i = 0; i < boardHeight; ++i) for (let j = 0; j < boardWidth; ++j) board[i][j] = -1;
  
  piece = pieces[(Math.random() * pieces.length) | 0];
  next = pieces[(Math.random() * pieces.length) | 0];
  
  
  startLevel = Number(startLevelSpinner.numberspinner('getValue'));
  level = startLevel;
  
  piecePos = piece.iniPos.slice(0);
  pieceRot = 0;
  pieceLock = false;
  
  loopLock = false;
  loopTimer = setTimeout(loop, frameDuration * (18 + getFramesPerGridcell(level)));
  repaint();
}

function loop() {
  if (loopLock) return;
  moveDown(false);
  if (!loopLock) loopTimer = setTimeout(loop, frameDuration * getFramesPerGridcell(level));
}

function startStopClickHandler() {
  if (playing) {
    playing = false;
    loopLock = true;
    pieceLock = true;
    
    clearTimeout(loopTimer);
    clearTimeout(gameOverTimeout);
    clearTimeout(linesClearTimeout);
    clearTimeout(nextPieceTimeout);
    
    for (let i = 0; i < boardHeight; ++i) for (let j = 0; j < boardWidth; ++j) board[i][j] = 7;
    repaint();
    
    startStopButton.text('Start game');
  } else {
    startGame();
    startStopButton.text('Quit game');
  }
}

function enterScoreBtnClickHandler() {
  //if (playing || !gameOver) return;
  sendScore();
}

function nameInputKeyPressHandler() {
  //if (playing || !gameOver) return;
  nameInput.removeClass('error-input');
  errorMsg.hide();
  if ((event.keyCode || event.which) == 13) {
    sendScore();
  }
}

function sendScore() {
  const id = Number(nameInput.val());
  if (nameInput.val() !== '' && Number.isInteger(id) && id >= -9999999999 && id <= 9999999999) {
    currentId = id;
    $.post('tetris-score', {
        id: id,
        score: score,
        lines: linesCleared
      }, (data) => {
        const rank = data.rank;
        if (rank != -1) {
          hiscoreNameLabel.text(currentId);
          hiscoreLabel.text('Score: ' + score);
          rankLabel.text('Rank ' + rank);
          hiscoreDialog.dialog('open');
          acceptHiscoreBtn.focus();
          leaderboardDatagrid.datagrid('reload');
        }
      }).always(() => {
        gameOverDialog.dialog('close');
      });
  } else {
    nameInput.addClass('error-input');
    nameInput.focus();
    errorMsg.show();
  }
}

function acceptHiscoreBtnClickHandler() {
  hiscoreDialog.dialog('close');
}

function initUI() {
  startLevelSpinner = $('#spinner');
  startLevelSpinner.numberspinner({ min: 0, max: 19, editable: false });
  startLevelSpinner.bind("keydown", function (event) { event.preventDefault(); });
  startLevelSpinner.focus(function () { $(this).blur(); });
  
  startStopButton = $('#start-stop-btn');
  startStopButton.click(startStopClickHandler);
  
  gameOverDialog = $('#gameover-dialog');
  gameOverDialog.dialog({
    closed: true,
    modal: true,
    width: 380
  });
  scoreLabel = $('#score-label');
  linesLabel = $('#lines-label');

  nameInput = $('#name-input');
  nameInput.keypress(nameInputKeyPressHandler);

  enterScoreBtn = $('#enter-score-btn');
  enterScoreBtn.click(enterScoreBtnClickHandler);

  errorMsg = $('#error-msg');
  
  hiscoreDialog = $('#hiscore-dialog');
  hiscoreDialog.dialog({
    closed: true,
    modal: true,
    width: 380
  });

  acceptHiscoreBtn = $('#accept-hiscore-btn');
  acceptHiscoreBtn.click(acceptHiscoreBtnClickHandler);

  hiscoreLabel = $('#hiscore-label');
  rankLabel = $('#rank-label');
  hiscoreNameLabel = $('#hiscore-name-label');

  leaderboardDatagrid = $('#leaderboard');
  leaderboardDatagrid.datagrid({
      fitColumns: true, 
      singleSelect: true, 
      pagination: true, 
      rownumbers: true, 
      pageSize: 10, 
      url: 'tetris-leaderboard',
      columns:[[
        { 
          field: 'id', 
          title: '#ID',
          width: 100, 
          align: 'center', 
          resizable: false
        },
        {
          field: 'score',
          title: 'Score', 
          width: 100, 
          align: 'center', 
          resizable:false
        },
        { 
          field: 'lines', 
          title: 'Lines', 
          width: 100, 
          align: 'center', 
          resizable: false
        }
      ]]
    });
}


$(document).ready(function(){
  initVars();
  repaint();
  initUI();
});



