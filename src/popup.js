'use strict';

import './popup.css';

(function() {
  const chunkStorage = {
    get: async (key) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
          if (result[key] === undefined) {
            reject();
          } else {
            resolve(result[key]);
          }
        });
      });
    },
    set: (chunkToSave, cb) => {
      chrome.storage.sync.set(
       chunkToSave,
        () => {
          cb();
        }
      );
    },
  };

  const chunkDropdown = document.getElementById('chunkDropdown');
  const submit = document.getElementById('submit');
  const clearForm = document.getElementById('clearForm');



  async function setupChunks() {
    const savedChunks = await chunkStorage.get();
    console.log({savedChunks});
    for(let i = 0; i >= savedChunks.length; i++) {
      let option = document.createElement('option');
      option.text = option.value = i;
      select.add(option);
    }
    submit.addEventListener('click', addChunk);
    
  }

  function addChunk() {
    const chunkToAdd = {
      name: document.querySelector('input[name="gender"]:checked').value,
      urgency: document.querySelector('input[name="urgency"]:checked').value,
      difficulty: document.querySelector('input[name="difficulty"]:checked').value,
      importance: document.querySelector('input[name="importance"]:checked').value,
      details: document.querySelector('textarea[name="details"]').value,
      chunkCategory: document.querySelector('select.options[select.selectedIndex]').value,
      url: document.querySelector('input[name="importance"]:checked').value
    }
    chunkStorage.set(chunkToAdd);
  }

  function clearChunks(chunk) {
    // Clear Chunks
    chunkStorage.get(chunk => {
      if (typeof count !== 'undefined') {
        chunkStorage.set({}, alert("Chunks Cleared"));
      } else {
        setupChunks();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupChunks);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    response => {
      console.log(response.message);
    }
  );
})();
