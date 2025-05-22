document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cardContainerEl = document.getElementById('cardContainer');
    const cardFrontEl = document.querySelector('#cardContainer .card-front');
    const cardBackEl = document.querySelector('#cardContainer .card-back');
    const scoreEl = document.getElementById('score');
    const highscoreEl = document.getElementById('highscore');
    const timerDisplayEl = document.getElementById('timerDisplay');
    const levelSelectEl = document.getElementById('level');
    const musicToggleBtn = document.getElementById('musicToggle');
    const actionButtons = document.querySelectorAll('.action-buttons button');
    const messageDisplayEl = document.getElementById('messageDisplay');
    const runningCountDisplayEl = document.getElementById('runningCountDisplay');

    // NEW DOM Elements for True Count and Deck Info
    const deckSizeEl = document.getElementById('deckSize');
    const trueCountDisplayEl = document.getElementById('trueCountDisplay');
    const deckInfoDisplayEl = document.getElementById('deckInfoDisplay');
    // const shuffleSound = document.getElementById('shuffleSound'); // Optional

    // Sounds
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const bgMusic = document.getElementById('bgMusic');

    // Card data (Hi-Lo system) - This is the blueprint for a single deck
    const singleMasterDeck = [];
    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    values.forEach(value => {
        suits.forEach(suit => {
            let hiLoValue;
            if (['2', '3', '4', '5', '6'].includes(value)) hiLoValue = 1;
            else if (['7', '8', '9'].includes(value)) hiLoValue = 0;
            else hiLoValue = -1; // 10, J, Q, K, A
            singleMasterDeck.push({
                label: value,
                suit: suit,
                hiLoVal: hiLoValue,
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

    // NEW Game State Variables for Shoe and True Count
    let gameShoe = []; // This will hold the current multi-deck shoe
    let cardsDealtInShoe = 0;
    let totalCardsInShoe = 0;
    let trueCount = 0;
    const SHUFFLE_PENETRATION = 0.75; // Shuffle when 75% of the shoe is dealt

    const levelTimes = { practice: 0, beginner: 15, advanced: 10, expert: 5 };

    function initializeApp() {
        levelSelectEl.addEventListener('change', handleGameSettingChange); // Changed to generic handler
        deckSizeEl.addEventListener('change', handleGameSettingChange);   // NEW: Deck size also resets game
        musicToggleBtn.addEventListener('click', toggleMusic);
        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
        });
        
        bgMusic.volume = 0.2;
        updateMusicButtonVisuals();
        setupInitialScreen();
    }

    function setupInitialScreen() {
        console.log("SCRIPT DEBUG: setupInitialScreen called");
        clearInterval(gameTimer);
        gameActive = false;
        score = 0;
        runningCount = 0;
        trueCount = 0; // NEW
        cardsDealtInShoe = 0; // NEW
        
        loadHighScoreForCurrentLevel(); // High score is level-dependent, not deck-size dependent
        updateScoreboardVisuals();
        updateAllCountVisuals(); // NEW: Updates RC, TC, and Deck Info
        
        displayMessage("Select settings. Click a value to start!", "info");
        
        cardContainerEl.classList.remove('flipping');
        cardBackEl.textContent = '?';
        cardFrontEl.textContent = '';
        
        const currentLevel = levelSelectEl.value;
        timerDisplayEl.textContent = (currentLevel === "practice") ? "Time: ∞" : `Time: ${levelTimes[currentLevel]}s`;
    }

    function handleGameSettingChange() {
        console.log("SCRIPT DEBUG: Game setting changed (level or deck size)");
        // Changing level or deck size should reset the game and the shoe
        setupInitialScreen(); 
    }

    function buildShoe() {
        console.log("SCRIPT DEBUG: buildShoe called");
        const numDecks = parseInt(deckSizeEl.value);
        gameShoe = [];
        for (let i = 0; i < numDecks; i++) {
            gameShoe.push(...singleMasterDeck); // Add copies of the master deck
        }
        totalCardsInShoe = gameShoe.length;
        cardsDealtInShoe = 0;
        
        // Shuffle the shoe (Fisher-Yates shuffle)
        for (let i = gameShoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]];
        }
        console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards from ${numDecks} deck(s).`);
        // if (shuffleSound) playSound(shuffleSound); // Optional
    }

    function handleUserChoice(choice) {
        if (!gameActive) {
            startNewGame(); 
            return; 
        }
        processGuess(choice);
    }
    
    function startNewGame() {
        console.log("SCRIPT DEBUG: startNewGame called");
        clearInterval(gameTimer);
        gameActive = true;
        score = 0; // Score resets per game (within a shoe)
        runningCount = 0; // Running count resets at the START of a NEW SHOE
        trueCount = 0;    // True count also resets

        buildShoe(); // Build and shuffle a new shoe based on selected deck size
        
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateAllCountVisuals(); // Update RC, TC, and Deck Info
        
        displayMessage("Shoe ready. Good luck!", "info");
        dealNewCard();
    }

    function processGuess(userChoice) {
        if (!currentCard || !gameActive) return;

        let expectedValue;
        if (userChoice === 'plus') expectedValue = 1;
        else if (userChoice === 'minus') expectedValue = -1;
        else expectedValue = 0;

        if (expectedValue === currentCard.hiLoVal) {
            score++;
            runningCount += currentCard.hiLoVal; 
            playSound(correctSound);
            displayMessage("Correct!", "correct");
            
            if (score > highScore) {
                highScore = score;
                saveHighScoreForCurrentLevel();
            }
            updateScoreboardVisuals();
            updateAllCountVisuals(); // Update RC, TC, and Deck Info
            dealNewCard(); 
        } else {
            playSound(wrongSound);
            // Game over for this "hand/round", but the shoe continues unless it's empty or needs shuffle
            // For this trainer, a wrong guess still means "game over" for the current attempt.
            // The running count is preserved until a new shoe is explicitly started (by pressing button when game is not active)
            // or settings are changed.
            gameOver(`Wrong guess! Expected ${currentCard.hiLoVal > 0 ? '+' : ''}${currentCard.hiLoVal} for ${currentCard.label}${currentCard.suit}. RC: ${runningCount}`);
        }
    }

    function dealNewCard() {
        console.log("SCRIPT DEBUG: dealNewCard called");
        if (!gameActive) return;

        // Check if shuffle is needed
        if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) {
            displayMessage(`Shuffle time! Penetration: ${((cardsDealtInShoe/totalCardsInShoe)*100).toFixed(0)}%. Starting new shoe.`, "info");
            // A short delay before auto-restarting allows user to see message
            setTimeout(() => {
                startNewGame(); // This will build a new shoe and reset counts
            }, 2000); // 2-second delay
            return;
        }

        currentCard = gameShoe.pop(); // Deal from the end of the array
        cardsDealtInShoe++;
        console.log("SCRIPT DEBUG: Card dealt from shoe. Cards remaining in shoe:", gameShoe.length);
        
        updateAllCountVisuals(); // Update TC and Deck Info as a card is dealt
        animateCardFlip();
    }
    
    function updateAllCountVisuals() {
        // Update Running Count Display
        runningCountDisplayEl.textContent = `Running Count: ${runningCount}`;

        // Calculate and Update True Count & Deck Info
        const decksRemaining = (totalCardsInShoe - cardsDealtInShoe) / 52;
        
        if (decksRemaining > 0.25) { // Avoid extreme true counts with very few cards left, or division by zero
            trueCount = runningCount / decksRemaining;
        } else if (totalCardsInShoe > 0 && decksRemaining <= 0.25 && decksRemaining > 0) { // Still some cards but less than 1/4 deck
             trueCount = runningCount / decksRemaining; // Could be very volatile, but calculate
        }
        else {
            trueCount = 0; // Or indicate N/A if no decks left or at start
        }
        
        trueCountDisplayEl.textContent = `True Count: ${trueCount.toFixed(1)}`; // Display TC to one decimal
        deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`;
        console.log(`SCRIPT DEBUG: Counts updated - RC: ${runningCount}, TC: ${trueCount.toFixed(1)}, Decks Left: ${decksRemaining.toFixed(1)}`);
    }


    function animateCardFlip() {
        if (!gameActive) return; 

        if (cardContainerEl.classList.contains('flipping')) { 
            cardContainerEl.classList.remove('flipping'); 
            setTimeout(updateCardFaceAndFlipToFront, 350); 
        } else { 
            updateCardFaceAndFlipToFront();
        }
    }

    function updateCardFaceAndFlipToFront() {
        console.log("SCRIPT DEBUG: updateCardFaceAndFlipToFront called"); 
        if (!currentCard) {
            console.error("SCRIPT DEBUG: currentCard is null or undefined in updateCardFaceAndFlipToFront. Aborting flip.");
            // This can happen if a shuffle was triggered and dealNewCard returned early
            if (gameActive) { // If game is supposed to be active, try to deal another card
                 // displayMessage("Preparing next card after shuffle...", "info"); // This might be too quick
            }
            return;
        }
        console.log("SCRIPT DEBUG: Current card:", JSON.parse(JSON.stringify(currentCard))); 

        cardFrontEl.textContent = currentCard.label + currentCard.suit;
        console.log("SCRIPT DEBUG: Card front text set to:", cardFrontEl.textContent); 

        cardFrontEl.className = 'card-face card-front'; 
        cardFrontEl.classList.add(currentCard.color);   

        setTimeout(() => {
            console.log("SCRIPT DEBUG: Attempting to add 'flipping' class to cardContainerEl"); 
            if (!cardContainerEl) {
                console.error("SCRIPT DEBUG: cardContainerEl is null! Cannot add class.");
                return;
            }
            cardContainerEl.classList.add('flipping'); 
            if (cardContainerEl.classList.contains('flipping')) {
                console.log("SCRIPT DEBUG: 'flipping' class successfully ADDED to cardContainerEl."); 
            } else {
                console.error("SCRIPT DEBUG: 'flipping' class FAILED to add to cardContainerEl.");
            }
            startRoundTimer();
        }, 50); 
    }

    function startRoundTimer() {
        if (!gameActive) return;
        clearInterval(gameTimer);
        const currentLevel = levelSelectEl.value;

        if (currentLevel === "practice") {
            timerDisplayEl.textContent = "Time: ∞";
            return;
        }

        timeLeft = levelTimes[currentLevel];
        timerDisplayEl.textContent = `Time: ${timeLeft}s`;

        gameTimer = setInterval(() => {
            timeLeft--;
            timerDisplayEl.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(gameTimer);
                playSound(wrongSound);
                // A "Time's up" still uses the current shoe's running count.
                gameOver(`Time's up! RC: ${runningCount}`);
            }
        }, 1000);
    }

    function gameOver(reason) {
        clearInterval(gameTimer);
        gameActive = false; 
        // The 'reason' should already include the running count or other context.
        displayMessage(`${reason}. Score: ${score}. Click a value to play again with this shoe, or change settings for a new shoe.`, "wrong");
        // Note: Score and runningCount are NOT reset here. They persist for the current shoe.
        // They are reset in startNewGame (for RC when shoe changes) or setupInitialScreen (for score when settings change).
    }

    function updateScoreboardVisuals() {
        scoreEl.textContent = score;
        highscoreEl.textContent = highScore;
    }

    // updateRunningCountVisuals is now part of updateAllCountVisuals

    function displayMessage(msg, typeClass) {
        messageDisplayEl.textContent = msg;
        messageDisplayEl.className = ''; 
        messageDisplayEl.classList.add('message-display'); 
        if (typeClass) {
            messageDisplayEl.classList.add(`message-${typeClass}`);
        }
    }

    function playSound(soundElement) {
        if (soundElement && typeof soundElement.play === 'function') { 
            soundElement.currentTime = 0; 
            soundElement.play().catch(error => console.warn(`Sound play failed for ${soundElement.id || 'unknown sound'}: ${error.message}`));
        } else {
            console.warn("Attempted to play an invalid sound element.");
        }
    }

    function toggleMusic() {
        musicOn = !musicOn;
        if (musicOn) {
            if (bgMusic && typeof bgMusic.play === 'function') {
                bgMusic.play().catch(error => console.warn(`Music play failed: ${error.message}`));
            }
        } else {
            if (bgMusic && typeof bgMusic.pause === 'function') {
                bgMusic.pause();
            }
        }
        updateMusicButtonVisuals();
    }
    
    function updateMusicButtonVisuals() {
        musicToggleBtn.textContent = musicOn ? "Music ON" : "Music OFF";
        musicToggleBtn.classList.toggle('on', musicOn);
    }

    function saveHighScoreForCurrentLevel() {
        try {
            const currentLevel = levelSelectEl.value; // High score is per level
            localStorage.setItem(`cardCounterHighScore_${currentLevel}`, highScore.toString());
        } catch (e) {
            console.warn("Could not save high score to localStorage:", e.message);
        }
    }

    function loadHighScoreForCurrentLevel() {
        try {
            const currentLevel = levelSelectEl.value;
            const savedScore = localStorage.getItem(`cardCounterHighScore_${currentLevel}`);
            highScore = parseInt(savedScore) || 0;
        } catch (e) {
            console.warn("Could not load high score from localStorage:", e.message);
            highScore = 0;
        }
    }

    // Start the application
    initializeApp();
});
