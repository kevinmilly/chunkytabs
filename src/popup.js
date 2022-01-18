'use strict';

(function() {
  const chunkStorage = {
    getChunks:  () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['chunks'], function(results) {
          if(!results.data) {
            //resolve([])
            resolve(
              [
                {
                  name: 'Finish PR', 
                  urgency: 'Soon', 
                  difficulty: 'Medium', 
                  importance: 'Low', 
                  details: '', 
                  chunkCategory: 'Work', 
                  url: 'www.github.com'
                },
                {
                  name: 'Call Mom about her gift', 
                  urgency: 'Now', 
                  difficulty: 'Medium', 
                  importance: 'High', 
                  details: 'She called the other day', 
                  chunkCategory: 'Family', 
                  url: 'www.amazon.com'
                }
              ]
            )
          } else {
            resolve(results);
          }
        });
      });
    },
    getChunkNames:  () => {
        return new Promise((resolve, reject) => {
          chrome.storage.sync.get(['chunks'], function(result) {
            if(!result.data) {
              resolve(["Work", "School", "Family"])
            } else {
              resolve(result.map(r => r.name));
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
  const taskTab = document.getElementById("associatedSite");
  let currentTab = '';



  async function setupChunks() {
    const savedChunkNames = await chunkStorage.getChunkNames();
    const savedChunks = await chunkStorage.getChunks();
    console.log({savedChunks});
    console.log({savedChunkNames});
    setUpViewTable(savedChunks);
    
    savedChunkNames.forEach(chunkOption => chunkSelection.appendChild( new Option('',chunkOption)))

    currentTab = await getCurrentTab();
    console.log(currentTab);
    taskTab.value = currentTab.url;

    submit.addEventListener('click', addChunk);
    
  }

  function setUpViewTable(savedChunksForTable) {
    console.log({savedChunksForTable});
    const table = document.getElementById('viewTable');
    let td;
    let tr = document.createElement('tr');
    savedChunksForTable.forEach((chunk, rowIndex) => {
      console.log({chunk});
      Object.keys(chunk).forEach((property, i) => {
        td = document.createElement('td');
        td.appendChild(document.createTextNode(chunk[property]));
        tr.appendChild(td);
      });
        td = document.createElement('td').appendChild(document.createTextNode("Delete"));
        td.addEventListener("click", deleteRow(rowIndex));
        tr.appendChild(td);
        table.appendChild(tr);
        tr = document.createElement('tr');
    });

    document.getElementById("taskNameColumn").addEventListener("click", sortTable(0));
    document.getElementById("urgencyColumn").addEventListener("click", sortTable(1));
    document.getElementById("difficultyColumn").addEventListener("click", sortTable(2));
    document.getElementById("importanceColumn").addEventListener("click", sortTable(3));
    document.getElementById("detailsColumn").addEventListener("click", sortTable(4));
    document.getElementById("chunkColumn").addEventListener("click", sortTable(5));
    document.getElementById("urlColumn").addEventListener("click", sortTable(6));


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
  function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("viewTable");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        console.log({n});
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if(!x.innerHTML || !y.innerHTML) {
            shouldSwitch = false;
            break;
          }
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }

  function deleteRow(rowIndex) {
    console.log(rowIndex);
  }

  document.addEventListener('DOMContentLoaded', setupChunks);


})();
