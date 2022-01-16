'use strict';

(function() {
  const chunkStorage = {
    get:  () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['chunks'], function(result) {
          console.log({result});
          if(!result.data) {
            resolve(["Work", "School", "Family"])
          } else {
             resolve(result);
          }
        });
      });
    },
    set: (chunkToSave) => {
      chrome.storage.sync.get(['chunks'], function(chunks) {
        if (Object.keys(chunks).length > 0) {
            // The data array already exists, add to it the new server and nickname
            chunks.data.push(chunkToSave);
        } else {
            // The data array doesn't exist yet, create it
            chunks.data = [chunkToSave];
        }
    
        // Now save the updated chunks using set
        chrome.storage.sync.set(chunks, function() {
            console.log('Data successfully saved to the storage!');
        });
    });
    }
  };

  const chunkSelection = document.getElementById('chunkSelection');
  const submit = document.getElementById('submit');
  const clearForm = document.getElementById('clearForm');
  const taskTab = document.getElementById("associatedSite");
  let currentTab = '';



  async function setupChunks() {
    const savedChunks = await chunkStorage.get();
    console.log({savedChunks});
    savedChunks.forEach(chunkOption => chunkSelection.appendChild( new Option('',chunkOption)))

    currentTab = await getCurrentTab();
    console.log(currentTab);
    taskTab.value = currentTab.url;

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
    console.log({chunkToAdd});
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

  async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  document.addEventListener('DOMContentLoaded', setupChunks);

  // Communicate with background file by sending a message
  // chrome.runtime.sendMessage(
  //   {
  //     type: 'GREETINGS',
  //     payload: {
  //       message: 'Hello, my name is Pop. I am from Popup.',
  //     },
  //   },
  //   response => {
  //     console.log(response.message);
  //   }
  // );
})();
