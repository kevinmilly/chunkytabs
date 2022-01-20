'use strict';

(function () {
  const chunkStorage = {
    getChunks: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['chunks'], function (results) {
          if (!results.data) {
            //resolve([])
            resolve(
              [
                {
                  name: 'Finish PR',
                  urgency: 'Soon',
                  difficulty: 'Medium',
                  importance: 'Low',
                  details: '-',
                  chunkCategory: 'Work',
                  url: 'http://www.github.com'
                },
                {
                  name: 'Call Mom about her gift',
                  urgency: 'Now',
                  difficulty: 'Medium',
                  importance: 'High',
                  details: 'She called the other day',
                  chunkCategory: 'Family',
                  url: 'http://www.amazon.com'
                },
                {
                  name: 'Study for Exam',
                  urgency: 'Soon',
                  difficulty: 'Hard',
                  importance: 'High',
                  details: 'I hate school',
                  chunkCategory: 'School',
                  url: 'http://www.math.com'
                }
              ]
            )
          } else {
            resolve(results);
          }
        });
      });
    },
    getChunkNames: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['chunks'], function (result) {
          if (!result.data) {
            resolve(["Work", "School", "Family"])
          } else {
            resolve(result.map(r => r.name));
          }
        });
      });
    },
    set: (chunkToSave) => {
      chrome.storage.sync.get(['chunks'], function (chunks) {
        if (Object.keys(chunks).length > 0) {
          // The data array already exists, add to it the new server and nickname
          chunks.data.push(chunkToSave);
        } else {
          // The data array doesn't exist yet, create it
          chunks.data = [chunkToSave];
        }

        // Now save the updated chunks using set
        chrome.storage.sync.set(chunks, function () {
          console.log('Data successfully saved to the storage!');
        });
      });
    }
  };

  const chunkSelection = document.getElementById('chunkSelection');
  const submit = document.getElementById('submit');
  const taskTab = document.getElementById("associatedSite");
  let currentTab = '';
  let savedChunks;



  async function setupChunks() {
    const savedChunkNames = await chunkStorage.getChunkNames();
    savedChunks = await chunkStorage.getChunks();

    setUpViewTable(savedChunks);

    savedChunkNames.forEach(chunkOption => chunkSelection.appendChild(new Option('', chunkOption)))
    currentTab = await getCurrentTab();
    taskTab.value = currentTab.url;

    setupLaunchTable(savedChunkNames, savedChunks);

    submit.addEventListener('click', addChunk);

  }

  function setUpViewTable(savedChunksForTable) {
    const table = document.getElementById('viewTable');
    let td;
    let tr = document.createElement('tr');
    savedChunksForTable.sort((a, b) => a.chunkCategory.localeCompare(b.chunkCategory)).forEach((chunk, rowIndex) => {
      Object.keys(chunk).forEach((property, i) => {
        td = document.createElement('td');
        td.appendChild(document.createTextNode(chunk[property]));
        tr.appendChild(td);
      });
      td = document.createElement('td').appendChild(document.createTextNode("Delete"));
      td.addEventListener("click", (rowIndex) => deleteRow(rowIndex));
      tr.appendChild(td);
      table.appendChild(tr);
      tr = document.createElement('tr');
    });
  }

  function setupLaunchTable(categories, chunks) {

    const finalizedChunkInfo = categories.map(category => {
      const applicableChunks = chunks.filter(chunk => chunk.chunkCategory === category);
      return (
        {
          category,
          avgUrgency: getMostFrequent(applicableChunks.map(chunk => chunk.urgency)),
          avgDifficulty: getMostFrequent(applicableChunks.map(chunk => chunk.difficulty)),
          avgImportance: getMostFrequent(applicableChunks.map(chunk => chunk.importance)),
          numberOfTasks: applicableChunks.length
        }
      )
    })

    const table = document.getElementById('launchChunkTable');
    let td;
    let tr = document.createElement('tr');
    finalizedChunkInfo.forEach((chunkInfo, rowIndex) => {
      Object.keys(chunkInfo).forEach((property, i) => {
        td = document.createElement('td');
        td.appendChild(document.createTextNode(chunkInfo[property]));
        tr.appendChild(td);
      });
      tr.appendChild(td);
      table.appendChild(tr);
      tr = document.createElement('tr');
    });

   const chunkLauncher = document.getElementById("chunkLauncher");
   categories.forEach(category => chunkLauncher.appendChild(new Option('', category)))

    document.getElementById("launchChunk").addEventListener("click", function() {
      const chunkToLaunch = document.getElementById("selected_chunk_to_launch").value;

      if(!!chunkToLaunch) {
        const matchingSavedChunks = savedChunks.filter(chunk => chunk.chunkCategory === chunkToLaunch);
        console.log(savedChunks);
        matchingSavedChunks.forEach(matchedChunk => {
          console.log(`Launching ${matchedChunk.url}`);
          chrome.tabs.create({
            url:matchedChunk ? matchedChunk.url : 'https://opensea.io/collection/pseudolife'
          });
        })
      }
    })
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

  async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  function getMostFrequent(arr) {
    const hashmap = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {})
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b)
  }

  document.addEventListener('DOMContentLoaded', setupChunks);


})();
