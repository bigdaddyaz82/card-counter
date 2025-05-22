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

    // Sounds
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const bgMusic = document.getElementById('bgMusic');

    // Card data (Hi-Lo system)
    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const fullDeck = [];
    values.forEach(value => {
        suits.forEach(suit => {
            let hiLoValue;
            if (['2', '3', '4', '5', '6'].includes(value)) hiLoValue = 1;
            else if (['7', '8', '9'].includes(value)) hiLoValue = 0;
            else hiLoValue = -1; // 10, J, Q, K, A
            fullDeck.push({
                label: value,
                suit: suit,
                hiLoVal: hiLoValue,
                color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
            });
        });
    });

    let currentCard = null;
    let score = 0;
    let runningCount = 0;
    let highScore = 0;
    
    let gameTimer = null;
    let timeLeft = 0;
    let gameActive = false;
    let musicOn = false;

    const levelTimes = { practice: 0, beginner: 15, advanced: 10, expert: 5 };

    function initializeApp() {
        levelSelectEl.addEventListener('change', handleLevelChange);
        musicToggleBtn.addEventListener('click', toggleMusic);
        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
        });
        
        bgMusic.volume = 0.2; // Quieter background music
        updateMusicButtonVisuals();
        setupInitialScreen();
    }

    function setupInitialScreen() {
        clearInterval(gameTimer);
        gameActive = false;
        score = 0;
        runningCount = 0;
        
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateRunningCountVisuals();
        
        displayMessage("Select level. Click a value (+1, 0, -1) to start!", "info");
        
        cardContainerEl.classList.remove('flipping'); // Show card back
        cardBackEl.textContent = '?';
        cardFrontEl.textContent = '';
        
        const currentLevel = levelSelectEl.value;
        timerDisplayEl.textContent = (currentLevel === "practice") ? "Time: ∞" : `Time: ${levelTimes[currentLevel]}s`;
    }

    function handleLevelChange() {
        setupInitialScreen(); // Reset everything for the new level
    }

    function handleUserChoice(choice) {
        if (!gameActive) {
            startNewGame();
            // The first click starts the game. Subsequent logic in processGuess handles guesses.
            return; 
        }
        processGuess(choice);
    }
    
    function startNewGame() {
        clearInterval(gameTimer);
        gameActive = true;
        score = 0;
        runningCount = 0; // Reset running count for each new game

        loadHighScoreForCurrentLevel(); // Ensure high score for the current level is displayed
        updateScoreboardVisuals();
        updateRunningCountVisuals();
        
        displayMessage("Game started. Good luck!", "info");
        dealNewCard();
    }

    function processGuess(userChoice) {
        if (!currentCard || !gameActive) return; // Added !gameActive check for safety

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
            updateRunningCountVisuals();
            dealNewCard(); // Deal next card immediately on correct guess
        } else {
            playSound(wrongSound);
            gameOver(`Wrong guess! Expected ${currentCard.hiLoVal > 0 ? '+' : ''}${currentCard.hiLoVal} for ${currentCard.label}${currentCard.suit}.`);
        }
    }

    function dealNewCard() {
        if (!gameActive) return; // Don't deal if game is not active
        currentCard = fullDeck[Math.floor(Math.random() * fullDeck.length)];
        animateCardFlip();
    }

    function animateCardFlip() {
        if (!gameActive) return; // Safety check

        if (cardContainerEl.classList.contains('flipping')) { // If front is showing (for subsequent cards after a correct guess)
            cardContainerEl.classList.remove('flipping'); // Flip to back first
            // Wait for the flip-to-back animation to mostly complete before updating content and flipping back to front
            setTimeout(updateCardFaceAndFlipToFront, 350); // Assumes your CSS flip transition is around 0.6s-0.7s
        } else { // If back is showing (or initial card of the game)
            updateCardFaceAndFlipToFront();
        }
    }

    function updateCardFaceAndFlipToFront() {
        // --- START OF ADDED CONSOLE LOGS ---
        console.log("SCRIPT DEBUG: updateCardFaceAndFlipToFront called"); 
        if (!currentCard) {
            console.error("SCRIPT DEBUG: currentCard is null or undefined in updateCardFaceAndFlipToFront. Aborting flip.");
            return;
        }
        console.log("SCRIPT DEBUG: Current card:", JSON.parse(JSON.stringify(currentCard))); // Deep copy for logging
        // --- END OF ADDED CONSOLE LOGS ---

        cardFrontEl.textContent = currentCard.label + currentCard.suit;
        // --- ADDED CONSOLE LOG ---
        console.log("SCRIPT DEBUG: Card front text set to:", cardFrontEl.textContent); 
        // --- END OF ADDED CONSOLE LOG ---

        cardFrontEl.className = 'card-face card-front'; // Reset classes
        cardFrontEl.classList.add(currentCard.color);   // Add suit color

        // Short delay to ensure content is set before flip animation starts
        setTimeout(() => {
            // --- ADDED CONSOLE LOGS ---
            console.log("SCRIPT DEBUG: Attempting to add 'flipping' class to cardContainerEl"); 
            if (!cardContainerEl) {
                console.error("SCRIPT DEBUG: cardContainerEl is null! Cannot add class.");
                return;
            }
            // --- END OF ADDED CONSOLE LOGS ---
            cardContainerEl.classList.add('flipping'); 
            // --- ADDED CONSOLE LOGS ---
            if (cardContainerEl.classList.contains('flipping')) {
                console.log("SCRIPT DEBUG: 'flipping' class successfully ADDED to cardContainerEl."); 
            } else {
                console.error("SCRIPT DEBUG: 'flipping' class FAILED to add to cardContainerEl.");
            }
            // --- END OF ADDED CONSOLE LOGS ---
            startRoundTimer();
        }, 50); // 50ms delay
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
                gameOver("Time's up!");
            }
        }, 1000);
    }

    function gameOver(reason) {
        clearInterval(gameTimer);
        gameActive = false; // Set game to inactive
        displayMessage(`${reason} Final Score: ${score}. Running Count: ${runningCount}. Click a value to play again.`, "wrong");
        // Do not flip card back here, let it show the card that caused the game over.
        // setupInitialScreen() will be called if user starts a new game or changes level.
    }

    function updateScoreboardVisuals() {
        scoreEl.textContent = score;
        highscoreEl.textContent = highScore;
    }

    function updateRunningCountVisuals() {
        runningCountDisplayEl.textContent = `Running Count: ${runningCount}`;
    }

    function displayMessage(msg, typeClass) {
        messageDisplayEl.textContent = msg;
        messageDisplayEl.className = ''; // Clear existing classes
        messageDisplayEl.classList.add('message-display'); // Base class if you have one
        if (typeClass) {
            messageDisplayEl.classList.add(`message-${typeClass}`);
        }
    }

    function playSound(soundElement) {
        if (soundElement && typeof soundElement.play === 'function') { // Check if it's a valid audio element
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
            const currentLevel = levelSelectEl.value;
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
