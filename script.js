// script.js

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

