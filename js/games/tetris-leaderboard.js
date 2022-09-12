'use strict';


class TetrisLeaderboard {
  
  
  constructor({
        url = '/games/tetris-leaderboard',
        leaderboardOverlayId = 'leaderboard-overlay',
        leaderboardId = 'leaderboard',
        firstBtnId = 'first-btn',
        backBtnId = 'back-btn',
        forwardBtnId = 'forward-btn',
        lastBtnId = 'last-btn',
        reloadBtnId = 'reload-btn',
        pageTxtId = 'page-txt',
        totalTxtId = 'total-txt', 
        
        pageSize = 10
      } = {}) {
    this.url = url;
    
    // get elements
    this.leaderboardOverlay = document.getElementById(leaderboardOverlayId);
    this.leaderboard = document.getElementById(leaderboardId);
    this.firstBtn = document.getElementById(firstBtnId);
    this.backBtn = document.getElementById(backBtnId);
    this.forwardBtn = document.getElementById(forwardBtnId);
    this.lastBtn = document.getElementById(lastBtnId);
    this.reloadBtn = document.getElementById(reloadBtnId);
    this.pageTxt = document.getElementById(pageTxtId);
    this.totalTxt = document.getElementById(totalTxtId);
    
    this.busy = false;  // true while fetching new data
    this.page = 1;
    this.pageSize = pageSize;
    this.totalPages = 1;
    this.totalRecords = 0;
    
    this._addEventListeners();
    this.getData(this.page);
  }
  
  
  _addEventListeners() {
    this.firstBtn.addEventListener('click', event => { this.getData(1); });
    this.backBtn.addEventListener('click', event => { this.getData(Math.max(1, this.page - 1)); });
    this.forwardBtn.addEventListener('click', event => { this.getData(Math.min(this.totalPages, this.page + 1)); });
    this.lastBtn.addEventListener('click', event => { this.getData(this.totalPages); });
    this.reloadBtn.addEventListener('click', event => { this.getData(this.page); });
  }
  
  
  async getData(page) {
    if (this.busy) return;
    this.busy = true;
    this.disableInputs();
    
    this.page = page;
    const data = await Js.Get(this.url + '/' + this.page + '/' + this.pageSize);
    this.setLeaderboardData(data);
    
    this.enableInputs();
    this.busy = false;
  }
  
  
  // the only public method
  reload() {
    this.getData(this.page);
  }
  
  
  disableInputs() {
    this.leaderboardOverlay.style.display = 'block';
    this.firstBtn.disabled = true;
    this.backBtn.disabled = true;
    this.forwardBtn.disabled = true;
    this.lastBtn.disabled = true;
    this.reloadBtn.disabled = true;
  }
  
  enableInputs() {
    this.firstBtn.disabled = this.page == 1;
    this.backBtn.disabled = this.page == 1;
    this.forwardBtn.disabled = this.page == this.totalPages;
    this.lastBtn.disabled = this.page == this.totalPages;
    this.reloadBtn.disabled = false;
    this.leaderboardOverlay.style.display = 'none';
  }
  
  
  setLeaderboardData(data) {
    // update vars and text
    this.totalRecords = data.total;
    this.totalPages = (this.totalRecords / this.pageSize) | 0;                   // int division
    if (this.totalPages * this.pageSize < this.totalRecords) ++this.totalPages;  // don't trust Math.ceil()
    
    let offset = (this.page - 1) * this.pageSize + 1;
    this.pageTxt.innerHTML = 'Page ' + this.page + ' of ' + this.totalPages;
    this.totalTxt.innerHTML = 'Displaying ' + offset + ' to ' + Math.min((offset + this.pageSize - 1), this.totalRecords) + ' of ' + this.totalRecords + ' scores';
    
    // update table 
    const insertCell = (row, txt) => { 
        let cell = row.insertCell(-1);
        cell.classList.add('table-cell');
        cell.classList.add('leaderboard-cell');
        cell.appendChild(document.createTextNode(txt));
      };
    const tBody = document.createElement('tbody');
    for (const dataRow of data.rows) {
      const row = tBody.insertRow(-1);
      let dateStr = dataRow.timestamp.substring(0, 10);
      dateStr = dateStr.substring(5, 10) + '-' + dateStr.substring(0, 4);
      row.classList.add('table-row');
      insertCell(row, offset++);          // rank
      insertCell(row, dataRow.id);        // name
      insertCell(row, dataRow.score);     // score
      insertCell(row, dataRow.lines);     // lines
      insertCell(row, dateStr);           // date
    }
    const oldTBody = this.leaderboard.tBodies[0];
    oldTBody.parentNode.replaceChild(tBody, oldTBody);
  }
  
}

