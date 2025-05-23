// DOM Elements - NEW Features
const cardSpeedInputEl = document.getElementById('cardSpeed');
const howToPlayButtonEl = document.getElementById('howToPlayButton');
const accuracyDisplayEl = document.getElementById('accuracyDisplay');
const bettingPracticeSectionEl = document.getElementById('bettingPracticeSection');
const bettingTrueCountDisplayEl = document.getElementById('bettingTrueCountDisplay');
const betMinButtonEl = document.getElementById('betMinButton');
const betMidButtonEl = document.getElementById('betMidButton');
const betMaxButtonEl = document.getElementById('betMaxButton');
const bettingFeedbackEl = document.getElementById('bettingFeedback');
const continueDealingButtonEl = document.getElementById('continueDealingButton');
const howToPlayModalEl = document.getElementById('howToPlayModal');
const closeHowToPlayModalButtonEl = document.getElementById('closeHowToPlayModalButton');

// NEW CODE: Selector for the new "New Shoe / Start Game" button
const newShoeButtonEl = document.getElementById('newShoeButton'); 

// Sounds
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const bgMusic = document.getElementById('bgMusic');

if (correctSound) correctSound.volume = 0.3;
if (wrongSound) wrongSound.volume = 0.3;
if (bgMusic) bgMusic.volume = 0.15;

// Card data (Hi-Lo system)
const singleMasterDeck = [];
const suits = ['♥', '♦', '♣', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

values.forEach(value => {
    suits.forEach(suit => {
        let hiLoValue;
        if (['2', '3', '4', '5', '6'].includes(value)) hiLoValue = 1;
        else if (['7', '8', '9'].includes(value)) hiLoValue = 0;
        else hiLoValue = -1;
        singleMasterDeck.push({
            label: value, suit: suit, hiLoVal: hiLoValue,
            color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
        });
    });
});

// Game State Variables
let currentCard = null;
let score = 0;
let runningCount = 0;
let highScore = 0;
let gameTimer = null;
let timeLeft = 0; 
let gameActive = false;
let musicOn = false;
let gameShoe = [];
let cardsDealtInShoe = 0;
let totalCardsInShoe = 0;
let trueCount = 0;
const SHUFFLE_PENETRATION = 0.75;
let currentCardSpeed = parseFloat(localStorage.getItem('cardCounterSpeed')) || 5; 
let sessionCorrectGuesses = 0;
let sessionTotalCardsDealt = 0; 
let gamePausedForBetting = false;
const CARDS_BETWEEN_BETS = 10; 
const levelDefaultTimes = { practice: 600, beginner: 15, advanced: 10, expert: 5 }; 

function initializeApp() {
    levelSelectEl.addEventListener('change', handleGameSettingChange);
    deckSizeEl.addEventListener('change', handleGameSettingChange);
    musicToggleBtn.addEventListener('click', toggleMusic);
    actionButtons.forEach(button => {
        button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
    });
    
    // NEW CODE: Event listener for the "New Shoe / Start Game" button
    if (newShoeButtonEl) {
        newShoeButtonEl.addEventListener('click', startNewGame);
    }

    setupCardSpeedControl();
    setupHowToPlayModal();
    setupBettingPracticeControls();
    
    updateMusicButtonVisuals();
    setupInitialScreen();
}

function setupInitialScreen() {
    console.log("SCRIPT DEBUG: setupInitialScreen called");
    clearInterval(gameTimer);
    gameActive = false;
    gamePausedForBetting = false;
    score = 0;
    runningCount = 0;
    trueCount = 0;
    cardsDealtInShoe = 0;
    sessionCorrectGuesses = 0; 
    sessionTotalCardsDealt = 0;
    
    updateCardSpeedInputFromLevel(); 
    loadHighScoreForCurrentLevel();
    updateScoreboardVisuals();
    updateAllCountVisuals();
    updateAccuracyDisplay(); 
    
    displayMessage("Select settings and click 'New Shoe / Start Game' or a card value button to begin!", "info");
    
    if (cardContainerEl) cardContainerEl.classList.remove('flipping');
    if (cardBackEl) cardBackEl.textContent = '?';
    if (cardFrontEl) cardFrontEl.textContent = '';
    
    updateTimerDisplayVisuals();
    if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none'; 
}

function handleGameSettingChange() {
    console.log("SCRIPT DEBUG: Game setting changed (level or deck size)");
    updateCardSpeedInputFromLevel(); 
    setupInitialScreen(); 
}

function setupCardSpeedControl() {
    if (!cardSpeedInputEl) return;
    cardSpeedInputEl.value = currentCardSpeed;
    cardSpeedInputEl.addEventListener('input', () => { // Changed to 'input' for real-time updates
        let speedVal = parseFloat(cardSpeedInputEl.value);
        if (isNaN(speedVal) || speedVal < 0.5) speedVal = 0.5;
        if (speedVal > 600) speedVal = 600; 
        currentCardSpeed = speedVal;
        // cardSpeedInputEl.value = currentCardSpeed; // Good to ensure display matches clamped value
        localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString());
        if (!gameActive) { 
            updateTimerDisplayVisuals();
        }
    });
    updateCardSpeedInputFromLevel(); 
}

