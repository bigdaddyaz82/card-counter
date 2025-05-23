document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 0. DOM ELEMENTS
    // =========================================================================

    // --- Existing DOM Elements ---
    const cardContainerEl = document.getElementById('cardContainer');
    const cardFrontEl = document.querySelector('#cardContainer .card-front');
    const cardBackEl = document.querySelector('#cardContainer .card-back');
    const scoreEl = document.getElementById('score');
    const highscoreEl = document.getElementById('highscore');
    const timerDisplayEl = document.getElementById('timerDisplay');
    const levelSelectEl = document.getElementById('level');
    const musicToggleBtn = document.getElementById('musicToggle'); // Corrected ID
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

    // --- NEW DOM Elements for Added Features ---
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

    const gameModeSelectEl = document.getElementById('gameMode');
    const mainGameAreaEl = document.getElementById('mainGameArea');
    const flashDrillAreaEl = document.getElementById('flashDrillArea');
    const flashDrillNumCardsInputEl = document.getElementById('flashDrillNumCards');
    const flashDrillSpeedInputEl = document.getElementById('flashDrillSpeed');
    const startFlashDrillButtonEl = document.getElementById('startFlashDrillButton');
    const flashDrillCardDisplayAreaEl = document.getElementById('flashDrillCardDisplayArea');
    const flashDrillInputAreaEl = document.getElementById('flashDrillInputArea');
    const flashDrillUserCountInputEl = document.getElementById('flashDrillUserCount');
    const submitFlashDrillCountButtonEl = document.getElementById('submitFlashDrillCountButton');
    const flashDrillFeedbackEl = document.getElementById('flashDrillFeedback');

    // =========================================================================
    // 1. SOUNDS & ASSETS
    // =========================================================================
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const bgMusic = document.getElementById('bgMusic');

    if (correctSound) correctSound.volume = 0.3;
    if (wrongSound) wrongSound.volume = 0.3;
    if (bgMusic) bgMusic.volume = 0.15; // Initial volume for background music

    const sunIcon = '☀️';
    const moonIcon = '🌙';

    // =========================================================================
    // 2. CARD DATA & COUNTING SYSTEMS
    // =========================================================================
    // (Your existing card data and counting systems - unchanged)
    const suits = ['♥', '♦', '♣', '♠'];
    const cardLabels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const cardBaseValues = { '2':'2', '3':'3', '4':'4', '5':'5', '6':'6', '7':'7', '8':'8', '9':'9', '10':'10', 'J':'10', 'Q':'10', 'K':'10', 'A':'A'};
    const countingSystemsData = {
        'hi-lo': {
            name: 'Hi-Lo',
            values: { '2':1, '3':1, '4':1, '5':1, '6':1, '7':0, '8':0, '9':0, '10':-1, 'A':-1 },
            description: "Cards 2-6 are +1. Cards 7-9 are 0. Cards 10, J, Q, K, A are -1.",
            howToPlay: `<p><strong>Hi-Lo Values:</strong></p><ul><li>Cards 2-6: <strong>+1</strong></li><li>Cards 7-9: <strong>0</strong></li><li>Cards 10, Jack, Queen, King, Ace: <strong>-1</strong></li></ul><p><strong>Running Count (RC):</strong> Start at 0. For each card, add its Hi-Lo value to the RC.</p><p><strong>True Count (TC):</strong> RC ÷ Decks Remaining. This is a more accurate measure of advantage.</p><p><strong>Basic Betting Strategy (using True Count):</strong></p><ul><li>TC < +1: Bet small (table minimum).</li><li>TC +1 to +2: Consider a moderate bet.</li><li>TC ≥ +3: Bet larger!</li></ul>`
        },
        'ko': {
            name: 'KO (Rookie)',
            values: { '2':1, '3':1, '4':1, '5':1, '6':1, '7':1, '8':0, '9':0, '10':-1, 'A':-1 },
            description: "Cards 2-7 are +1. Cards 8-9 are 0. Cards 10, J, Q, K, A are -1.",
            howToPlay: `<p><strong>KO (Knock-Out) Values:</strong></p><ul><li>Cards 2, 3, 4, 5, 6, 7: <strong>+1</strong></li><li>Cards 8, 9: <strong>0</strong></li><li>Cards 10, Jack, Queen, King, Ace: <strong>-1</strong></li></ul><p>KO is an unbalanced system. The Running Count (RC) is the primary focus.</p><p><strong>Initial Running Count (IRC):</strong> Start at 0 for a single deck. For multiple decks, start at -4 * (Number of Decks - 1). Example: For 6 decks, IRC = -4 * 5 = -20. (This app starts RC at 0 for simplicity in training initial card values, adjust your mental IRC accordingly if simulating full KO strategy).</p><p><strong>Key Count / Pivot Point:</strong> A common pivot point for KO Rookie is +2. When the RC reaches or exceeds this key count, it's generally time to increase your bets.</p><p>True Count is not typically used with KO Rookie.</p>`
        }
    };
    let currentCountingSystem = 'hi-lo';

    // =========================================================================
    // 3. GAME STATE VARIABLES
    // =========================================================================
    // (Your existing game state variables - unchanged, except for musicOn initialization)
    let currentCard = null;
    let score = 0;
    let runningCount = 0;
    let highScore = 0;
    let gameTimer = null;
    let timeLeft = 0;
    let gameActive = false;
    let musicOn = false; // Will be set by loadInitialSettings
    let gameShoe = [];
    let cardsDealtInShoe = 0;
    let totalCardsInShoe = 0;
    let trueCount = 0;
    const SHUFFLE_PENETRATION = 0.75;
    let currentCardSpeed = 5; // Default, will be updated
    let sessionCorrectGuesses = 0;
    let sessionTotalCardsDealt = 0;
    let gamePausedForBetting = false;
    const CARDS_BETWEEN_BETS = 10;
    const levelDefaultTimes = { practice: 600, beginner: 15, advanced: 10, expert: 5 };
    let currentGameMode = 'guessValue';

    let drillActive = false;
    let drillCardSequence = [];
    let drillActualRunningCount = 0;
    let drillCurrentCardIdx = 0;
    let drillTimer = null;

    // =========================================================================
    // 4. INITIALIZATION & SETUP
    // =========================================================================
    function initializeApp() {
        levelSelectEl.addEventListener('change', handleGameSettingChange);
        deckSizeEl.addEventListener('change', handleGameSettingChange);
        countingSystemSelectEl.addEventListener('change', handleGameSystemChange);
        gameModeSelectEl.addEventListener('change', handleGameModeChange);

        if (musicToggleBtn) musicToggleBtn.addEventListener('click', toggleMusic); // Ensure btn exists
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
        setupFlashDrillControls();
        
        updateCurrentSystemDisplay();
        setupInitialScreen();
        // updateMusicButtonVisuals(); // Called by loadInitialSettings and setupInitialScreen (if needed)
    }

    function setupInitialScreen() { /* ... (your existing code, ensure it's fine) ... */
        console.log("SCRIPT DEBUG: setupInitialScreen called");
        clearInterval(gameTimer);
        clearInterval(drillTimer);
        gameActive = false;
        drillActive = false;
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
        updateMusicButtonVisuals(); // Update music button based on current musicOn state
        
        displayMessage("Select settings and click 'New Shoe / Start Game' or a card value button to begin!", "info");
        
        if (cardContainerEl) cardContainerEl.classList.remove('flipping');
        if (cardBackEl) cardBackEl.textContent = '?';
        if (cardFrontEl) cardFrontEl.textContent = '';
        
        updateTimerDisplayVisuals();
        if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none';
        
        switchGameModeView(currentGameMode);
        if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'none';
        if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = '';
        if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = '';
    }

    function handleGameSettingChange() { /* ... (your existing code) ... */
        console.log("SCRIPT DEBUG: Game setting changed (level or deck size)");
        updateCardSpeedInputFromLevel();
        setupInitialScreen();
    }
    function handleGameSystemChange() { /* ... (your existing code) ... */
        currentCountingSystem = countingSystemSelectEl.value;
        console.log("SCRIPT DEBUG: Counting system changed to:", currentCountingSystem);
        updateCurrentSystemDisplay();
        updateHowToPlayModalContent();
        setupInitialScreen();
    }
    function handleGameModeChange() { /* ... (your existing code) ... */
        currentGameMode = gameModeSelectEl.value;
        console.log("SCRIPT DEBUG: Game mode changed to:", currentGameMode);
        setupInitialScreen();
    }
    function switchGameModeView(mode) { /* ... (your existing code) ... */
        if (mode === 'flashDrill') {
            if (mainGameAreaEl) mainGameAreaEl.style.display = 'none';
            if (flashDrillAreaEl) flashDrillAreaEl.style.display = 'block';
            if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none';
            displayMessage("Setup Flash Drill and click 'Start Drill'.", "info");
        } else { 
            if (mainGameAreaEl) mainGameAreaEl.style.display = 'block';
            if (flashDrillAreaEl) flashDrillAreaEl.style.display = 'none';
        }
    }

    // =========================================================================
    // 5. THEME TOGGLE (Light/Dark Mode) - Unchanged
    // =========================================================================
    function setupThemeToggle() { /* ... (your existing code) ... */
        if (!themeToggleBtn || !themeIconEl) return;
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = bodyEl.classList.contains('light-mode') ? 'light' : 'dark';
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
        loadInitialTheme();
    }
    function applyTheme(theme) { /* ... (your existing code) ... */
        bodyEl.classList.remove('light-mode', 'dark-mode');
        if (theme === 'light') {
            bodyEl.classList.add('light-mode');
            if (themeIconEl) themeIconEl.textContent = moonIcon;
        } else {
            bodyEl.classList.add('dark-mode');
            if (themeIconEl) themeIconEl.textContent = sunIcon;
        }
        localStorage.setItem('theme', theme);
    }
    function loadInitialTheme() { /* ... (your existing code) ... */
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (systemPrefersDark) {
            applyTheme('dark');
        } else {
            applyTheme('light'); 
        }
    }

    // =========================================================================
    // 6. CARD SPEED & TIMER - Unchanged
    // =========================================================================
    function setupCardSpeedControl() { /* ... (your existing code) ... */
        if (!cardSpeedInputEl) return;
        cardSpeedInputEl.value = currentCardSpeed;
        cardSpeedInputEl.addEventListener('input', () => {
            let speedVal = parseFloat(cardSpeedInputEl.value);
            if (isNaN(speedVal) || speedVal < 0.5) speedVal = 0.5;
            if (speedVal > 600) speedVal = 600;
            currentCardSpeed = speedVal;
            localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString());
            if (!gameActive && currentGameMode === 'guessValue') {
                updateTimerDisplayVisuals();
            }
        });
        updateCardSpeedInputFromLevel();
    }
    function updateCardSpeedInputFromLevel() { /* ... (your existing code) ... */
        const currentLevel = levelSelectEl.value;
        currentCardSpeed = levelDefaultTimes[currentLevel] || 5; 
        if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
        localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); 
        if (!gameActive && currentGameMode === 'guessValue') updateTimerDisplayVisuals();
    }
    function updateTimerDisplayVisuals() { /* ... (your existing code) ... */
        if (!timerDisplayEl || currentGameMode !== 'guessValue') return;
        const isPractice = levelSelectEl.value === "practice";
        if (isPractice || currentCardSpeed >= 600) {
            timerDisplayEl.textContent = "Time: ∞";
        } else {
            timerDisplayEl.textContent = `Time: ${currentCardSpeed}s`;
        }
    }
    function startRoundTimer() { /* ... (your existing code, includes playSound(wrongSound)) ... */
        if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return;
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
                playSound(wrongSound); // Uses updated playSound
                sessionTotalCardsDealt++; 
                updateAccuracyDisplay();
                gameOver(`Time's up! RC: ${runningCount}`);
            }
        }, 1000);
    }

    // =========================================================================
    // 7. HOW TO PLAY & BASIC STRATEGY MODALS - Unchanged
    // =========================================================================
    function setupHowToPlayModal() { /* ... (your existing code) ... */
        if (!howToPlayButtonEl || !howToPlayModalEl || !closeHowToPlayModalButtonEl) return;
        updateHowToPlayModalContent();
        howToPlayButtonEl.addEventListener('click', () => {
            updateHowToPlayModalContent();
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
    function updateHowToPlayModalContent() { /* ... (your existing code) ... */
        if (!howToPlayContentEl) return;
        const systemData = countingSystemsData[currentCountingSystem];
        if (systemData) {
            howToPlayContentEl.innerHTML = `<h2>How to Play: ${systemData.name}</h2>${systemData.howToPlay}`;
        } else {
            howToPlayContentEl.innerHTML = `<p>Select a counting system to see instructions.</p>`;
        }
    }
    function setupBasicStrategyModal() { /* ... (your existing code) ... */
        if (!basicStrategyButtonEl || !basicStrategyModalEl || !closeBasicStrategyModalButtonEl) return;
        basicStrategyButtonEl.addEventListener('click', () => {
            generateBasicStrategyChartHTML();
            basicStrategyModalEl.style.display = 'flex';
        });
        closeBasicStrategyModalButtonEl.addEventListener('click', () => {
            basicStrategyModalEl.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === basicStrategyModalEl) {
                basicStrategyModalEl.style.display = 'none';
            }
        });
    }
    const basicStrategyData = { /* ... (your existing data) ... */
        hardTotals:{"17+":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"16":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"15":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"14":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"13":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"12":{2:"H",3:"H",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"11":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"D",A:"H"},"10":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"H",A:"H"},"9":{2:"H",3:"D",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"5-8":{2:"H",3:"H",4:"H",5:"H",6:"H",7:"H",8:"H",9:"H",T:"H",A:"H"}},softTotals:{"A,9":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"A,8":{2:"S",3:"S",4:"S",5:"S",6:"DS",7:"S",8:"S",9:"S",T:"S",A:"S"},"A,7":{2:"DS",3:"DS",4:"DS",5:"DS",6:"DS",7:"S",8:"S",9:"H",T:"H",A:"H"},"A,6":{2:"H",3:"D",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,5":{2:"H",3:"H",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,4":{2:"H",3:"H",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,3":{2:"H",3:"H",4:"H",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,2":{2:"H",3:"H",4:"H",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"}},pairs:{"A,A":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"P",9:"P",T:"P",A:"P"},"T,T":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"9,9":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"S",8:"P",9:"P",T:"S",A:"S"},"8,8":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"P",9:"P",T:"P",A:"P"},"7,7":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"},"6,6":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"H",8:"H",9:"H",T:"H",A:"H"},"5,5":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"H",A:"H"},"4,4":{2:"H",3:"H",4:"H",5:"P",6:"P",7:"H",8:"H",9:"H",T:"H",A:"H"},"3,3":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"},"2,2":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"}},legend:"H: Hit, S: Stand, D: Double (if not allowed, Hit), DS: Double (if not allowed, Stand), P: Split"
    };
    function generateBasicStrategyChartHTML() { /* ... (your existing code) ... */
        if (!basicStrategyChartContainerEl) return;
        let html = `<p><strong>Legend:</strong> ${basicStrategyData.legend}</p>`;
        const dealerRow = "<th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10/A</th><th>Ace</th>";
        function createTable(title, data) {
            let tableHTML = `<h3>${title}</h3><table><thead><tr>${dealerRow}</tr></thead><tbody>`;
            for (const playerHand in data) {
                tableHTML += `<tr><td><strong>${playerHand}</strong></td>`;
                const decisions = data[playerHand];
                const dealerCardsOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"];
                dealerCardsOrder.forEach(dealerCard => {
                    tableHTML += `<td>${decisions[dealerCard] || '-'}</td>`;
                });
                tableHTML += `</tr>`;
            }
            tableHTML += `</tbody></table>`;
            return tableHTML;
        }
        html += createTable("Hard Totals", basicStrategyData.hardTotals);
        html += createTable("Soft Totals", basicStrategyData.softTotals);
        html += createTable("Pairs", basicStrategyData.pairs);
        basicStrategyChartContainerEl.innerHTML = html;
    }

    // =========================================================================
    // 8. BETTING PRACTICE - Unchanged (logic seems fine for its purpose)
    // =========================================================================
    function setupBettingPracticeControls() { /* ... (your existing code) ... */ }
    function triggerBettingPractice() { /* ... (your existing code) ... */ }
    function handleBetChoiceInput(betChoice) { /* ... (your existing code) ... */ }
    function resumeAfterBettingPractice() { /* ... (your existing code) ... */ }

    // =========================================================================
    // 9. CORE GAME LOGIC ("Guess Card Value" mode) - Unchanged
    // =========================================================================
    // (Your existing functions: updateAccuracyDisplay, resetSessionStats, updateCurrentSystemDisplay, buildShoe, handleUserChoice, startNewGame, processGuess, dealNewCard, updateAllCountVisuals, animateCardFlip, updateCardFaceAndFlipToFront, gameOver - ensure they work with other changes, especially `playSound` calls within them)
    function updateAccuracyDisplay() { /* ... (your existing code) ... */ }
    function resetSessionStats() { /* ... (your existing code) ... */ }
    function updateCurrentSystemDisplay() { /* ... (your existing code) ... */
        if (!currentSystemDisplayEl || !currentSystemValuesDisplayEl) return;
        const systemData = countingSystemsData[currentCountingSystem];
        if (systemData) {
            currentSystemDisplayEl.textContent = systemData.name;
            currentSystemValuesDisplayEl.textContent = systemData.description;
        }
    }
    function buildShoe() { /* ... (your existing code) ... */
        console.log("SCRIPT DEBUG: buildShoe for system:", currentCountingSystem);
        const numDecks = parseInt(deckSizeEl.value) || 1;
        gameShoe = [];
        const systemValues = countingSystemsData[currentCountingSystem].values;
        for (let i = 0; i < numDecks; i++) {
            cardLabels.forEach(label => {
                const baseVal = cardBaseValues[label];
                const pointVal = systemValues[baseVal] !== undefined ? systemValues[baseVal] : systemValues[label];
                suits.forEach(suit => {
                    gameShoe.push({ label, suit, pointVal, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
                });
            });
        }
        totalCardsInShoe = gameShoe.length;
        cardsDealtInShoe = 0;
        for (let i = gameShoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]];
        }
        console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards.`);
    }
    function handleUserChoice(choice) { /* ... (your existing code) ... */
        if (currentGameMode !== 'guessValue') return;
        if (!gameActive && !gamePausedForBetting) { 
            startNewGame(); 
            return; 
        }
        if (gameActive && !gamePausedForBetting) { 
             processGuess(choice);
        }
    }
    function startNewGame() { /* ... (your existing code) ... */
        if (currentGameMode !== 'guessValue') {
            displayMessage("Switch to 'Guess Card Value' mode to start this game.", "info");
            return;
        }
        console.log("SCRIPT DEBUG: startNewGame (Guess Card Value mode)");
        clearInterval(gameTimer);
        gameActive = true;
        gamePausedForBetting = false; 
        score = 0;
        runningCount = 0;
        trueCount = 0;
        resetSessionStats(); 
        buildShoe(); 
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateAllCountVisuals(); 
        updateCurrentSystemDisplay();
        displayMessage("Shoe ready. Good luck!", "info");
        dealNewCard();
    }
    function processGuess(userChoice) { /* ... (your existing code, includes playSound(wrongSound)) ... */
        if (!currentCard || !gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return;
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
            playSound(correctSound); // Play correct sound
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
            playSound(wrongSound); // Uses updated playSound
            updateAccuracyDisplay();
            gameOver(`Wrong guess! Card ${currentCard.label}${currentCard.suit} is ${currentCard.pointVal > 0 ? '+' : ''}${currentCard.pointVal} for ${countingSystemsData[currentCountingSystem].name}. RC: ${runningCount}`);
        }
    }
    function dealNewCard() { /* ... (your existing code) ... */
        if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return;
        if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) {
            const penetrationPercent = totalCardsInShoe > 0 ? ((cardsDealtInShoe/totalCardsInShoe)*100).toFixed(0) : 0;
            displayMessage(`Shuffle time! Penetration: ${penetrationPercent}%. Starting new shoe.`, "info");
            setTimeout(() => {
                if (gameActive && currentGameMode === 'guessValue') startNewGame(); 
            }, 2000);
            return;
        }
        currentCard = gameShoe.pop();
        cardsDealtInShoe++;
        updateAllCountVisuals(); 
        animateCardFlip();
    }
    function updateAllCountVisuals() { /* ... (your existing code) ... */
        if (runningCountDisplayEl) runningCountDisplayEl.textContent = `Running Count: ${runningCount}`;
        const decksRemaining = Math.max(0.01, (totalCardsInShoe - cardsDealtInShoe) / 52);
        if (currentCountingSystem === 'hi-lo' && totalCardsInShoe > 0) {
            trueCount = runningCount / decksRemaining;
            let trueCountText = "0.0";
            if (isFinite(trueCount)) trueCountText = trueCount.toFixed(1);
            else if (trueCount === Infinity) trueCountText = "Very High+";
            else if (trueCount === -Infinity) trueCountText = "Very Low-";
            if (trueCountDisplayEl) {
                trueCountDisplayEl.textContent = `True Count: ${trueCountText}`;
                trueCountDisplayEl.style.display = 'block';
            }
        } else if (trueCountDisplayEl) {
            trueCountDisplayEl.textContent = 'True Count: N/A';
            trueCountDisplayEl.style.display = currentCountingSystem === 'ko' ? 'none' : 'block';
        }
        if (deckInfoDisplayEl) deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`;
    }
    function animateCardFlip() { /* ... (your existing code) ... */ }
    function updateCardFaceAndFlipToFront() { /* ... (your existing code) ... */ }
    function gameOver(reason) { /* ... (your existing code) ... */
        clearInterval(gameTimer);
        gameActive = false; 
        displayMessage(`${reason}. Score: ${score}. Click 'New Shoe / Start Game' or a value to play again.`, "wrong");
    }

    // =========================================================================
    // 10. FLASHING CARDS DRILL LOGIC - Unchanged
    // =========================================================================
    function setupFlashDrillControls() { /* ... (your existing code) ... */
        if (!startFlashDrillButtonEl || !submitFlashDrillCountButtonEl) return;
        startFlashDrillButtonEl.addEventListener('click', startFlashDrill);
        submitFlashDrillCountButtonEl.addEventListener('click', evaluateFlashDrill);
    }
    function startFlashDrill() { /* ... (your existing code) ... */
        if (currentGameMode !== 'flashDrill') return;
        console.log("SCRIPT DEBUG: Starting Flash Drill");
        drillActive = true;
        clearInterval(drillTimer);
        if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = true;
        if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'none';
        if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = '';
        if (flashDrillUserCountInputEl) flashDrillUserCountInputEl.value = '';
        const numCards = parseInt(flashDrillNumCardsInputEl.value) || 10;
        const speedMs = (parseFloat(flashDrillSpeedInputEl.value) || 1) * 1000;
        drillCardSequence = [];
        drillActualRunningCount = 0;
        const systemValues = countingSystemsData[currentCountingSystem].values;
        for (let i = 0; i < numCards; i++) {
            const randomLabelIdx = Math.floor(Math.random() * cardLabels.length);
            const randomSuitIdx = Math.floor(Math.random() * suits.length);
            const label = cardLabels[randomLabelIdx];
            const suit = suits[randomSuitIdx];
            const baseVal = cardBaseValues[label];
            const pointVal = systemValues[baseVal] !== undefined ? systemValues[baseVal] : systemValues[label];
            drillCardSequence.push({ label, suit, pointVal, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
        }
        drillCurrentCardIdx = 0;
        flashNextDrillCard(speedMs);
    }
    function flashNextDrillCard(speedMs) { /* ... (your existing code) ... */
        if (!drillActive || drillCurrentCardIdx >= drillCardSequence.length) {
            endFlashDrillSequence();
            return;
        }
        const card = drillCardSequence[drillCurrentCardIdx];
        if (flashDrillCardDisplayAreaEl) {
            flashDrillCardDisplayAreaEl.innerHTML = `<div class="card-face card-front ${card.color}" style="width:120px; height:180px; display:flex; justify-content:center; align-items:center; font-size:4em; border:1px solid #ccc; border-radius:10px; margin:auto;">${card.label}${card.suit}</div>`;
        }
        drillActualRunningCount += card.pointVal;
        drillCurrentCardIdx++;
        drillTimer = setTimeout(() => {
            if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = '';
            flashNextDrillCard(speedMs);
        }, speedMs);
    }
    function endFlashDrillSequence() { /* ... (your existing code) ... */
        console.log("SCRIPT DEBUG: Flash Drill sequence ended. Actual RC:", drillActualRunningCount);
        if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = '<p style="text-align:center; padding-top:70px;">Sequence Complete!</p>';
        if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'block';
        if (flashDrillUserCountInputEl) flashDrillUserCountInputEl.focus();
        if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = false;
        drillActive = false;
    }
    function evaluateFlashDrill() { /* ... (your existing code) ... */
        if (flashDrillInputAreaEl.style.display === 'none') return;
        const userCount = parseInt(flashDrillUserCountInputEl.value);
        if (isNaN(userCount)) {
            if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = "Please enter a valid number.";
            flashDrillFeedbackEl.className = 'message-wrong';
            return;
        }
        if (userCount === drillActualRunningCount) {
            if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = `Correct! Running count was ${drillActualRunningCount}.`;
            flashDrillFeedbackEl.className = 'message-correct';
        } else {
            if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = `Incorrect. Your count: ${userCount}. Actual count: ${drillActualRunningCount}.`;
            flashDrillFeedbackEl.className = 'message-wrong';
        }
        if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = false;
    }

    // =========================================================================
    // 11. SCOREBOARD, MESSAGES, SOUNDS, LOCALSTORAGE
    // =========================================================================
    function updateScoreboardVisuals() { /* ... (your existing code) ... */
        if (scoreEl) scoreEl.textContent = score;
        if (highscoreEl) highscoreEl.textContent = highScore;
    }
    function displayMessage(msg, typeClass) { /* ... (your existing code) ... */
        if (messageDisplayEl) {
            messageDisplayEl.textContent = msg;
            messageDisplayEl.className = `message-display message-${typeClass}`; // e.g. message-correct, message-wrong, message-info
        }
    }

    // --- UPDATED AUDIO FUNCTIONS ---
    function playSound(soundElement) {
        // Play sound effects only if musicOn is true (assuming musicOn mutes all sounds)
        // If you want sound effects to play independently of background music,
        // you might need a separate sfxOn flag or remove the musicOn check for non-bgMusic.
        if (soundElement && musicOn) {
            soundElement.currentTime = 0; // Rewind to start to play again quickly
            soundElement.play().catch(error => {
                console.warn(`Error playing sound ${soundElement.id}:`, error.message);
            });
        }
    }

    function toggleMusic() {
        musicOn = !musicOn;
        localStorage.setItem('cardCounterMusicOn', musicOn.toString());
        updateMusicButtonVisuals();

        if (bgMusic) { // Ensure bgMusic element exists
            if (musicOn) {
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("Background music playback failed after toggle:", error.message);
                        // Autoplay might be blocked by the browser. User might need further interaction.
                    });
                }
            } else {
                bgMusic.pause();
                // bgMusic.currentTime = 0; // Optional: Rewind when paused
            }
        }
    }

    function updateMusicButtonVisuals() {
        if (musicToggleBtn) {
            musicToggleBtn.textContent = musicOn ? "Music ON" : "Music OFF";
        }
    }
    // --- END OF UPDATED AUDIO FUNCTIONS ---

    function saveHighScoreForCurrentLevel() { /* ... (your existing code) ... */
        try {
            const currentLevel = levelSelectEl.value;
            const currentDeckSize = deckSizeEl.value;
            const system = currentCountingSystem;
            const gameMode = currentGameMode;
            if (gameMode === 'guessValue') {
                localStorage.setItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`, highScore.toString());
            }
        } catch (e) {
            console.warn("Could not save high score:", e.message);
        }
    }
    function loadHighScoreForCurrentLevel() { /* ... (your existing code) ... */
        try {
            const currentLevel = levelSelectEl.value;
            const currentDeckSize = deckSizeEl.value;
            const system = currentCountingSystem;
            const gameMode = currentGameMode;
            if (gameMode === 'guessValue') {
                const savedScore = localStorage.getItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`);
                highScore = parseInt(savedScore) || 0;
            } else {
                highScore = 0;
            }
        } catch (e) {
            console.warn("Could not load high score:", e.message);
            highScore = 0;
        }
    }
    
    function loadInitialSettings() {
        // Speed
        const savedSpeed = localStorage.getItem('cardCounterSpeed');
        if (savedSpeed !== null) {
            currentCardSpeed = parseFloat(savedSpeed);
            if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
        } else {
            if (levelSelectEl) { // Ensure levelSelectEl is available
                 updateCardSpeedInputFromLevel();
            } else {
                currentCardSpeed = 5; // Fallback if levelSelectEl not ready
            }
        }

        // Music - This will also attempt to play bgMusic if it was on
        musicOn = localStorage.getItem('cardCounterMusicOn') === 'true'; // Defaults to false if not 'true'
        updateMusicButtonVisuals(); // Update button text based on loaded state

        if (musicOn && bgMusic) {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    console.log("Background music started based on saved preference.");
                }).catch(error => {
                    console.warn("Initial background music autoplay was prevented by browser:", error.message);
                    // musicOn remains true, but music isn't playing. User can toggle to re-attempt.
                });
            }
        }
        // Theme is handled by setupThemeToggle -> loadInitialTheme
        // High score is handled by setupInitialScreen -> loadHighScoreForCurrentLevel
    }

    // =========================================================================
    // 12. START THE APPLICATION
    // =========================================================================
    loadInitialSettings(); // Loads speed, music state, and attempts initial music play
    initializeApp();       // Sets up event listeners, further UI, and initial game state
});
