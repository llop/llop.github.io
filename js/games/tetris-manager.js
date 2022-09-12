'use strict';



class TetrisManager {
  
  
  constructor(tetris, tetrisLeaderboard, {
        levelInputId = 'level-input',                 // game control input ids
        playPauseBtnId = 'start-stop-btn', 
        quitBtnId = 'quit-btn',
        
        gameOverDialogId = 'game-over-dialog',        // game over dialog element ids
        nameInputId = 'name-input',
        idErrorMsgId = 'id-error-msg',
        scoreLabelId = 'score-label',
        linesLabelId = 'lines-label',
        enterScoreBtnId = 'enter-score-btn',
        gameOverCancelBtnId = 'game-over-cancel-btn',
        
        hiscoreDialogId = 'hiscore-dialog',           // hi-score dialog element ids
        hiscoreNameLabelId = 'hiscore-name-label',
        rankLabelId = 'rank-label',
        hiscoreLabelId = 'hiscore-label',
        hiscoreLinesLabelId = 'hiscore-lines-label',
        hiscoreBtnId = 'hiscore-btn'
      } = {}) {
        
    // tetris game and leaderboard
    this.tetris = tetris;
    this.tetrisLeaderboard = tetrisLeaderboard;
    
    // game result 
    this.lastResult = {
      id: 0,
      score: 0,
      line: 0
    };
    
    // game control inputs
    this.levelInput = document.getElementById(levelInputId);
    this.playPauseBtn = document.getElementById(playPauseBtnId);
    this.quitBtn = document.getElementById(quitBtnId);
    
    // tetris event handlers
    this.tetris.on(ClassicTetris.GAME_START, event => {
      this._updatePlayPauseButton(true);
    });
    this.tetris.on(ClassicTetris.GAME_OVER, event => {
      this._updatePlayPauseButton(false);
      this._gameOverHandler(event);
    });
    this.tetris.on(ClassicTetris.GAME_PAUSE, event => {
      this._updatePlayPauseButton(false);
    });
    this.tetris.on(ClassicTetris.GAME_RESUME, event => {
      this._updatePlayPauseButton(true);
    });
    
    // button click handlers
    this.playPauseBtn.addEventListener('click', event => {
      this.tetris.setStartLevel(this.levelInput.value);
      this.tetris.togglePlayPause();
    });
    
    this.quitBtn.addEventListener('click', event => {
      this.tetris.quit();
    });
    
    
    // game over dialog elements
    this.gameOverDialog = document.getElementById(gameOverDialogId);
    this.nameInput = document.getElementById(nameInputId);
    this.idErrorMsg = document.getElementById(idErrorMsgId);
    this.scoreLabel = document.getElementById(scoreLabelId);
    this.linesLabel = document.getElementById(linesLabelId);
    this.enterScoreBtn = document.getElementById(enterScoreBtnId);
    this.gameOverCancelBtn = document.getElementById(gameOverCancelBtnId);
    
    this.nameInput.addEventListener('keydown', this._nameInputKeyDownHandler);
    this.enterScoreBtn.addEventListener('click', this._enterScoreBtnClickHandler);
    this.gameOverCancelBtn.addEventListener('click', this._gameOverCancelBtnClickHandler);
    
    // hiscore dialog elements
    this.hiscoreDialog = document.getElementById(hiscoreDialogId);
    this.hiscoreNameLabel = document.getElementById(hiscoreNameLabelId);
    this.rankLabel = document.getElementById(rankLabelId);
    this.hiscoreLabel = document.getElementById(hiscoreLabelId);
    this.hiscoreLinesLabel = document.getElementById(hiscoreLinesLabelId);
    this.hiscoreBtn = document.getElementById(hiscoreBtnId);
    
    this.hiscoreBtn.addEventListener('click', this._hiscoreBtnClickHandler);
  }
  
  _updatePlayPauseButton(play) {
    if (play) {
      this.playPauseBtn.classList.add('pause-btn');
      this.playPauseBtn.title='Pause';
    } else {
      this.playPauseBtn.classList.remove('pause-btn');
      this.playPauseBtn.title='Play';
    }
  }
  
  
  // tetris events
  _gameOverHandler = event => {
    const { score, lines } = event;
    if (score === 0) return; 
      
    this.lastResult.score = score;
    this.lastResult.lines = lines;
    
    this.scoreLabel.innerHTML = 'Score: ' + score;    // set score and line labels
    this.linesLabel.innerHTML = 'Lines: ' + lines;
    this._openGameOverDialog();                       // show dialog
    this.nameInput.focus();
  }
  