function updateCardSpeedInputFromLevel() {
    const currentLevel = levelSelectEl.value;
    currentCardSpeed = levelDefaultTimes[currentLevel] || 5; // fallback
    if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
    localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); 
    if (!gameActive) updateTimerDisplayVisuals();
}

function updateTimerDisplayVisuals() {
    if (!timerDisplayEl) return;
    const isPractice = levelSelectEl.value === "practice";
    if (isPractice || currentCardSpeed >= 600) { // Ensure practice is infinite time
        timerDisplayEl.textContent = "Time: ∞";
    } else {
        timerDisplayEl.textContent = `Time: ${cardSpeedInputEl.value}s`;
    }
}

function setupHowToPlayModal() {
    if (!howToPlayButtonEl || !howToPlayModalEl || !closeHowToPlayModalButtonEl) return;
    howToPlayButtonEl.addEventListener('click', () => {
        howToPlayModalEl.style.display = 'flex';
    });
    closeHowToPlayModalButtonEl.addEventListener('click', () => {
        howToPlayModalEl.style.display = 'none';
    });
    window.addEventListener('click', (event) => { 
        if (event.target === howToPlayModalEl) {
            howToPlayModalEl.style.display = 'none';
        }
    });
}

function setupBettingPracticeControls() {
    if (!betMinButtonEl || !betMidButtonEl || !betMaxButtonEl || !continueDealingButtonEl) return;
    betMinButtonEl.addEventListener('click', () => handleBetChoiceInput('min'));
    betMidButtonEl.addEventListener('click', () => handleBetChoiceInput('mid'));
    betMaxButtonEl.addEventListener('click', () => handleBetChoiceInput('max'));
    continueDealingButtonEl.addEventListener('click', resumeAfterBettingPractice);
}

function triggerBettingPractice() {
    if (levelSelectEl.value === "practice") { 
        dealNewCard(); 
        return;
    }
    gamePausedForBetting = true;
    clearInterval(gameTimer); 
    if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'block';
    if (bettingTrueCountDisplayEl) bettingTrueCountDisplayEl.textContent = trueCount.toFixed(1);
    if (bettingFeedbackEl) {
        bettingFeedbackEl.textContent = "";
        bettingFeedbackEl.className = ''; 
    }
    if (continueDealingButtonEl) continueDealingButtonEl.style.display = 'none';
    actionButtons.forEach(btn => btn.disabled = true); 
}

function handleBetChoiceInput(betChoice) {
    if (!betMinButtonEl || !betMidButtonEl || !betMaxButtonEl || !bettingFeedbackEl || !continueDealingButtonEl) return;

    betMinButtonEl.disabled = true;
    betMidButtonEl.disabled = true;
    betMaxButtonEl.disabled = true;

    let feedbackMsg = "";
    const tc = parseFloat(trueCount);
    let optimalBet = "";

    if (tc < 1) optimalBet = "min";
    else if (tc >= 1 && tc < 3) optimalBet = "mid";
    else optimalBet = "max";

    if (betChoice === optimalBet) {
        feedbackMsg = `Correct! Bet: ${betChoice.toUpperCase()}. TC: ${tc.toFixed(1)}`;
        bettingFeedbackEl.className = 'message-correct';
    } else {
        feedbackMsg = `Considered: ${betChoice.toUpperCase()}. Optimal: ${optimalBet.toUpperCase()} for TC: ${tc.toFixed(1)}`;
        bettingFeedbackEl.className = 'message-info'; 
    }
    bettingFeedbackEl.textContent = feedbackMsg;
    continueDealingButtonEl.style.display = 'inline-block';
}

