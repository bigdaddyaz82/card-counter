document.addEventListener('DOMContentLoaded', () => {
    console.log("SCRIPT DEBUG: DOMContentLoaded event fired. Initializing script.");
    // =========================================================================
    // 0. DOM ELEMENTS
    // =========================================================================
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
    const newShoeButtonEl = document.getElementById('newShoeButton');

    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIconEl = document.getElementById('themeIcon');
    const bodyEl = document.body;

    const countingSystemSelectEl = document.getElementById('countingSystem');
    const basicStrategyButtonEl = document.getElementById('basicStrategyButton');
    const basicStrategyModalEl = document.getElementById('basicStrategyModal');
    const closeBasicStrategyModalButtonEl = document.getElementById('closeBasicStrategyModalButton');
    const basicStrategyChartContainerEl = document.getElementById('basicStrategyChartContainer');
    const howToPlayContentEl = document.getElementById('howToPlayContent');
    const currentSystemDisplayEl = document.getElementById('currentSystemDisplay'); 
    const currentSystemValuesDisplayEl = document.getElementById('currentSystemValuesDisplay'); 

    // const gameModeSelectEl = document.getElementById('gameMode'); // REMOVED
    const mainGameAreaEl = document.getElementById('mainGameArea');

    // =========================================================================
    // 1. SOUNDS & ASSETS
    // =========================================================================
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const bgMusic = document.getElementById('bgMusic');

    if (correctSound) correctSound.volume = 0.3;
    if (wrongSound) wrongSound.volume = 0.3;
    if (bgMusic) bgMusic.volume = 0.15;

    const sunIcon = '☀️'; 
    const moonIcon = '🌙'; 

    // =========================================================================
    // 2. CARD DATA & COUNTING SYSTEMS
    // =========================================================================
    const suits = ['♥', '♦', '♣', '♠'];
    const cardLabels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const cardBaseValues = { '2':'2', '3':'3', '4':'4', '5':'5', '6':'6', '7':'7', '8':'8', '9':'9', '10':'10', 'J':'10', 'Q':'10', 'K':'10', 'A':'A'};
    const countingSystemsData = {
        'hi-lo': { name: 'Hi-Lo', values: { '2':1, '3':1, '4':1, '5':1, '6':1, '7':0, '8':0, '9':0, '10':-1, 'A':-1 }, description: "Cards 2-6 are +1. Cards 7-9 are 0. Cards 10, J, Q, K, A are -1.", howToPlay: `<p><strong>Hi-Lo Values:</strong></p><ul><li>Cards 2-6: <strong>+1</strong></li><li>Cards 7-9: <strong>0</strong></li><li>Cards 10, Jack, Queen, King, Ace: <strong>-1</strong></li></ul><p><strong>Running Count (RC):</strong> Start at 0. For each card, add its Hi-Lo value to the RC.</p><p><strong>True Count (TC):</strong> RC ÷ Decks Remaining. This is a more accurate measure of advantage.</p><p><strong>Basic Betting Strategy (using True Count):</strong></p><ul><li>TC < +1: Bet small (table minimum).</li><li>TC +1 to +2: Consider a moderate bet.</li><li>TC ≥ +3: Bet larger!</li></ul>` },
        'ko': { name: 'KO (Rookie)', values: { '2':1, '3':1, '4':1, '5':1, '6':1, '7':1, '8':0, '9':0, '10':-1, 'A':-1 }, description: "Cards 2-7 are +1. Cards 8-9 are 0. Cards 10, J, Q, K, A are -1.", howToPlay: `<p><strong>KO (Knock-Out) Values:</strong></p><ul><li>Cards 2, 3, 4, 5, 6, 7: <strong>+1</strong></li><li>Cards 8, 9: <strong>0</strong></li><li>Cards 10, Jack, Queen, King, Ace: <strong>-1</strong></li></ul><p>KO is an unbalanced system. The Running Count (RC) is the primary focus.</p><p><strong>Initial Running Count (IRC):</strong> Start at 0 for a single deck. For multiple decks, start at -4 * (Number of Decks - 1). Example: For 6 decks, IRC = -4 * 5 = -20. (This app starts RC at 0 for simplicity in training initial card values, adjust your mental IRC accordingly if simulating full KO strategy).</p><p><strong>Key Count / Pivot Point:</strong> A common pivot point for KO Rookie is +2. When the RC reaches or exceeds this key count, it's generally time to increase your bets.</p><p>True Count is not typically used with KO Rookie.</p>` }
    };
    let currentCountingSystem = 'hi-lo';

    // =========================================================================
    // 3. GAME STATE VARIABLES
    // =========================================================================
    let currentCard = null, score = 0, runningCount = 0, highScore = 0, gameTimer = null, timeLeft = 0, gameActive = false;
    let musicOn = false;
    let gameShoe = [], cardsDealtInShoe = 0, totalCardsInShoe = 0, trueCount = 0;
    const SHUFFLE_PENETRATION = 0.75;
    let currentCardSpeed = 5;
    let sessionCorrectGuesses = 0, sessionTotalCardsDealt = 0, gamePausedForBetting = false;
    const CARDS_BETWEEN_BETS = 10; 
    const levelDefaultTimes = { practice: 600, beginner: 15, advanced: 10, expert: 5 };
    // let currentGameMode = 'guessValue'; // No longer strictly needed as it's the only mode

    // =========================================================================
    // 4. INITIALIZATION & SETUP
    // =========================================================================
    function initializeApp() {
        console.log("SCRIPT DEBUG: initializeApp() called.");
        if (levelSelectEl) levelSelectEl.addEventListener('change', handleGameSettingChange);
        if (deckSizeEl) deckSizeEl.addEventListener('change', handleGameSettingChange);
        if (countingSystemSelectEl) countingSystemSelectEl.addEventListener('change', handleGameSystemChange);
        // if (gameModeSelectEl) gameModeSelectEl.addEventListener('change', handleGameModeChange); // REMOVED

        if (musicToggleBtn) {
            musicToggleBtn.addEventListener('click', toggleMusic);
        } else {
            console.warn("Music toggle button not found!");
        }

        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
        });
        if (newShoeButtonEl) {
            newShoeButtonEl.addEventListener('click', startNewGame);
        }

        setupThemeToggle();
        setupCardSpeedControl();
        setupHowToPlayModal();
        setupBasicStrategyModal();
        setupBettingPracticeControls(); 
        
        updateCurrentSystemDisplay();
        setupInitialScreen();
        console.log("SCRIPT DEBUG: initializeApp() finished.");
    }

    function setupInitialScreen() {
        console.log("SCRIPT DEBUG: setupInitialScreen called");
        clearInterval(gameTimer); 
        gameActive = false; 
        gamePausedForBetting = false;
        score = 0; runningCount = 0; trueCount = 0; cardsDealtInShoe = 0;
        sessionCorrectGuesses = 0; sessionTotalCardsDealt = 0;
        
        if(levelSelectEl) updateCardSpeedInputFromLevel();
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateAllCountVisuals();
        updateAccuracyDisplay();
        updateMusicButtonVisuals();
        
        displayMessage("Select settings and click 'New Shoe / Start Game' or a card value button to begin!", "info");
        
        if (cardContainerEl) cardContainerEl.classList.remove('flipping');
        if (cardBackEl) cardBackEl.textContent = '?';
        if (cardFrontEl) cardFrontEl.textContent = '';
        
        updateTimerDisplayVisuals();
        if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none';
        if (continueDealingButtonEl) continueDealingButtonEl.style.display = 'none'; 
        if (bettingFeedbackEl) bettingFeedbackEl.classList.remove('visible'); 

        if (mainGameAreaEl) mainGameAreaEl.style.display = 'block'; // Ensure main area is visible
    }

    function handleGameSettingChange() { console.log("SCRIPT DEBUG: Game setting changed"); updateCardSpeedInputFromLevel(); setupInitialScreen(); }
    function handleGameSystemChange() { currentCountingSystem = countingSystemSelectEl.value; console.log("SCRIPT DEBUG: Counting system changed to:", currentCountingSystem); updateCurrentSystemDisplay(); updateHowToPlayModalContent(); setupInitialScreen(); }
    // handleGameModeChange function REMOVED
    // switchGameModeView function REMOVED

    // =========================================================================
    // 5. THEME TOGGLE (Light/Dark Mode) - NO CHANGES
    // =========================================================================
    function applyTheme(theme) { /* ... */ }
    function loadInitialTheme() { /* ... */ }
    function setupThemeToggle() { /* ... */ }

    // =========================================================================
    // 6. CARD SPEED & TIMER - MODIFIED startRoundTimer
    // =========================================================================
    function setupCardSpeedControl() { /* ... */ }
    function updateCardSpeedInputFromLevel() { /* ... */ }
    function updateTimerDisplayVisuals() { /* ... */ }

    function startRoundTimer() {
        if (!gameActive || gamePausedForBetting) return; // Removed currentGameMode check
        clearInterval(gameTimer);
        const isPractice = levelSelectEl && levelSelectEl.value === "practice";
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
                if (currentCard) { // Ensure currentCard exists before accessing its properties
                    runningCount += currentCard.pointVal; 
                    displayMessage(`Time's up for card ${currentCard.label}${currentCard.suit} (${currentCard.pointVal > 0 ? '+' : ''}${currentCard.pointVal}). Keep going!`, "wrong");
                } else {
                    displayMessage(`Time's up! Card info unavailable. Keep going!`, "wrong");
                }
                
                updateScoreboardVisuals(); 
                updateAllCountVisuals();
                updateAccuracyDisplay();
    
                if (sessionTotalCardsDealt > 0 && sessionTotalCardsDealt % CARDS_BETWEEN_BETS === 0 && (levelSelectEl && levelSelectEl.value !== "practice")) {
                    triggerBettingPractice();
                } else {
                    if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) {
                        const penetrationPercent = totalCardsInShoe > 0 ? ((cardsDealtInShoe / totalCardsInShoe) * 100).toFixed(0) : 0;
                        displayMessage(`Shuffle time! Penetration: ${penetrationPercent}%. Starting new shoe.`, "info");
                        setTimeout(() => {
                            if (gameActive) startNewGame(); // Removed currentGameMode check
                        }, 2000);
                    } else {
                        dealNewCard();
                    }
                }
            }
        }, 1000);
    }

    // =========================================================================
    // 7. HOW TO PLAY & BASIC STRATEGY MODALS - NO CHANGES
    // =========================================================================
    function setupHowToPlayModal() { /* ... */ }
    function updateHowToPlayModalContent() { /* ... */ }
    function setupBasicStrategyModal() { /* ... */ }
    const basicStrategyData = { /* ... */ };
    function generateBasicStrategyChartHTML() { /* ... */ }

    // =========================================================================
    // 8. BETTING PRACTICE - DEBUG LOGS KEPT
    // =========================================================================
    function setupBettingPracticeControls() {
        console.log("SCRIPT DEBUG: Setting up betting practice controls.");
        if (betMinButtonEl) {
            console.log("SCRIPT DEBUG: betMinButtonEl FOUND. Adding listener.");
            betMinButtonEl.addEventListener('click', () => {
                console.log("SCRIPT DEBUG: Min Bet button CLICKED."); 
                handleBetChoiceInput('min');
            });
        } else {
            console.warn("Min Bet button not found (betMinButtonEl is null).");
        }

        if (betMidButtonEl) {
            console.log("SCRIPT DEBUG: betMidButtonEl FOUND. Adding listener.");
            betMidButtonEl.addEventListener('click', () => {
                console.log("SCRIPT DEBUG: Mid Bet button CLICKED."); 
                handleBetChoiceInput('mid');
            });
        } else {
            console.warn("Mid Bet button not found (betMidButtonEl is null).");
        }

        if (betMaxButtonEl) {
            console.log("SCRIPT DEBUG: betMaxButtonEl FOUND. Adding listener.");
            betMaxButtonEl.addEventListener('click', () => {
                console.log("SCRIPT DEBUG: Max Bet button CLICKED."); 
                handleBetChoiceInput('max');
            });
        } else {
            console.warn("Max Bet button not found (betMaxButtonEl is null).");
        }

        if (continueDealingButtonEl) {
            console.log("SCRIPT DEBUG: continueDealingButtonEl FOUND. Adding listener.");
            continueDealingButtonEl.addEventListener('click', () => {
                console.log("SCRIPT DEBUG: Continue Dealing button CLICKED."); 
                resumeAfterBettingPractice();
            });
        } else {
            console.warn("Continue Dealing button not found (continueDealingButtonEl is null).");
        }
        console.log("SCRIPT DEBUG: Finished setting up betting practice controls.");
    }

    function triggerBettingPractice() {
        console.log("SCRIPT DEBUG: triggerBettingPractice called.");
        if (levelSelectEl && levelSelectEl.value === "practice") { // Removed currentGameMode check
            dealNewCard(); 
            return;
        }

        gamePausedForBetting = true;
        clearInterval(gameTimer);
        if (timerDisplayEl) timerDisplayEl.textContent = `Time: PAUSED`;
        displayMessage("Betting Practice: What's your bet based on the True Count?", "info");

        if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'block';
        if (bettingTrueCountDisplayEl) {
            let tcText = "N/A";
            if (currentCountingSystem === 'hi-lo') { 
                 tcText = isFinite(trueCount) ? trueCount.toFixed(1) : (trueCount === Infinity ? "Very High+" : (trueCount === -Infinity ? "Very Low-" : "N/A"));
            }
            bettingTrueCountDisplayEl.innerHTML = `Current True Count: <strong>${tcText}</strong>`;
        }
        
        if (bettingFeedbackEl) {
            bettingFeedbackEl.textContent = ''; 
            bettingFeedbackEl.className = ''; 
            bettingFeedbackEl.classList.remove('visible', 'message-correct', 'message-wrong', 'message-info'); 
        }
        if (continueDealingButtonEl) {
            continueDealingButtonEl.style.display = 'none'; 
        }
    }

    function handleBetChoiceInput(betChoice) {
        console.log("SCRIPT DEBUG: handleBetChoiceInput called with choice:", betChoice);
        if (!gamePausedForBetting) {
            console.warn("SCRIPT DEBUG: handleBetChoiceInput called but game not paused for betting.");
            return;
        }
        // ... (rest of the function is the same as the last version with logs) ...
        let feedbackText = "";
        let feedbackClass = "message-info"; 
        const tc = trueCount; 

        if (currentCountingSystem === 'hi-lo') { 
            if (tc < 1) {
                if (betChoice === 'min') {
                    feedbackText = "Correct! With a True Count < +1, a minimum bet is generally advised.";
                    feedbackClass = "message-correct";
                } else {
                    feedbackText = "Consider a minimum bet. The True Count is less than +1.";
                    feedbackClass = "message-wrong";
                }
            } else if (tc >= 1 && tc < 3) {
                if (betChoice === 'mid') {
                    feedbackText = "Good choice! A moderate bet is often suitable for a True Count between +1 and +3.";
                    feedbackClass = "message-correct";
                } else if (betChoice === 'min') {
                    feedbackText = "You could consider a slightly larger bet (mid), but min is a safe play.";
                    feedbackClass = "message-info"; 
                } else { 
                    feedbackText = "A max bet might be a bit aggressive here. A moderate bet is often preferred for this True Count.";
                    feedbackClass = "message-wrong";
                }
            } else { 
                if (betChoice === 'max') {
                    feedbackText = "Excellent! With a True Count >= +3, a larger bet is usually favorable.";
                    feedbackClass = "message-correct";
                } else {
                    feedbackText = "With such a high True Count, consider a larger bet for maximum advantage!";
                    feedbackClass = "message-wrong";
                }
            }
        } else { 
            feedbackText = `Betting guidance for ${countingSystemsData[currentCountingSystem].name} might differ. You chose ${betChoice.toUpperCase()} Bet.`;
        }
       
        feedbackText = `You chose: ${betChoice.toUpperCase()} Bet. ${feedbackText}`;

        if (bettingFeedbackEl) {
            bettingFeedbackEl.textContent = feedbackText;
            bettingFeedbackEl.className = ''; 
            bettingFeedbackEl.classList.add(feedbackClass); 
            bettingFeedbackEl.classList.add('visible');
            console.log("SCRIPT DEBUG: Betting feedback set - Text:", feedbackText, "Class:", feedbackClass);
        }

        if (continueDealingButtonEl) {
            continueDealingButtonEl.style.display = 'inline-block'; 
            console.log("SCRIPT DEBUG: Continue dealing button displayed.");
        } else {
            console.warn("Continue Dealing button not found. Game progression might be affected.");
        }
    }

    function resumeAfterBettingPractice() {
        console.log("SCRIPT DEBUG: resumeAfterBettingPractice called.");
        if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none';
        if (continueDealingButtonEl) continueDealingButtonEl.style.display = 'none';
        if (bettingFeedbackEl) { 
            bettingFeedbackEl.classList.remove('visible');
            bettingFeedbackEl.textContent = '';
        }
        gamePausedForBetting = false;
        displayMessage("Resuming game...", "info");
        if (gameActive) { // Removed currentGameMode check
           dealNewCard();
        } else if (!gameActive) { // Removed currentGameMode check
           displayMessage("Betting practice ended. Start a new shoe to continue.", "info");
        }
    }

    // =========================================================================
    // 9. CORE GAME LOGIC ("Guess Card Value" mode) - MODIFIED processGuess
    // =========================================================================
    function updateAccuracyDisplay() { /* ... */ }
    function resetSessionStats() { /* ... */ }
    function updateCurrentSystemDisplay() { 
        if (currentSystemDisplayEl && countingSystemsData[currentCountingSystem]) {
             currentSystemDisplayEl.textContent = countingSystemsData[currentCountingSystem].name;
        }
        if (currentSystemValuesDisplayEl && countingSystemsData[currentCountingSystem]) {
            currentSystemValuesDisplayEl.textContent = countingSystemsData[currentCountingSystem].description; 
        }
    }
    function buildShoe() { /* ... */ }
    function handleUserChoice(choice) { if (!gameActive && !gamePausedForBetting) { startNewGame(); return; } if (gameActive && !gamePausedForBetting) { processGuess(choice); } } // Removed currentGameMode check
    function startNewGame() { 
        // if (currentGameMode !== 'guessValue') { displayMessage("Switch to 'Guess Card Value' mode to start this game.", "info"); return; } // REMOVED
        console.log("SCRIPT DEBUG: startNewGame (Guess Card Value mode)"); 
        clearInterval(gameTimer); 
        gameActive = true; gamePausedForBetting = false; score = 0; runningCount = 0; trueCount = 0; 
        resetSessionStats(); 
        buildShoe(); 
        loadHighScoreForCurrentLevel(); 
        updateScoreboardVisuals(); updateAllCountVisuals(); updateCurrentSystemDisplay(); 
        displayMessage("Shoe ready. Good luck!", "info"); 
        dealNewCard(); 
    }

    function processGuess(userChoice) {
        if (!currentCard || !gameActive || gamePausedForBetting) return; // Removed currentGameMode check
        clearInterval(gameTimer);
        sessionTotalCardsDealt++; 

        let expectedValue;
        if (userChoice === 'plus') expectedValue = 1;
        else if (userChoice === 'minus') expectedValue = -1;
        else expectedValue = 0;

        if (expectedValue === currentCard.pointVal) {
            score++; 
            sessionCorrectGuesses++;
            runningCount += currentCard.pointVal;
            displayMessage("Correct!", "correct");
            playSound(correctSound);
            if (score > highScore) {
                highScore = score;
                saveHighScoreForCurrentLevel();
            }
        } else {
            playSound(wrongSound);
            runningCount += currentCard.pointVal; 
            displayMessage(`Wrong! Card was ${currentCard.label}${currentCard.suit} (${currentCard.pointVal > 0 ? '+' : ''}${currentCard.pointVal}). Keep going!`, "wrong");
        }

        updateScoreboardVisuals();
        updateAllCountVisuals();
        updateAccuracyDisplay();

        if (sessionTotalCardsDealt > 0 && sessionTotalCardsDealt % CARDS_BETWEEN_BETS === 0 && (levelSelectEl && levelSelectEl.value !== "practice")) {
            triggerBettingPractice();
        } else {
            if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) {
                const penetrationPercent = totalCardsInShoe > 0 ? ((cardsDealtInShoe / totalCardsInShoe) * 100).toFixed(0) : 0;
                // MODIFIED: Game Over message if shoe ends. "New Shoe" button will restart.
                displayMessage(`Shoe finished! Penetration: ${penetrationPercent}%. Final RC: ${runningCount}. Click 'New Shoe' to play again.`, "info");
                gameActive = false; // End the game session for this shoe
                // Do not automatically start new game here, let user click "New Shoe"
            } else {
                dealNewCard();
            }
        }
    }

    function dealNewCard() { 
        if (!gameActive || gamePausedForBetting) return; // Removed currentGameMode check
        // Shuffle check moved to processGuess and startRoundTimer to occur *before* attempting to deal
        if (gameShoe.length === 0) { // Extra check, though previous logic should prevent this
             console.warn("Attempted to deal from empty shoe when not expected.");
             displayMessage(`Shoe empty! Click 'New Shoe' to play again.`, "info");
             gameActive = false;
             return;
        }
        currentCard = gameShoe.pop(); 
        cardsDealtInShoe++; 
        updateAllCountVisuals(); 
        animateCardFlip(); 
    }

    function updateAllCountVisuals() { /* ... */ }
    function animateCardFlip() { /* ... */ }
    
    // gameOver function might be less used now, primarily for critical errors or explicit stops
    function gameOver(reason) { 
        clearInterval(gameTimer); 
        gameActive = false; 
        displayMessage(`${reason}. Score: ${score}. Click 'New Shoe / Start Game' to play again.`, "wrong"); 
    }

    // Flash Drill sections are REMOVED

    // =========================================================================
    // 11. SCOREBOARD, MESSAGES, SOUNDS, LOCALSTORAGE - NO CHANGES
    // =========================================================================
    function updateScoreboardVisuals() { /* ... */ }
    function displayMessage(msg, typeClass) { /* ... */ }
    function playSound(soundElement) { /* ... */ }
    function toggleMusic() { /* ... */ }
    function updateMusicButtonVisuals() { /* ... */ }
    function saveHighScoreForCurrentLevel() { /* ... */ } // Removed gameMode from key
    function loadHighScoreForCurrentLevel() { /* ... */ } // Removed gameMode from key
    
    // Adjusted save/load high score to remove gameMode from the key
    function saveHighScoreForCurrentLevel() { 
        try { 
            const currentLevel = levelSelectEl && levelSelectEl.value; 
            const currentDeckSize = deckSizeEl && deckSizeEl.value; 
            const system = currentCountingSystem; 
            // const gameMode = currentGameMode; // REMOVED
            if (currentLevel && currentDeckSize) { // Removed gameMode === 'guessValue' check
                localStorage.setItem(`cardCounterHighScore_${system}_${currentLevel}_${currentDeckSize}`, highScore.toString()); 
            } 
        } catch (e) { console.warn("Could not save high score:", e.message); } 
    }
    function loadHighScoreForCurrentLevel() { 
        try { 
            const currentLevel = levelSelectEl && levelSelectEl.value; 
            const currentDeckSize = deckSizeEl && deckSizeEl.value; 
            const system = currentCountingSystem; 
            // const gameMode = currentGameMode; // REMOVED
            if (currentLevel && currentDeckSize) { // Removed gameMode === 'guessValue' check
                const savedScore = localStorage.getItem(`cardCounterHighScore_${system}_${currentLevel}_${currentDeckSize}`); 
                highScore = parseInt(savedScore) || 0; 
            } else { highScore = 0; } 
        } catch (e) { console.warn("Could not load high score:", e.message); highScore = 0; } 
    }
    
    function loadInitialSettings() { /* ... */ }

    // =========================================================================
    // 12. START THE APPLICATION
    // =========================================================================
    loadInitialSettings();
    initializeApp();
    console.log("SCRIPT DEBUG: Script execution finished at bottom.");
});
