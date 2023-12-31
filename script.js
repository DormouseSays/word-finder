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

const handleInput = (e) => {
  console.log('handleInput', e)

  let val = (e.data && e.data.charCodeAt(0)) || 0;

  console.log(`handleInput got val ${val}`)

  if (val > 96) {
    val -= 32;
  }

  if (val < 65 || val > 90) {
    e.preventDefault();
    console.log(`ignored ${e.data}`)
    e.target.innerText = "";
  } else {
    if (e.target.innerText && e.target.innerText.length > 0) {
      console.log(`val is ${e.target.innerText} shrinking to ${e.data[0]}`)
      e.target.innerText = e.data[0]
    }
  }

  //re-sync data to array
  const blockEls = document.querySelectorAll(".block");
  blockEls.forEach((b, i) => {
    blocks[i] = b.innerText.toLowerCase();
  });

  findWords();
}

const handleWordClick = (e) => {
  const word = e.target.innerText;
  console.log('clicked word', word)
  used.push(word);
  findWords();
}

const render = () => {
  const el = document.querySelector(".blocks");

  //TODO try new replaceChildren() API
  el.innerHTML = "";
  for (let i = 0; i < blocks.length; i++) {

    const newEl = document.createElement("div");
    newEl.classList.add("block");
    newEl.innerText = blocks[i];
    newEl.setAttribute("contenteditable", true);
    newEl.addEventListener("input", handleInput);
    el.appendChild(newEl);
  }

  const debugEl = document.getElementById("debug");
  debugEl.innerText = blocks.join(", ");

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
  console.log(`word length possibleWords ${possibleWords.length}`)

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