function resumeAfterBettingPractice() {
    gamePausedForBetting = false;
    if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none';
    if (betMinButtonEl) betMinButtonEl.disabled = false;
    if (betMidButtonEl) betMidButtonEl.disabled = false;
    if (betMaxButtonEl) betMaxButtonEl.disabled = false;
    actionButtons.forEach(btn => btn.disabled = false);
    dealNewCard(); 
}

function updateAccuracyDisplay() {
    if (!accuracyDisplayEl) return;
    if (sessionTotalCardsDealt > 0) {
        const acc = (sessionCorrectGuesses / sessionTotalCardsDealt) * 100;
        accuracyDisplayEl.textContent = `${acc.toFixed(1)}% (${sessionCorrectGuesses}/${sessionTotalCardsDealt})`;
    } else {
        accuracyDisplayEl.textContent = "N/A";
    }
}

function resetSessionStats() {
    sessionCorrectGuesses = 0;
    sessionTotalCardsDealt = 0;
    updateAccuracyDisplay();
}

function buildShoe() {
    console.log("SCRIPT DEBUG: buildShoe called");
    const numDecks = parseInt(deckSizeEl.value) || 1; // Default to 1 deck if parse fails
    gameShoe = [];
    for (let i = 0; i < numDecks; i++) {
        gameShoe.push(...JSON.parse(JSON.stringify(singleMasterDeck))); 
    }
    totalCardsInShoe = gameShoe.length;
    cardsDealtInShoe = 0;
    
    // Fisher-Yates Shuffle
    for (let i = gameShoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]];
    }
    console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards from ${numDecks} deck(s).`);
}

function handleUserChoice(choice) {
    // If game is not active AND not paused for betting, clicking a choice button starts a new game.
    // This behavior is retained. The new "New Shoe" button is just a more explicit way.
    if (!gameActive && !gamePausedForBetting) { 
        startNewGame(); 
        return; 
    }
    // If game is active and not paused, process the guess.
    if (gameActive && !gamePausedForBetting) { 
         processGuess(choice);
    }
}

function startNewGame() {
    console.log("SCRIPT DEBUG: startNewGame called");
    clearInterval(gameTimer);
    gameActive = true;
    gamePausedForBetting = false; // Ensure betting pause is cleared
    score = 0;
    runningCount = 0;
    trueCount = 0;
    resetSessionStats(); 

    buildShoe(); // Builds and shuffles the shoe
    
    loadHighScoreForCurrentLevel();
    updateScoreboardVisuals();
    updateAllCountVisuals(); // Recalculates true count based on new shoe
    
    displayMessage("Shoe ready. Good luck!", "info");
    dealNewCard(); // Deals the first card
}

function processGuess(userChoice) {
    if (!currentCard || !gameActive || gamePausedForBetting) return;

    clearInterval(gameTimer); 
    sessionTotalCardsDealt++; 

    let expectedValue;
    if (userChoice === 'plus') expectedValue = 1;
    else if (userChoice === 'minus') expectedValue = -1;
    else expectedValue = 0;

    if (expectedValue === currentCard.hiLoVal) {
        score++;
        sessionCorrectGuesses++; 
        runningCount += currentCard.hiLoVal; 
        
        // playSound(correctSound); // Correct sound remains disabled as per original
        
        displayMessage("Correct!", "correct");
        
        if (score > highScore) {
            highScore = score;
            saveHighScoreForCurrentLevel();
        }
        updateScoreboardVisuals();
        updateAllCountVisuals(); 
        updateAccuracyDisplay();

        if (sessionCorrectGuesses > 0 && sessionCorrectGuesses % CARDS_BETWEEN_BETS === 0 && levelSelectEl.value !== "practice") {
            triggerBettingPractice(); 
        } else {
            dealNewCard(); 
        }
    } else {
        playSound(wrongSound);
        updateAccuracyDisplay(); 
        gameOver(`Wrong guess! Expected ${currentCard.hiLoVal > 0 ? '+' : (currentCard.hiLoVal < 0 ? '' : '0')}${currentCard.hiLoVal} for ${currentCard.label}${currentCard.suit}. RC: ${runningCount}`);
    }
}

function dealNewCard() {
    console.log("SCRIPT DEBUG: dealNewCard called");
    if (!gameActive || gamePausedForBetting) { 
        console.log("SCRIPT DEBUG: DealNewCard aborted. gameActive:", gameActive, "gamePausedForBetting:", gamePausedForBetting);
        return;
    }

    if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) {
        const penetrationPercent = totalCardsInShoe > 0 ? ((cardsDealtInShoe/totalCardsInShoe)*100).toFixed(0) : 0;
        displayMessage(`Shuffle time! Penetration: ${penetrationPercent}%. Starting new shoe.`, "info");
        setTimeout(() => {
            if (gameActive) startNewGame(); 
        }, 2000);
        return;
    }

    currentCard = gameShoe.pop();
    cardsDealtInShoe++;
    console.log("SCRIPT DEBUG: Card dealt from shoe. Cards remaining:", gameShoe.length);
    
    // Crucially, update counts *before* animating card flip, so true count is based on state *before* current card is known to user
    // However, the true count for betting advice should be based on the count *before* the player makes a decision on the *next* hand.
    // For this app's flow (player guesses value of current card), updating counts after guess is fine.
    // But true count displayed should reflect cards *not yet seen*.
    // Let's adjust: runningCount is updated after guess. True count is based on that.
    updateAllCountVisuals(); // This will use current runningCount & remaining decks
    animateCardFlip(); 
}

function updateAllCountVisuals() {
    if (runningCountDisplayEl) runningCountDisplayEl.textContent = `Running Count: ${runningCount}`;
    
    const decksRemaining = Math.max(0.01, (totalCardsInShoe - cardsDealtInShoe) / 52); // Avoid division by zero, ensure minimum deck fraction
    
    if (totalCardsInShoe > 0) { // only calculate if shoe is built
        trueCount = runningCount / decksRemaining;
    } else {
        trueCount = 0; // Before shoe is built or if error
    }
    
    let trueCountText = "0.0";
    if (isFinite(trueCount)) {
        trueCountText = trueCount.toFixed(1);
    } else if (trueCount === Infinity) {
        trueCountText = "Very High+";
    } else if (trueCount === -Infinity) {
        trueCountText = "Very Low-";
    }

    if (trueCountDisplayEl) trueCountDisplayEl.textContent = `True Count: ${trueCountText}`;
    if (deckInfoDisplayEl) deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`;
    console.log(`SCRIPT DEBUG: Counts updated - RC: ${runningCount}, TC: ${trueCountText}, Decks Left: ${decksRemaining.toFixed(1)}`);
}

