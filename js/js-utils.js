'use strict';


class Js {
  
  
  
  //-----------------------------------------------------------------------------------------------------
  // 
  // validation
  // 
  //-----------------------------------------------------------------------------------------------------
  
  static IsNumeric(value) { 
    const val = parseFloat(value);
    return !isNaN(val) && isFinite(val); 
  }
  

  //-----------------------------------------------------------------------------------------------------
  // 
  // ajax
  // 
  //-----------------------------------------------------------------------------------------------------
  
  static async Post(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST',                         // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',                           // no-cors, *cors, same-origin
      cache: 'no-cache',                      // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin',             // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',                     // manual, *follow, error
      referrer: 'no-referrer',                // no-referrer, *client
      body: JSON.stringify(data)              // body data type must match "Content-Type" header
    });
    return await response.json();             // parses JSON response into native JavaScript objects
  }
  
  static async Get(url = '') {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrer: 'no-referrer'
    });
    return await response.json();
  }
  
  
}