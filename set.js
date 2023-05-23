/* 
Author: Eli Kugelsky
CS 132 Spring 2023
Date: May 13th, 2023

Make the set game interactive with animations and game play features like a
timer and randomization.
*/
(function () {
  "use strict";

  const STYLE = ["solid", "striped", "outline"];
  const COLOR = ["green", "red", "purple"];
  const SHAPE = ["diamond", "oval", "squiggle"];
  const COUNT = ["1", "2", "3"];
  const backBtn = qs("#back-btn");
  const startBtn = qs("#start-btn");

  let timerId = null; // Keeps track of the timer variable
  let secondsRemaining = 0; // represents the time in seconds left in current game

  /**
   * Initialized the game webpage
   */
  function init() {
    startBtn.addEventListener("click", toggleView);
    backBtn.addEventListener("click", toggleView);
    qs("#start-btn").addEventListener("click", startGame);
    backBtn.addEventListener("click", endGame);
  }

  /**
   * Change between game view and menu view
   */
  function toggleView() {
    qs("#menu-view").classList.toggle("hidden");
    qs("#game-view").classList.toggle("hidden");
    removeCards();
  }

  /**
   * Generates random attributes for a game card.
   * If isEasy, style is forced to solid.
   * @param {Boolean}isEasy
   * @return {Array}[style, shape, color, count]
   */
  function generateRandomAttributes(isEasy) {
    let style = null;
    if (isEasy) {
      style = "solid";
    } else {
      style = STYLE[getRandomInt(0, 3)];
    }
    let color = COLOR[getRandomInt(0, 3)];
    let shape = SHAPE[getRandomInt(0, 3)];
    let count = COUNT[getRandomInt(0, 3)];
    return [style, shape, color, count];
  }

  /**
   * Generates a random game card with random attributes
   * @param {Boolean}isEasy
   * @return card
   */
  function generateUniqueCard(isEasy) {
    let attributes = generateRandomAttributes(isEasy);
    while (id(attributes.join("-")) !== null) {
      attributes = generateRandomAttributes(isEasy);
    }
    let card = document.createElement("div");
    for (let i = 0; i < attributes[3]; i++) {
      let im = document.createElement("img");
      im.src =
        "imgs\\" +
        attributes[0] +
        "-" +
        attributes[1] +
        "-" +
        attributes[2] +
        ".png";
      im.alt = attributes.join("-");
      card.appendChild(im);
    }
    card.setAttribute("id", attributes.join("-"));
    card.classList.add("card");
    card.addEventListener("click", cardSelected);
    return card;
  }

  /**
   * Checks for a complete set with 3 cards
   * @param {Array} selected array of selected cards
   * @param {boolean}isEasy if the board is in easy mode
   * @return {boolean} T/F if a set exists
   */
  function isASet(selected, isEasy) {
    let card1 = selected[0].id.split("-");
    let card2 = selected[1].id.split("-");
    let card3 = selected[2].id.split("-");
    if (card1[0] === card2[0] && card2[0] === card3[0] && !isEasy) {
      return true;
    }
    if (card1[1] === card2[1] && card2[1] === card3[1]) {
      return true;
    }
    if (card1[2] === card2[2] && card2[2] === card3[2]) {
      return true;
    }
    if (card1[3] === card2[3] && card2[3] === card3[3]) {
      return true;
    }
    return false;
  }

  /**
   * starts the game timer
   */
  function startTimer() {
    let e = document.getElementById("menu-view").children[0].children[1].value;
    secondsRemaining = e;
    advanceTime();
    timerId = setInterval(advanceTime, 1000);
  }

  /**
   * Turns an integer of seconds to mm:ss text
   * @param {int} seconds time left to play
   * @return {string} mm:ss
   */
  function makeTime(seconds) {
    let min = Math.floor(seconds / 60).toString();
    let sec = (seconds % 60).toString();
    if (sec.length < 2) {
      sec = "0" + sec;
    }
    if (min.length < 2) {
      min = "0" + min;
    }
    return min + ":" + sec;
  }

  /**
   * Callback function to update the time remaining.
   */
  function advanceTime() {
    if (secondsRemaining <= 0) {
      endGame();
    } else {
      document.getElementById("time").innerHTML = makeTime(secondsRemaining);
    }
    secondsRemaining--;
  }

  /**
   * Callback function when game ends
   */
  function endGame() {
    document.getElementById("time").innerHTML = "00:00";
    document.getElementById("refresh-btn").disabled = true;
    let cards = document.querySelectorAll(".card");
    for (let i = 0; i < cards.length; i++) {
      cards[i].removeEventListener("click", cardSelected);
      if (cards[i].classList.contains("selected")) {
        cards[i].classList.toggle("selected");
      }
    }
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].classList.contains("selected")) {
        cards[i].classList.toggle("selected");
      }
    }
    clearInterval(timerId);
    timerId = null;
    qs("#refresh-btn").removeEventListener("click", refresh);
  }

  /**
   * Callback function called when a card is selected
   */
  function cardSelected() {
    this.classList.toggle("selected");
    let cards = qsa(".selected");
    if (cards.length === 3) {
      let isEasy = difficulty() === "easy";
      if (isASet(cards, isEasy)) {
        document.getElementById("set-count").innerHTML++;
        for (let i = 0; i < cards.length; i++) {
          cards[i].classList.toggle("hide-imgs");
          let p = document.createElement("p");
          p.textContent = "SET!";
          cards[i].appendChild(p);
          setTimeout(createSet, 1000, cards[i], true, isEasy);
        }
      } else {
        for (let i = 0; i < cards.length; i++) {
          cards[i].classList.toggle("hide-imgs");
          let p = document.createElement("p");
          p.textContent = "Not a Set :(";

          cards[i].appendChild(p);
          setTimeout(createSet, 1000, cards[i], false, isEasy);
        }
        secondsRemaining -= 15;
        if (secondsRemaining <= 0) {
          endGame();
        }
      }
    }
  }

  /**
   * If a set, cards are replaced, if not card is returned to show images
   * @param {div} card card to change
   * @param {boolean}set if selected card is part of a set
   * @param {boolean}isEasy if the board is in easy mode
   */
  function createSet(card, set, isEasy) {
    if (set) {
      card.replaceWith(generateUniqueCard(isEasy));
    } else {
      console.log(card.querySelector("p"));
      card.querySelector("p").remove();
    }
    card.classList.toggle("selected");
    card.classList.toggle("hide-imgs");
  }

  /**
   * Finds the difficulty of the game board
   * @return {string} game difficulty
   */
  function difficulty() {
    let e =
      document.getElementById("menu-view").children[0].children[3].children;
    var checkedValue = null;
    for (let i = 0; i < e.length; i++) {
      if (e[i].children[0].checked) {
        checkedValue = e[i].children[0].value;
        break;
      }
    }
    return checkedValue.toString();
  }

  /**
   * callback function to start the game
   */
  function startGame() {
    let board = document.getElementById("board");
    document.getElementById("refresh-btn").disabled = false;

    if (difficulty() === "easy") {
      qs("#refresh-btn").addEventListener("click", () => {
        refresh(true);
      });
      for (let i = 0; i < 9; i++) {
        board.appendChild(generateUniqueCard(true));
      }
    } else {
      qs("#refresh-btn").addEventListener("click", () => {
        refresh(false);
      });
      for (let i = 0; i < 12; i++) {
        board.appendChild(generateUniqueCard(false));
      }
    }
    startTimer();
  }

  /**
   * Returns a random integer [min,max)
   * @param {int} min lowest value
   * @param {int} max not inclusive highest value
   * @return {int} random number
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  /**
   * Refresh the board of all the cards
   * @param {boolean} isEasy game difficulty
   */
  function refresh(isEasy) {
    removeCards();
    let board = document.getElementById("board");
    console.log(isEasy);
    if (isEasy) {
      for (let i = 0; i < 9; i++) {
        board.appendChild(generateUniqueCard(true));
      }
    } else {
      for (let i = 0; i < 12; i++) {
        board.appendChild(generateUniqueCard(false));
      }
    }
  }

  /**
   * remove all the cards from the game board
   */
  function removeCards() {
    let board = document.getElementById("board");
    while (board.firstChild) {
      board.removeChild(board.firstChild);
    }
  }
  init();
})();
