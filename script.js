// Card data - images must be in /cards/ folder named like "2H.png", "KD.png" etc.
const suits = ['C', 'D', 'H', 'S']; // Clubs, Diamonds, Hearts, Spades
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Hi-Lo counting values
const countValues = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};

let deck = [];
let runningCount = 0;
let cardsDealt = 0;
const totalDecks = 4; // standard shoe
let isPlaying = false;
let correctAnswers = 0;
let totalAnswers = 0;

const cardImage = document.getElementById('cardImage');
const runningCountEl = document.getElementById('runningCount');
const trueCountEl = document.getElementById('trueCount');
const accuracyEl = document.getElementById('accuracy');
const messageEl = document.getElementById('message');
const startGameBtn = document.getElementById('startGameBtn');
const countButtons = document.querySelectorAll('.count-btn');
const musicToggleBtn = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const howToPlayModal = document.getElementById('howToPlayModal');
const closeModalBtn = document.getElementById('closeModalBtn');

function createDeck(decks = 1) {
  let newDeck = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        newDeck.push({rank, suit});
      }
    }
  }
  return newDeck;
}

function shuffleDeck(deckArray) {
  for (let i = deckArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deckArray[i], deckArray[j]] = [deckArray[j], deckArray[i]];
  }
  return deckArray;
}

function updateScoreboard() {
  runningCountEl.textContent = runningCount;
  const decksLeft = (deck.length - cardsDealt) / 52;
  const trueCount = decksLeft > 0 ? runningCount / decksLeft : runningCount;
  trueCountEl.textContent = trueCount// script.js

// State Variables let currentCount = 0; let deck = []; let score = 0; let currentCard = null; let gameMode = 'hi-lo'; let isFlashDrill = false; let flashDrillInterval; let flashDrillSpeed = 1000;

// DOM Elements const cardDisplay = document.getElementById('cardDisplay'); const countDisplay = document.getElementById('countDisplay'); const scoreDisplay = document.getElementById('score'); const startButton = document.getElementById('startGame'); const flashDrillBtn = document.getElementById('startFlashDrill'); const toggleMusicBtn = document.getElementById('toggleMusic'); const music = document.getElementById('backgroundMusic'); const strategyBtn = document.getElementById('showStrategy'); const howToBtn = document.getElementById('howToPlay'); const strategyModal = document.getElementById('strategyChartModal'); const howToModal = document.getElementById('howToModal'); const closeModals = document.querySelectorAll('.close'); const submitAnswer = document.getElementById('submitAnswer'); const userInput = document.getElementById('userInput');

// Deck Setup function buildDeck() { const suits = ['H', 'D', 'C', 'S']; const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; deck = []; suits.forEach(suit => { ranks.forEach(rank => { deck.push(${rank}${suit}); }); }); }

function shuffleDeck() { for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } }

function getCardValue(card) { const rank = card.slice(0, -1); if (['2', '3', '4', '5', '6'].includes(rank)) return 1; if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1; return 0; // 7, 8, 9 }

function drawCard() { if (deck.length === 0) { buildDeck(); shuffleDeck(); currentCount = 0; } currentCard = deck.pop(); const value = getCardValue(currentCard); currentCount += value; cardDisplay.innerText = currentCard; }

function checkAnswer() { const userAnswer = parseInt(userInput.value); if (userAnswer === currentCount) { score++; scoreDisplay.innerText = score; alert('Correct!'); } else { alert(Wrong! Count is ${currentCount}); } drawCard(); userInput.value = ''; }

function startFlashDrill() { isFlashDrill = true; flashDrillInterval = setInterval(() => { drawCard(); }, flashDrillSpeed); }

function stopFlashDrill() { isFlashDrill = false; clearInterval(flashDrillInterval); }

function toggleMusic() { if (music.paused) { music.play(); } else { music.pause(); } }

function toggleModal(modal, show) { modal.style.display = show ? 'block' : 'none'; }

function initGame() { buildDeck(); shuffleDeck(); drawCard(); score = 0; scoreDisplay.innerText = score; }

// Event Listeners startButton.addEventListener('click', () => { stopFlashDrill(); initGame(); });

flashDrillBtn.addEventListener('click', () => { initGame(); startFlashDrill(); });

submitAnswer.addEventListener('click', checkAnswer); toggleMusicBtn.addEventListener('click', toggleMusic); strategyBtn.addEventListener('click', () => toggleModal(strategyModal, true)); howToBtn.addEventListener('click', () => toggleModal(howToModal, true)); closeModals.forEach(btn => btn.addEventListener('click', () => { toggleModal(strategyModal, false); toggleModal(howToModal, false); }));

