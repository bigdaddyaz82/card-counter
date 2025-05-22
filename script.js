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
            // The first click starts the game but isn't processed as a guess.
            // User needs to click again for the first card.
            // Or, if we want the first click to count:
            // processGuess(choice); // (but currentCard would be from dealNewCard in startNewGame)
            // For simplicity, let's make the first click just start.
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
        if (!currentCard) return;

        let expectedValue;
        if (userChoice === 'plus') expectedValue = 1;
        else if (userChoice === 'minus') expectedValue = -1;
        else expectedValue = 0;

        if (expectedValue === currentCard.hiLoVal) {
            score++;
            runningCount += currentCard.hiLoVal; // Update running count based on the card's actual Hi-Lo value
            playSound(correctSound);
            displayMessage("Correct!", "correct");
            
            if (score > highScore) {
                highScore = score;
                saveHighScoreForCurrentLevel();
            }
            updateScoreboardVisuals();
            updateRunningCountVisuals();
            dealNewCard();
        } else {
            playSound(wrongSound);
            gameOver("Wrong guess!");
        }
    }

    function dealNewCard() {
        currentCard = fullDeck[Math.floor(Math.random() * fullDeck.length)];
        animateCardFlip();
    }

    function animateCardFlip() {
        if (cardContainerEl.classList.contains('flipping')) { // If front is showing
            cardContainerEl.classList.remove('flipping'); // Flip to back
            setTimeout(updateCardFaceAndFlipToFront, 350); // Half of 0.7s transition
        } else { // If back is showing (or initial)
            updateCardFaceAndFlipToFront();
        }
    }

    function updateCardFaceAndFlipToFront() {
        cardFrontEl.textContent = currentCard.label + currentCard.suit;
        cardFrontEl.className = 'card-face card-front'; // Reset classes
        cardFrontEl.classList.add(currentCard.color);   // Add suit color

        // Short delay to ensure content is set before flip animation starts
        setTimeout(() => {
            cardContainerEl.classList.add('flipping'); // Flip to show front
            startRoundTimer();
        }, 50);
    }

    function startRoundTimer() {
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
        gameActive = false;
        displayMessage(`${reason} Final Score: ${score}. Running Count: ${runningCount}. Click a value to play again.`, "wrong");
        // Score and running count are kept for display until a new game starts.
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
        messageDisplayEl.className = `message-${typeClass}`;
    }

    function playSound(soundElement) {
        soundElement.currentTime = 0; // Rewind to start
        soundElement.play().catch(error => console.warn(`Sound play failed: ${error.message}`));
    }

    function toggleMusic() {
        musicOn = !musicOn;
        if (musicOn) {
            bgMusic.play().catch(error => console.warn(`Music play failed: ${error.message}`));
        } else {
            bgMusic.pause();
        }
        updateMusicButtonVisuals();
    }
    
    function updateMusicButtonVisuals() {
        musicToggleBtn.textContent = musicOn ? "Music ON" : "Music OFF";
        musicToggleBtn.classList.toggle('on', musicOn);
    }

    function saveHighScoreForCurrentLevel() {
        const currentLevel = levelSelectEl.value;
        localStorage.setItem(`cardCounterHighScore_${currentLevel}`, highScore.toString());
    }

    function loadHighScoreForCurrentLevel() {
        const currentLevel = levelSelectEl.value;
        highScore = parseInt(localStorage.getItem(`cardCounterHighScore_${currentLevel}`)) || 0;
        // Visual update is handled by updateScoreboardVisuals() after this call
    }

    // Start the application
    initializeApp();
});
