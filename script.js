console.log("loaded");

let dictionary = [];
let blocks = ["", "", "", ""];
let letters = [];
let used = [];

function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

const load = async (file) => {
  const response = await fetch(file);
  const data = await response.json();
  return data;
};

const bind = () => {
  document
    .querySelector("#addButton")
    .addEventListener("click", function (event) {
      console.log("add clicked");
      //   console.log(event); // The event details
      //   console.log(event.target); // The clicked element
      blocks = [...blocks, ""];
      findWords();
      render();
    });

  document
    .querySelector("#removeButton")
    .addEventListener("click", function (event) {
      console.log("remove clicked");
      blocks = blocks.slice(0, blocks.length - 1);
      findWords();
      render();
    });

  document.querySelector("#letters").addEventListener("change", function (e) {
    letters = e.target.value.split("");
    console.log("letters changed ", letters.join(", "));
    findWords();
  });
};

const handleKeyDown = (e) => {
  e.preventDefault();
  console.log("input keydown", e);
  if (e.keyCode >= 65 && e.keyCode <= 90) {
    e.target.value = e.key;
  } else {
    e.target.value = "";
  }
  if (e.target.nextSibling && e.keyCode !== 8) {
    e.target.nextSibling.focus();
  } else if (e.target.previousSibling && e.keyCode === 8) {
    e.target.previousSibling.focus();
  }

  //debugger;

  //re-sync data to array
  const blockEls = document.querySelectorAll(".block");
  blockEls.forEach((b, i) => {
    blocks[i] = b.value;
  });

  findWords();
  //render();
};

const handleWordClick = (e) => {
  const word = e.target.innerText;
  console.log('clicked word', word)
  used.push(word);
  findWords();
}

/*
const handleInputChange = (e) => {
  console.log("input change", e);
  //TODO re-sync in separate onchange handler to get key or empty
  const blockEls = document.querySelectorAll(".block");
  blockEls.forEach((b, i) => {
    blocks[i] = b.value;
  });

  console.log("updated blocks to ", blocks);

  findWords();
};
*/

const render = () => {
  const el = document.querySelector(".blocks");

  //TODO try new replaceChildren() API
  el.innerHTML = "";
  for (let i = 0; i < blocks.length; i++) {
    // const newEl = document.createElement('div');
    // newEl.classList.add("block");
    // newEl.innerHTML = blocks[i];
    // el.appendChild(newEl);

    const newEl = document.createElement("input");
    newEl.classList.add("block");
    newEl.value = blocks[i];
    newEl.setAttribute("maxlength", 1);
    newEl.setAttribute("size", 1);
    newEl.addEventListener("keydown", handleKeyDown);
    //newEl.addEventListener("change", handleInputChange);
    el.appendChild(newEl);
  }
};

const findWords = () => {

  if (letters.length === 0 && blocks.every(b => b === "")) {
    const outputEl = document.querySelector("#output");
    outputEl.innerHTML = "";
    return;
  }



  //initial filter to get right length and letters
  let possibleWords = dictionary.filter(
    (w) => w.length === blocks.length
  );
  console.log(`word length possibleWords ${possibleWords.length}`, possibleWords)

  if (letters.length > 0) {
    possibleWords = possibleWords.filter(
      (w) => w.every((l) => letters.includes(l))
    );

    //second filter to match letter count
    possibleWords = possibleWords.filter((w) => {
      const tempLetters = [...letters];
      //debugger;
      for (let i = 0; i < w.length; i++) {
        const letterIndex = tempLetters.findIndex((a) => a === w[i]);
        if (letterIndex === -1) {
          return false;
        }
        tempLetters.splice(letterIndex, 1);
      }
      return true;
    });

  }

  


  console.log(`letter count ${possibleWords.length}`)

  // filter to match existing letter positions
  possibleWords = possibleWords.filter((w) => {
    for (let i = 0; i < w.length; i++) {
      if (blocks[i] && blocks[i] !== w[i]) {
        return false;
      }
    }
    return true;
  });

  console.log(`letter position possibleWords ${possibleWords.length}`)

  //filter to remove any words already used
  possibleWords = possibleWords.filter((w) => !used.includes(w.join("")));

  console.log(
    `based on letters got ${possibleWords.length} possible words`,
    possibleWords.map((p) => p.join(""))
  );

  //render possible words
  const outputEl = document.querySelector("#output");
  outputEl.innerHTML = "";
  for (const w of possibleWords) {
    const newEl = document.createElement("div");
    newEl.innerHTML = w.join("");
    newEl.addEventListener("click", handleWordClick)
    outputEl.appendChild(newEl);
  }

  //render used words TODO only need to update this when a new word is used
  const usedEl = document.querySelector("#used");
  usedEl.innerHTML = "";
  for (const w of used) {
    const newEl = document.createElement("div");
    newEl.innerHTML = w;
    usedEl.appendChild(newEl);
  }
};

const run = async () => {
  const wordData = await load("dictionary.json");

  dictionary = wordData.map((w) => w.split(""));
  console.log(`got ${dictionary.length} words`);

  bind();

  render();
};

ready(run);