function animateCardFlip() {
    if (!gameActive || gamePausedForBetting || !cardContainerEl) return; 

    if (cardContainerEl.classList.contains('flipping')) { 
        cardContainerEl.classList.remove('flipping'); 
        setTimeout(updateCardFaceAndFlipToFront, 50); 
    } else { 
        updateCardFaceAndFlipToFront();
    }
}

function updateCardFaceAndFlipToFront() {
    console.log("SCRIPT DEBUG: updateCardFaceAndFlipToFront called"); 
    if (!currentCard) {
        console.error("SCRIPT DEBUG: currentCard is null in updateCardFaceAndFlipToFront.");
        if (cardFrontEl) cardFrontEl.textContent = ''; // Clear display
        return;
    }
    console.log("SCRIPT DEBUG: Current card:", JSON.parse(JSON.stringify(currentCard))); 

    if (cardFrontEl) {
        cardFrontEl.textContent = currentCard.label + currentCard.suit;
        console.log("SCRIPT DEBUG: Card front text set to:", cardFrontEl.textContent); 
        cardFrontEl.className = 'card-face card-front'; 
        cardFrontEl.classList.add(currentCard.color);   
    }

    setTimeout(() => {
        console.log("SCRIPT DEBUG: Attempting to add 'flipping' class to cardContainerEl"); 
        if (!cardContainerEl) {
            console.error("SCRIPT DEBUG: cardContainerEl is null! Cannot add class.");
            return;
        }
        cardContainerEl.classList.add('flipping'); 
        startRoundTimer(); 
    }, 50); 
}