  //---------------------------------------------------------------------------
  // open / hide dialogs
  //---------------------------------------------------------------------------
  
  _openGameOverDialog() {
    this.gameOverDialog.style.display = 'block';      
    document.addEventListener('keydown', this._gameOverDialogKeyListener);
    window.addEventListener('click', this._gameOverDialogWindowClickListener);
  }
  
  _openHiscoreDialog() {
    this.hiscoreDialog.style.display = 'block';
    document.addEventListener('keydown', this._hiscoreDialogKeyListener);
    window.addEventListener('click', this._hiscoreDialogWindowClickListener);
  }
  
  _closeGameOverDialog() {
    document.removeEventListener('keydown', this._gameOverDialogKeyListener);
    window.removeEventListener('click', this._gameOverDialogWindowClickListener);
    this.gameOverDialog.style.display = 'none';
  }
  
  _closeHiscoreDialog() {
    document.removeEventListener('keydown', this._hiscoreDialogKeyListener);
    window.removeEventListener('click', this._hiscoreDialogWindowClickListener);
    this.hiscoreDialog.style.display = 'none';
  }
  
  
  //---------------------------------------------------------------------------
  // dialog event listeners
  //---------------------------------------------------------------------------
  
  _gameOverDialogKeyListener = event => {
    if ((event.keyCode || event.which) === 27) {    // ESC key pressed
      this._closeGameOverDialog();
    }
  }
  
  _hiscoreDialogKeyListener = event => {
    if ((event.keyCode || event.which) === 27) {    // ESC key pressed
      this._closeHiscoreDialog();
    }
  }
  
  _gameOverDialogWindowClickListener = event => {
    if (event.target == this.gameOverDialog) {
      this._closeGameOverDialog();
    }
  }
  
  _hiscoreDialogWindowClickListener = event => {
    if (event.target == this.hiscoreDialog) {
      this._closeHiscoreDialog();
    }
  }
  
  
  
  // event handlers for game over dialog elements
  _nameInputKeyDownHandler = event => {
    this.nameInput.classList.remove('error-input');
    this.idErrorMsg.style.display = 'none';
    
    if ((event.keyCode || event.which) == 13) {   // enter pressed
      // this._sendScore();
      this._closeGameOverDialog();
    }
  }
  
  _enterScoreBtnClickHandler = event => {
    // try to upload score
    // this._sendScore();
    this._closeGameOverDialog();
  }
  
  _gameOverCancelBtnClickHandler = event => {
    // just hide the dialog
    this._closeGameOverDialog();
  }
  
  
  // validate name input and upload score
  async _sendScore() {
    let id = this.nameInput.value;
    if (id !== '' && Js.IsNumeric(id) &&            // value must not be an empty string
        Number.isInteger( id = Number(id) ) &&      // must be an integer
        id >= -9999999999 && id <= 9999999999) {    // between -9999999999 and 9999999999
        
      // hide the dialog and send POST request
      this._closeGameOverDialog();
      const data = await Js.Post('/games/tetris-score', {
        id: (this.lastResult.id = id),
        score: this.lastResult.score,
        lines: this.lastResult.lines
      });
      
      const rank = data.rank;
      if (rank !== -1) {
        this.rankLabel.innerHTML = 'Rank ' + rank;    // fill in dialog fields
        this.hiscoreNameLabel.innerHTML = this.lastResult.id;
        this.hiscoreLabel.innerHTML = 'Score: ' + this.lastResult.score;
        this.hiscoreLinesLabel.innerHTML = 'Lines: ' + this.lastResult.lines;
        
        this._openHiscoreDialog();                    // show dialog
        this.hiscoreBtn.focus();
        this.tetrisLeaderboard.reload();              // reload leaderboard
      }
      
    } else {
      // bad input: give visual indications of what went wrong
      this.nameInput.classList.add('error-input');
      this.nameInput.focus();
      this.idErrorMsg.style.display = 'inline-block';
    }
  }
  
  
  // hide the hiscore dialog
  _hiscoreBtnClickHandler = event => {
    this._closeHiscoreDialog();
  }
  
}





