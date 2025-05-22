document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Existing
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
    const deckSizeEl = document.getElementById('deckSize');
    const trueCountDisplayEl = document.getElementById('trueCountDisplay');
    const deckInfoDisplayEl = document.getElementById('deckInfoDisplay');

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

    // Sounds
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const bgMusic = document.getElementById('bgMusic');

    // Card data (Hi-Lo system) - Blueprint for a single deck
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

    // Game State Variables - Existing
    let currentCard = null;
    let score = 0;
    let runningCount = 0;
    let highScore = 0;
    let gameTimer = null;
    let timeLeft = 0; // This will now be primarily controlled by cardSpeedInputEl
    let gameActive = false;
    let musicOn = false;
    let gameShoe = [];
    let cardsDealtInShoe = 0;
    let totalCardsInShoe = 0;
    let trueCount = 0;
    const SHUFFLE_PENETRATION = 0.75;

    // Game State Variables - NEW Features
    let currentCardSpeed = parseFloat(localStorage.getItem('cardCounterSpeed')) || 5; // Default speed, overridden by level or input
    let sessionCorrectGuesses = 0;
    let sessionTotalCardsDealt = 0; // For accuracy
    let gamePausedForBetting = false;
    const CARDS_BETWEEN_BETS = 10; // Trigger betting practice every X correct cards

    const levelDefaultTimes = { practice: 600, beginner: 15, advanced: 10, expert: 5 }; // Practice effectively infinite with large num

    function initializeApp() {
        levelSelectEl.addEventListener('change', handleGameSettingChange);
        deckSizeEl.addEventListener('change', handleGameSettingChange);
        musicToggleBtn.addEventListener('click', toggleMusic);
        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
        });
        
        // NEW Feature Initializations
        setupCardSpeedControl();
        setupHowToPlayModal();
        setupBettingPracticeControls();
        
        bgMusic.volume = 0.2;
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
        sessionCorrectGuesses = 0; // Reset accuracy stats
        sessionTotalCardsDealt = 0;
        
        updateCardSpeedInputFromLevel(); // Set card speed based on current level
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateAllCountVisuals();
        updateAccuracyDisplay(); // Update accuracy display
        
        displayMessage("Select settings. Click a value to start!", "info");
        
        cardContainerEl.classList.remove('flipping');
        cardBackEl.textContent = '?';
        cardFrontEl.textContent = '';
        
        updateTimerDisplayVisuals();
        bettingPracticeSectionEl.style.display = 'none'; // Hide betting section
    }

    function handleGameSettingChange() {
        console.log("SCRIPT DEBUG: Game setting changed (level or deck size)");
        updateCardSpeedInputFromLevel(); // Update speed input if level changed
        setupInitialScreen(); 
    }

    // --- Card Speed Control ---
    function setupCardSpeedControl() {
        cardSpeedInputEl.value = currentCardSpeed;
        cardSpeedInputEl.addEventListener('change', () => {
            currentCardSpeed = parseFloat(cardSpeedInputEl.value);
            if (isNaN(currentCardSpeed) || currentCardSpeed < 0.5) currentCardSpeed = 0.5;
            if (currentCardSpeed > 600) currentCardSpeed = 600; // Max practical limit
            cardSpeedInputEl.value = currentCardSpeed; // Reflect validated value
            localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString());
            if (!gameActive) { // If game not active, update timer display to reflect new speed
                updateTimerDisplayVisuals();
            }
            // If game is active, the new speed will apply to the next round timer
        });
        updateCardSpeedInputFromLevel(); // Initialize
    }
    
    function updateCardSpeedInputFromLevel() {
        const currentLevel = levelSelectEl.value;
        currentCardSpeed = levelDefaultTimes[currentLevel];
        cardSpeedInputEl.value = currentCardSpeed;
        localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); // Save initial level speed
        if (!gameActive) updateTimerDisplayVisuals();
    }

    function updateTimerDisplayVisuals() {
        const isPractice = levelSelectEl.value === "practice";
        if (isPractice) {
            timerDisplayEl.textContent = "Time: ∞";
        } else {
            timerDisplayEl.textContent = `Time: ${cardSpeedInputEl.value}s`;
        }
    }

    // --- How to Play Modal ---
    function setupHowToPlayModal() {
        howToPlayButtonEl.addEventListener('click', () => {
            howToPlayModalEl.style.display = 'flex';
        });
        closeHowToPlayModalButtonEl.addEventListener('click', () => {
            howToPlayModalEl.style.display = 'none';
        });
        window.addEventListener('click', (event) => { // Close if clicked outside
            if (event.target === howToPlayModalEl) {
                howToPlayModalEl.style.display = 'none';
            }
        });
    }

    // --- Betting Practice ---
    function setupBettingPracticeControls() {
        betMinButtonEl.addEventListener('click', () => handleBetChoiceInput('min'));
        betMidButtonEl.addEventListener('click', () => handleBetChoiceInput('mid'));
        betMaxButtonEl.addEventListener('click', () => handleBetChoiceInput('max'));
        continueDealingButtonEl.addEventListener('click', resumeAfterBettingPractice);
    }

    function triggerBettingPractice() {
        if (levelSelectEl.value === "practice") { // Don't interrupt pure practice flow with betting
            dealNewCard(); // Proceed to next card
            return;
        }
        gamePausedForBetting = true;
        clearInterval(gameTimer); // Stop the guess timer
        bettingPracticeSectionEl.style.display = 'block';
        bettingTrueCountDisplayEl.textContent = trueCount.toFixed(1);
        bettingFeedbackEl.textContent = "";
        bettingFeedbackEl.className = ''; // Clear feedback classes
        continueDealingButtonEl.style.display = 'none';
        actionButtons.forEach(btn => btn.disabled = true); // Disable +/-/0 buttons
    }

    function handleBetChoiceInput(betChoice) {
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
            bettingFeedbackEl.className = 'message-info'; // Or 'message-wrong' if you prefer harsher feedback
        }
        bettingFeedbackEl.textContent = feedbackMsg;
        continueDealingButtonEl.style.display = 'inline-block';
    }

    function resumeAfterBettingPractice() {
        gamePausedForBetting = false;
        bettingPracticeSectionEl.style.display = 'none';
        betMinButtonEl.disabled = false;
        betMidButtonEl.disabled = false;
        betMaxButtonEl.disabled = false;
        actionButtons.forEach(btn => btn.disabled = false);
        dealNewCard(); // Proceed to deal the next card
    }
    
    // --- Accuracy Stats ---
    function updateAccuracyDisplay() {
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
        const numDecks = parseInt(deckSizeEl.value);
        gameShoe = [];
        for (let i = 0; i < numDecks; i++) {
            gameShoe.push(...JSON.parse(JSON.stringify(singleMasterDeck))); // Deep copy
        }
        totalCardsInShoe = gameShoe.length;
        cardsDealtInShoe = 0;
        
        for (let i = gameShoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]];
        }
        console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards from ${numDecks} deck(s).`);
    }

    function handleUserChoice(choice) {
        if (!gameActive && !gamePausedForBetting) { // Only start new game if not active AND not paused
            startNewGame(); 
            return; 
        }
        if (gameActive && !gamePausedForBetting) { // Only process guess if active and not paused
             processGuess(choice);
        }
    }
    
    function startNewGame() {
        console.log("SCRIPT DEBUG: startNewGame called");
        clearInterval(gameTimer);
        gameActive = true;
        gamePausedForBetting = false;
        score = 0;
        runningCount = 0;
        trueCount = 0;
        resetSessionStats(); // Reset accuracy for new shoe

        buildShoe();
        
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateAllCountVisuals();
        
        displayMessage("Shoe ready. Good luck!", "info");
        dealNewCard();
    }

    function processGuess(userChoice) {
        if (!currentCard || !gameActive || gamePausedForBetting) return;

        clearInterval(gameTimer); // Stop timer as soon as guess is made
        sessionTotalCardsDealt++; // For accuracy

        let expectedValue;
        if (userChoice === 'plus') expectedValue = 1;
        else if (userChoice === 'minus') expectedValue = -1;
        else expectedValue = 0;

        if (expectedValue === currentCard.hiLoVal) {
            score++;
            sessionCorrectGuesses++; // For accuracy
            runningCount += currentCard.hiLoVal; 
            playSound(correctSound);
            displayMessage("Correct!", "correct");
            
            if (score > highScore) {
                highScore = score;
                saveHighScoreForCurrentLevel();
            }
            updateScoreboardVisuals();
            updateAllCountVisuals(); // This updates TC using new RC
            updateAccuracyDisplay();

            // Check for betting practice trigger
            if (sessionCorrectGuesses > 0 && sessionCorrectGuesses % CARDS_BETWEEN_BETS === 0) {
                triggerBettingPractice(); // This will pause and then call dealNewCard via button
            } else {
                dealNewCard(); // Proceed to next card if not betting time
            }
        } else {
            playSound(wrongSound);
            updateAccuracyDisplay(); // Update accuracy even on wrong guess
            gameOver(`Wrong guess! Expected ${currentCard.hiLoVal > 0 ? '+' : ''}${currentCard.hiLoVal} for ${currentCard.label}${currentCard.suit}. RC: ${runningCount}`);
        }
    }

    function dealNewCard() {
        console.log("SCRIPT DEBUG: dealNewCard called");
        if (!gameActive || gamePausedForBetting) { // Do not deal if game not active or paused for betting
            console.log("SCRIPT DEBUG: DealNewCard aborted. gameActive:", gameActive, "gamePausedForBetting:", gamePausedForBetting);
            return;
        }

        if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) {
            displayMessage(`Shuffle time! Penetration: ${((cardsDealtInShoe/totalCardsInShoe)*100).toFixed(0)}%. Starting new shoe.`, "info");
            setTimeout(() => {
                if (gameActive) startNewGame(); // Only if still active (not reset by settings change)
            }, 2000);
            return;
        }

        currentCard = gameShoe.pop();
        cardsDealtInShoe++;
        console.log("SCRIPT DEBUG: Card dealt from shoe. Cards remaining:", gameShoe.length);
        
        // True count and deck info should reflect state BEFORE this card is revealed/counted
        // But for display purposes, it's fine to update after popping.
        // The critical part is that True Count for betting practice uses the updated RC.
        updateAllCountVisuals(); 
        animateCardFlip(); // This will eventually call startRoundTimer
    }
    
    function updateAllCountVisuals() {
        runningCountDisplayEl.textContent = `Running Count: ${runningCount}`;
        const decksRemaining = Math.max(0, (totalCardsInShoe - cardsDealtInShoe) / 52);
        
        if (decksRemaining > 0.25) {
            trueCount = runningCount / decksRemaining;
        } else if (totalCardsInShoe > 0 && decksRemaining <= 0.25 && decksRemaining > 0) {
             trueCount = runningCount / decksRemaining;
        } else {
            trueCount = (runningCount > 0) ? Infinity : (runningCount < 0 ? -Infinity : 0); // Handle near end of shoe
        }
        
        trueCountDisplayEl.textContent = `True Count: ${isFinite(trueCount) ? trueCount.toFixed(1) : (trueCount > 0 ? "High+" : "Low-")}`;
        deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`;
        console.log(`SCRIPT DEBUG: Counts updated - RC: ${runningCount}, TC: ${trueCount.toFixed(1)}, Decks Left: ${decksRemaining.toFixed(1)}`);
    }


    function animateCardFlip() {
        if (!gameActive || gamePausedForBetting) return; 

        if (cardContainerEl.classList.contains('flipping')) { 
            cardContainerEl.classList.remove('flipping'); 
            // Add a slight delay for the flip-back animation to be perceived if rapidly re-dealing
            setTimeout(updateCardFaceAndFlipToFront, 50); // Reduced from 350 for snappier feel
        } else { 
            updateCardFaceAndFlipToFront();
        }
    }

    function updateCardFaceAndFlipToFront() {
        console.log("SCRIPT DEBUG: updateCardFaceAndFlipToFront called"); 
        if (!currentCard) {
            console.error("SCRIPT DEBUG: currentCard is null in updateCardFaceAndFlipToFront.");
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
            startRoundTimer(); // Start timer after card is shown
        }, 50); 
    }

    function startRoundTimer() {
        if (!gameActive || gamePausedForBetting) return;
        clearInterval(gameTimer);
        
        const isPractice = levelSelectEl.value === "practice";
        if (isPractice || currentCardSpeed >= 600) { // Treat very high speed as infinite for timer
            timerDisplayEl.textContent = "Time: ∞";
            return; // No timer for practice or effectively infinite time
        }

        timeLeft = currentCardSpeed; // Use the speed from the input
        timerDisplayEl.textContent = `Time: ${timeLeft}s`;

        gameTimer = setInterval(() => {
            if (gamePausedForBetting) { // Check again in case betting practice started during timer
                clearInterval(gameTimer);
                return;
            }
            timeLeft--;
            timerDisplayEl.textContent = `Time: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(gameTimer);
                playSound(wrongSound);
                sessionTotalCardsDealt++; // Count this as an attempt for accuracy
                updateAccuracyDisplay();
                gameOver(`Time's up! RC: ${runningCount}`);
            }
        }, 1000);
    }

    function gameOver(reason) {
        clearInterval(gameTimer);
        gameActive = false; 
        displayMessage(`${reason}. Score: ${score}. Click a value to play again with this shoe, or change settings for a new shoe.`, "wrong");
        // bettingPracticeSectionEl.style.display = 'none'; // Ensure betting is hidden
        // gamePausedForBetting = false; // Reset betting pause state
    }

    function updateScoreboardVisuals() {
        scoreEl.textContent = score;
        highscoreEl.textContent = highScore;
    }

    function displayMessage(msg, typeClass) {
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
            bgMusic.play().catch(error => console.warn(`Music play failed: ${error.message}`));
        } else {
            bgMusic.pause();
        }
        updateMusicButtonVisuals();
        localStorage.setItem('cardCounterMusicOn', musicOn.toString());
    }
    
    function updateMusicButtonVisuals() {
        musicToggleBtn.textContent = musicOn ? "Music ON" : "Music OFF";
        musicToggleBtn.classList.toggle('on', musicOn);
    }

    function saveHighScoreForCurrentLevel() {
        try {
            const currentLevel = levelSelectEl.value;
            localStorage.setItem(`cardCounterHighScore_${currentLevel}_${deckSizeEl.value}`, highScore.toString()); // Include deck size
        } catch (e) {
            console.warn("Could not save high score:", e.message);
        }
    }

    function loadHighScoreForCurrentLevel() {
        try {
            const currentLevel = levelSelectEl.value;
            const savedScore = localStorage.getItem(`cardCounterHighScore_${currentLevel}_${deckSizeEl.value}`);
            highScore = parseInt(savedScore) || 0;
        } catch (e) {
            console.warn("Could not load high score:", e.message);
            highScore = 0;
        }
    }
    
    function loadInitialSettings() {
        musicOn = localStorage.getItem('cardCounterMusicOn') === 'true';
        // Set initial card speed from localStorage if available, otherwise from level default
        const savedSpeed = localStorage.getItem('cardCounterSpeed');
        if (savedSpeed !== null) {
            currentCardSpeed = parseFloat(savedSpeed);
            cardSpeedInputEl.value = currentCardSpeed;
        } else {
            updateCardSpeedInputFromLevel(); // Sets from level default
        }
        // Apply music state
        if (musicOn) bgMusic.play().catch(e => console.warn("Autoplay music failed:",e.message)); // try to play if was on
        updateMusicButtonVisuals();
    }

    // Start the application
    loadInitialSettings(); // Load saved settings first
    initializeApp(); // Then initialize rest of app logic
});