function startRoundTimer() {
    if (!gameActive || gamePausedForBetting) return;
    clearInterval(gameTimer);
    
    const isPractice = levelSelectEl.value === "practice";
    if (isPractice || currentCardSpeed >= 600) { 
        if (timerDisplayEl) timerDisplayEl.textContent = "Time: ∞";
        return; 
    }

    timeLeft = currentCardSpeed; 
    if (timerDisplayEl) timerDisplayEl.textContent = `Time: ${timeLeft}s`;

    gameTimer = setInterval(() => {
        if (gamePausedForBetting) { 
            clearInterval(gameTimer);
            return;
        }
        timeLeft--;
        if (timerDisplayEl) timerDisplayEl.textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            playSound(wrongSound);
            sessionTotalCardsDealt++; 
            updateAccuracyDisplay();
            gameOver(`Time's up! RC: ${runningCount}`);
        }
    }, 1000);
}

function gameOver(reason) {
    clearInterval(gameTimer);
    gameActive = false; 
    // NEW CODE: Changed message to guide user to new shoe button or action buttons
    displayMessage(`${reason}. Score: ${score}. Click 'New Shoe / Start Game' or a card value button to play again.`, "wrong");
}

function updateScoreboardVisuals() {
    if (scoreEl) scoreEl.textContent = score;
    if (highscoreEl) highscoreEl.textContent = highScore;
}

function displayMessage(msg, typeClass) {
    if (!messageDisplayEl) return;
    messageDisplayEl.textContent = msg;
    messageDisplayEl.className = 'message-display'; 
    if (typeClass) {
        messageDisplayEl.classList.add(`message-${typeClass}`);
    }
}

function playSound(soundElement) {
    if (soundElement && typeof soundElement.play === 'function') { 
        soundElement.currentTime = 0; 
        soundElement.play().catch(error => console.warn(`Sound play failed: ${error.message}`));
    }
}

function toggleMusic() {
    musicOn = !musicOn;
    if (musicOn) {
        if (bgMusic) bgMusic.play().catch(error => console.warn(`Music play failed: ${error.message}`));
    } else {
        if (bgMusic) bgMusic.pause();
    }
    updateMusicButtonVisuals();
    localStorage.setItem('cardCounterMusicOn', musicOn.toString());
}

function updateMusicButtonVisuals() {
    if (!musicToggleBtn) return;
    musicToggleBtn.textContent = musicOn ? "Music ON" : "Music OFF";
    musicToggleBtn.classList.toggle('on', musicOn);
}

function saveHighScoreForCurrentLevel() {
    try {
        const currentLevel = levelSelectEl.value;
        const currentDeckSize = deckSizeEl.value;
        localStorage.setItem(`cardCounterHighScore_${currentLevel}_${currentDeckSize}`, highScore.toString()); 
    } catch (e) {
        console.warn("Could not save high score:", e.message);
    }
}

function loadHighScoreForCurrentLevel() {
    try {
        const currentLevel = levelSelectEl.value;
        const currentDeckSize = deckSizeEl.value;
        const savedScore = localStorage.getItem(`cardCounterHighScore_${currentLevel}_${currentDeckSize}`);
        highScore = parseInt(savedScore) || 0;
    } catch (e) {
        console.warn("Could not load high score:", e.message);
        highScore = 0;
    }
}

function loadInitialSettings() {
    musicOn = localStorage.getItem('cardCounterMusicOn') === 'true';
    const savedSpeed = localStorage.getItem('cardCounterSpeed');
    if (savedSpeed !== null) {
        currentCardSpeed = parseFloat(savedSpeed);
        if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
    } else {
        updateCardSpeedInputFromLevel(); 
    }
    updateMusicButtonVisuals(); 
    // Load initial high score based on default selected level and deck size
    loadHighScoreForCurrentLevel();
}

// Start the application
loadInitialSettings(); 
initializeApp(); 
