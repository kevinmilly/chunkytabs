"use strict";

(function () {
  const chunkStorage = {
    getChunks: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(function (result) {
          console.log(result.chunks);
          if (!result.chunks || result.chunks.length === 0) {
            const initialChunk = {
              id: randomId(),
              name: "Check Out Kev the Dev",
              urgency: "Later",
              difficulty: "Easy",
              importance: "Low",
              chunkCategory: "Fun",
              url: "https://www.linkedin.com/in/ksmithtech/",
            };
            chrome.storage.sync.set({ chunks: [initialChunk] });
            resolve([initialChunk]);
          } else {
            resolve(result.chunks);
          }
        });
      });
    },
    getChunkNames: () => {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get(function (result) {
          if (!result.chunks) {
            resolve(["Work", "School", "Family"]);
          } else {
            console.log(result.chunks);
            resolve(
              result.chunks
                .map((r) => r.chunkCategory)
                .filter((el, index, arr) => arr.indexOf(el) === index)
            );
          }
        });
      });
    },
    set: (chunkToSave) => {
      chrome.storage.sync.get(["chunks"], function (result) {
        if (!result.chunks || result.chunks.length === 0) {
          chrome.storage.sync.set({ chunks: [chunkToSave] }, function () {
            console.log("Data successfully saved to the storage!");
          });
        } else {
          result.chunks.push(chunkToSave);
          chrome.storage.sync.set({ chunks: result.chunks }, function () {
            console.log("Data successfully saved to the storage!");
          });
        }
      });
    },
    remove: (chunkId) => {
      chrome.storage.sync.get(["chunks"], function (result) {
        const newChunks = result.chunks.filter((chunk) => chunk.id !== chunkId);
        chrome.storage.sync.set({ chunks: newChunks }, function () {
          console.log(`Successfully removed chunk Id: ${chunkId}`);
        });
      });
    },
  };

  const chunkSelection = document.getElementById("chunkSelection");
  const submit = document.getElementById("submit");
  const taskTab = document.getElementById("associatedSite");
  let currentTab = "";
  let savedChunks;

  async function setupChunks() {
    savedChunks = await chunkStorage.getChunks();
    const savedChunkNames = await chunkStorage.getChunkNames();

    savedChunkNames.forEach((chunkOption) =>
      chunkSelection.appendChild(new Option("", chunkOption))
    );

    currentTab = await getCurrentTab();
    taskTab.value = currentTab.url;

    setupLaunchTable(savedChunkNames, savedChunks);
    setUpViewTable(savedChunks);

    submit.addEventListener("click", addChunk);
  }

  function setUpViewTable(savedChunksForTable) {
    const table = document.getElementById("viewTable");
    let checkboxCompletion;
    let td;
    let tr = document.createElement("tr");
    savedChunksForTable
      .sort((a, b) => a.chunkCategory.localeCompare(b.chunkCategory))
      .forEach((chunk, rowIndex) => {
        td = document.createElement("td");
        td.appendChild(document.createTextNode(chunk.name));
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(chunk.urgency));
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(chunk.difficulty));
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(chunk.importance));
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(chunk.chunkCategory));
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(chunk.url));
        tr.appendChild(td);

        checkboxCompletion = document.createElement("input");
        checkboxCompletion.type = "checkbox";
        checkboxCompletion.setAttribute("id", `${chunk.id}`);
        checkboxCompletion.addEventListener("change", completeTask);
        tr.appendChild(checkboxCompletion);
        table.appendChild(tr);
        tr = document.createElement("tr");
      });
  }

  function setupLaunchTable(categories, chunks) {
    console.log({ categories });
    console.log({chunks});
    const finalizedChunkInfo = categories.map((category) => {
      const applicableChunks = chunks.filter(
        (chunk) => chunk.chunkCategory === category
      );
      return {
        category,
        avgUrgency: getMostFrequent(
          applicableChunks.map((chunk) => chunk.urgency)
        ),
        avgDifficulty: getMostFrequent(
          applicableChunks.map((chunk) => chunk.difficulty)
        ),
        avgImportance: getMostFrequent(
          applicableChunks.map((chunk) => chunk.importance)
        ),
        numberOfTasks: applicableChunks.length,
      };
    });

    const table = document.getElementById("launchChunkTable");
    console.log({table});
    console.log(document.querySelectorAll("table"));
    let td;
    let tr = document.createElement("tr");
    if (finalizedChunkInfo) {
      finalizedChunkInfo.forEach((chunkInfo, rowIndex) => {
        Object.keys(chunkInfo).forEach((property, i) => {
          td = document.createElement("td");
          td.appendChild(document.createTextNode(chunkInfo[property]));
          tr.appendChild(td);
        });
        tr.appendChild(td);
        table.appendChild(tr);
        tr = document.createElement("tr");
      });
    }

    const chunkLauncherSelect = document.getElementById(
      "selected_chunk_to_launch"
    );
    categories.forEach((category) =>
      chunkLauncherSelect.add(new Option(`${category}`, category))
    );

    document
      .getElementById("launchChunk")
      .addEventListener("click", function () {
        const chunkToLaunch = document.getElementById(
          "selected_chunk_to_launch"
        ).value;
        if (!!chunkToLaunch) {
          const matchingSavedChunks = savedChunks.filter(
            (chunk) => chunk.chunkCategory === chunkToLaunch
          );
          console.log(savedChunks);
          matchingSavedChunks.forEach((matchedChunk) => {
            console.log(`Launching ${matchedChunk.url}`);
            chrome.tabs.create({
              url: matchedChunk
                ? matchedChunk.url
                : "https://opensea.io/collection/pseudolife",
            });
          });
        }
      });
  }

  function addChunk() {
    chunkStorage.set({
      id: randomId(),
      name: document.getElementById("taskName").value,
      urgency: document.getElementById("urgency").value,
      difficulty: document.getElementById("difficulty").value,
      importance: document.getElementById("importance").value,
      chunkCategory: document.getElementById("selected_chunk_to_add").value,
      url: document.getElementById("associatedSite").value,
    });
  }

  function completeTask(event) {
    console.log(`Completing id: ${event.target.id}`);
    chunkStorage.remove(event.target.id);
  }

  async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  function getMostFrequent(arr) {
    if (arr.length > 0) {
      const hashmap = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      return Object.keys(hashmap).reduce((a, b) =>
        hashmap[a] > hashmap[b] ? a : b
      );
    }
  }

  function randomId() {
    return (Math.random() + 1).toString(36).substring(2);
  }

  //Tabs functionality
  const tabs = document.querySelector(".wrapper");
  const tabButton = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".content");

  tabs.onclick = (e) => {
    const id = e.target.dataset.id;
    if (id) {
      tabButton.forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");

      contents.forEach((content) => {
        content.classList.remove("active");
      });
      const element = document.getElementById(id);
      element.classList.add("active");
    }
  };
  //End Tabs functionality

  document.addEventListener("DOMContentLoaded", setupChunks);
})();
