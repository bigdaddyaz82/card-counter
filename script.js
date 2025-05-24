let deck = [], runningCount = 0, trueCount = 0, cardsDealt = 0; let decksUsed = 1, countSystem = 'hi-lo', quizInterval = 15, quizCount = 0;

const cardValues = { '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 0, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1 };

function generateDeck(num) { const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; let fullDeck = []; for (let i = 0; i < num * 4; i++) { fullDeck.push(...cards); } return fullDeck.sort(() => Math.random() - 0.5); }

function startTraining() { decksUsed = parseInt(document.getElementById("deckCount").value); countSystem = document.getElementById("countSystem").value; deck = generateDeck(decksUsed); runningCount = 0; trueCount = 0; cardsDealt = 0; quizCount = 0; document.getElementById("setup").classList.add("hidden"); document.getElementById("trainer").classList.remove("hidden"); dealCard(); }

function dealCard() { if (deck.length === 0) return alert("Deck is empty. Restart the game."); const card = deck.pop(); cardsDealt++; updateCount(card); document.getElementById("card").textContent = card; document.getElementById("runningCount").textContent = runningCount; document.getElementById("trueCount").textContent = calculateTrueCount(); document.getElementById("cardsDealt").textContent = cardsDealt;

if (cardsDealt % quizInterval === 0) { document.getElementById("trainer").classList.add("hidden"); document.getElementById("quiz").classList.remove("hidden"); } }

function updateCount(card) { const val = cardValues[card] || 0; runningCount += val; }

function calculateTrueCount() { let decksRemaining = ((decksUsed * 52) - cardsDealt) / 52; decksRemaining = Math.max(1, decksRemaining); trueCount = Math.round(runningCount / decksRemaining); return trueCount; }

function submitQuiz() { const userTrue = parseInt(document.getElementById("userTrueCount").value); const userBet = document.getElementById("userBet").value; let feedback = "Correct True Count: " + trueCount + "\n"; feedback += "Your Answer: " + userTrue + "\n"; feedback += "Suggested Bet (example logic): " + (trueCount > 1 ? "Raise bet" : "Min bet") + "\n"; feedback += "Your Bet: " + userBet;

document.getElementById("quiz").classList.add("hidden"); document.getElementById("results").classList.remove("hidden"); document.getElementById("feedback").textContent = feedback; }

