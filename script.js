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

    // --- NEW DOM Elements for Added Features ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIconEl = document.getElementById('themeIcon');
    const bodyEl = document.body;

    const countingSystemSelectEl = document.getElementById('countingSystem');
    const basicStrategyButtonEl = document.getElementById('basicStrategyButton');
    const basicStrategyModalEl = document.getElementById('basicStrategyModal');
    const closeBasicStrategyModalButtonEl = document.getElementById('closeBasicStrategyModalButton');
    const basicStrategyChartContainerEl = document.getElementById('basicStrategyChartContainer');
    const howToPlayContentEl = document.getElementById('howToPlayContent'); // Wrapper for dynamic instructions
    const currentSystemDisplayEl = document.getElementById('currentSystemDisplay');
    const currentSystemValuesDisplayEl = document.getElementById('currentSystemValuesDisplay');


    const gameModeSelectEl = document.getElementById('gameMode');
    const mainGameAreaEl = document.getElementById('mainGameArea');
    const flashDrillAreaEl = document.getElementById('flashDrillArea');
    const flashDrillNumCardsInputEl = document.getElementById('flashDrillNumCards');
    const flashDrillSpeedInputEl = document.getElementById('flashDrillSpeed');
    const startFlashDrillButtonEl = document.getElementById('startFlashDrillButton');
    const flashDrillCardDisplayAreaEl = document.getElementById('flashDrillCardDisplayArea'); // You'll need to decide how to display cards here
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
    if (bgMusic) bgMusic.volume = 0.15;

    const sunIcon = '☀️';
    const moonIcon = '🌙';

    // =========================================================================
    // 2. CARD DATA & COUNTING SYSTEMS
    // =========================================================================
    const suits = ['♥', '♦', '♣', '♠'];
    const cardLabels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    // Map card label to a base value for easier lookup (e.g., J,Q,K are like '10' for some systems)
    const cardBaseValues = { '2':'2', '3':'3', '4':'4', '5':'5', '6':'6', '7':'7', '8':'8', '9':'9', '10':'10', 'J':'10', 'Q':'10', 'K':'10', 'A':'A'};


    const countingSystemsData = {
        'hi-lo': {
            name: 'Hi-Lo',
            values: { '2':1, '3':1, '4':1, '5':1, '6':1, '7':0, '8':0, '9':0, '10':-1, 'A':-1 }, // J,Q,K implicitly -1 due to cardBaseValues
            description: "Cards 2-6 are +1. Cards 7-9 are 0. Cards 10, J, Q, K, A are -1.",
            howToPlay: `
                <p><strong>Hi-Lo Values:</strong></p>
                <ul>
                  <li>Cards 2-6: <strong>+1</strong></li>
                  <li>Cards 7-9: <strong>0</strong></li>
                  <li>Cards 10, Jack, Queen, King, Ace: <strong>-1</strong></li>
                </ul>
                <p><strong>Running Count (RC):</strong> Start at 0. For each card, add its Hi-Lo value to the RC.</p>
                <p><strong>True Count (TC):</strong> RC ÷ Decks Remaining. This is a more accurate measure of advantage.</p>
                <p><strong>Basic Betting Strategy (using True Count):</strong></p>
                <ul>
                  <li>TC < +1: Bet small (table minimum).</li>
                  <li>TC +1 to +2: Consider a moderate bet.</li>
                  <li>TC ≥ +3: Bet larger!</li>
                </ul>`
        },
        'ko': {
            name: 'KO (Rookie)',
            values: { '2':1, '3':1, '4':1, '5':1, '6':1, '7':1, '8':0, '9':0, '10':-1, 'A':-1 },
            description: "Cards 2-7 are +1. Cards 8-9 are 0. Cards 10, J, Q, K, A are -1.",
            howToPlay: `
                <p><strong>KO (Knock-Out) Values:</strong></p>
                <ul>
                  <li>Cards 2, 3, 4, 5, 6, 7: <strong>+1</strong></li>
                  <li>Cards 8, 9: <strong>0</strong></li>
                  <li>Cards 10, Jack, Queen, King, Ace: <strong>-1</strong></li>
                </ul>
                <p>KO is an unbalanced system. The Running Count (RC) is the primary focus.</p>
                <p><strong>Initial Running Count (IRC):</strong> Start at 0 for a single deck. For multiple decks, start at -4 * (Number of Decks - 1). Example: For 6 decks, IRC = -4 * 5 = -20. (This app starts RC at 0 for simplicity in training initial card values, adjust your mental IRC accordingly if simulating full KO strategy).</p>
                <p><strong>Key Count / Pivot Point:</strong> A common pivot point for KO Rookie is +2. When the RC reaches or exceeds this key count, it's generally time to increase your bets.</p>
                <p>True Count is not typically used with KO Rookie.</p>`
        }
    };
    let currentCountingSystem = 'hi-lo'; // Default

    // =========================================================================
    // 3. GAME STATE VARIABLES
    // =========================================================================
    let currentCard = null; // For "Guess Card Value" mode
    let score = 0;
    let runningCount = 0;
    let highScore = 0;
    let gameTimer = null; // For "Guess Card Value" mode timer
    let timeLeft = 0;
    let gameActive = false; // For "Guess Card Value" mode
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
    let currentGameMode = 'guessValue'; // 'guessValue' or 'flashDrill'

    // Flash Drill State
    let drillActive = false;
    let drillCardSequence = [];
    let drillActualRunningCount = 0;
    let drillCurrentCardIdx = 0;
    let drillTimer = null;


    // =========================================================================
    // 4. INITIALIZATION & SETUP
    // =========================================================================
    function initializeApp() {
        // Event Listeners for controls
        levelSelectEl.addEventListener('change', handleGameSettingChange);
        deckSizeEl.addEventListener('change', handleGameSettingChange);
        countingSystemSelectEl.addEventListener('change', handleGameSystemChange);
        gameModeSelectEl.addEventListener('change', handleGameModeChange);

        musicToggleBtn.addEventListener('click', toggleMusic);
        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
        });
        if (newShoeButtonEl) {
            newShoeButtonEl.addEventListener('click', startNewGame);
        }

        // Feature Setups
        setupThemeToggle();
        setupCardSpeedControl();
        setupHowToPlayModal();
        setupBasicStrategyModal();
        setupBettingPracticeControls();
        setupFlashDrillControls();
        
        // Initial UI Updates
        updateMusicButtonVisuals();
        updateCurrentSystemDisplay();
        setupInitialScreen(); // This will also set up the initial game mode view
    }

    function setupInitialScreen() {
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
        loadHighScoreForCurrentLevel(); // Considers current system for HS key
        updateScoreboardVisuals();
        updateAllCountVisuals();
        updateAccuracyDisplay();
        
        displayMessage("Select settings and click 'New Shoe / Start Game' or a card value button to begin!", "info");
        
        if (cardContainerEl) cardContainerEl.classList.remove('flipping');
        if (cardBackEl) cardBackEl.textContent = '?';
        if (cardFrontEl) cardFrontEl.textContent = '';
        
        updateTimerDisplayVisuals();
        if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none';
        
        // Set initial game mode view
        switchGameModeView(currentGameMode);
        if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'none';
        if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = '';
        if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = ''; // Clear drill card display

    }

    function handleGameSettingChange() { // For level, deck size
        console.log("SCRIPT DEBUG: Game setting changed (level or deck size)");
        updateCardSpeedInputFromLevel();
        setupInitialScreen(); // Full reset as deck size or level impacts high score and game flow
    }

    function handleGameSystemChange() {
        currentCountingSystem = countingSystemSelectEl.value;
        console.log("SCRIPT DEBUG: Counting system changed to:", currentCountingSystem);
        updateCurrentSystemDisplay();
        updateHowToPlayModalContent(); // Update modal with new system info
        // If a game is active, changing system should ideally reset it or at least counts.
        // For now, let's do a full reset to keep things simple.
        setupInitialScreen();
    }

    function handleGameModeChange() {
        currentGameMode = gameModeSelectEl.value;
        console.log("SCRIPT DEBUG: Game mode changed to:", currentGameMode);
        setupInitialScreen(); // Resets scores and UI for the new mode
    }
    
    function switchGameModeView(mode) {
        if (mode === 'flashDrill') {
            if (mainGameAreaEl) mainGameAreaEl.style.display = 'none';
            if (flashDrillAreaEl) flashDrillAreaEl.style.display = 'block';
            if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none'; // Hide betting for drill
            displayMessage("Setup Flash Drill and click 'Start Drill'.", "info");
        } else { // guessValue mode
            if (mainGameAreaEl) mainGameAreaEl.style.display = 'block';
            if (flashDrillAreaEl) flashDrillAreaEl.style.display = 'none';
            // Betting practice only for guessValue mode currently
            // setupInitialScreen will hide betting if not active.
        }
    }


    // =========================================================================
    // 5. THEME TOGGLE (Light/Dark Mode)
    // =========================================================================
    function setupThemeToggle() {
        if (!themeToggleBtn || !themeIconEl) return;

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = bodyEl.classList.contains('light-mode') ? 'light' : 'dark';
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
        loadInitialTheme();
    }

    function applyTheme(theme) {
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

    function loadInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (systemPrefersDark) {
            applyTheme('dark');
        } else {
            applyTheme('light'); // Default to light if no preference
        }
    }

    // =========================================================================
    // 6. CARD SPEED & TIMER (for Guess Card Value mode)
    // =========================================================================
    function setupCardSpeedControl() {
        // (Your existing code - seems fine)
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
    
    function updateCardSpeedInputFromLevel() {
        // (Your existing code - seems fine)
        const currentLevel = levelSelectEl.value;
        currentCardSpeed = levelDefaultTimes[currentLevel] || 5; 
        if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
        localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); 
        if (!gameActive && currentGameMode === 'guessValue') updateTimerDisplayVisuals();
    }

    function updateTimerDisplayVisuals() {
        // (Your existing code - seems fine for guessValue mode)
        if (!timerDisplayEl || currentGameMode !== 'guessValue') return;
        const isPractice = levelSelectEl.value === "practice";
        if (isPractice || currentCardSpeed >= 600) {
            timerDisplayEl.textContent = "Time: ∞";
        } else {
            timerDisplayEl.textContent = `Time: ${currentCardSpeed}s`; // Use currentCardSpeed, not input value directly
        }
    }

    function startRoundTimer() { // For "Guess Card Value" mode
        if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return;
        // (Rest of your existing code for startRoundTimer - seems fine)
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

    // =========================================================================
    // 7. HOW TO PLAY & BASIC STRATEGY MODALS
    // =========================================================================
    function setupHowToPlayModal() {
        if (!howToPlayButtonEl || !howToPlayModalEl || !closeHowToPlayModalButtonEl) return;
        updateHowToPlayModalContent(); // Initial content based on default system
        howToPlayButtonEl.addEventListener('click', () => {
            updateHowToPlayModalContent(); // Ensure it's up-to-date
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

    function updateHowToPlayModalContent() {
        if (!howToPlayContentEl) return;
        const systemData = countingSystemsData[currentCountingSystem];
        if (systemData) {
            howToPlayContentEl.innerHTML = `<h2>How to Play: ${systemData.name}</h2>${systemData.howToPlay}`;
        } else {
            howToPlayContentEl.innerHTML = `<p>Select a counting system to see instructions.</p>`;
        }
    }

    function setupBasicStrategyModal() {
        if (!basicStrategyButtonEl || !basicStrategyModalEl || !closeBasicStrategyModalButtonEl) return;
        basicStrategyButtonEl.addEventListener('click', () => {
            generateBasicStrategyChartHTML(); // Generate and inject chart
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

    // --- Basic Strategy Chart Data (PLACEHOLDER - YOU NEED TO FILL THIS) ---
    const basicStrategyData = {
        // Example structure - NEEDS COMPLETE DATA
        // Dealer cards: 2, 3, 4, 5, 6, 7, 8, 9, T (10/J/Q/K), A
        hardTotals: {
            // Player Total: { Dealer_2: "Action", Dealer_3: "Action", ... }
            "17+": { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "T": "S", "A": "S"},
            "16":  { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"},
            "15":  { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"},
            "14":  { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"},
            "13":  { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"},
            "12":  { "2": "H", "3": "H", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"},
            "11":  { "2": "D", "3": "D", "4": "D", "5": "D", "6": "D", "7": "D", "8": "D", "9": "D", "T": "D", "A": "H"}, // Or D if DAS
            "10":  { "2": "D", "3": "D", "4": "D", "5": "D", "6": "D", "7": "D", "8": "D", "9": "D", "T": "H", "A": "H"},
            "9":   { "2": "H", "3": "D", "4": "D", "5": "D", "6": "D", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"},
            "5-8": { "2": "H", "3": "H", "4": "H", "5": "H", "6": "H", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H"}
        },
        softTotals: { // Player Ace + Other Card
            "A,9": { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "T": "S", "A": "S" }, // Soft 20
            "A,8": { "2": "S", "3": "S", "4": "S", "5": "S", "6": "DS", "7": "S", "8": "S", "9": "S", "T": "S", "A": "S" },// Soft 19 (DS = Double if allowed, else Stand)
            "A,7": { "2": "DS", "3": "DS", "4": "DS", "5": "DS", "6": "DS", "7": "S", "8": "S", "9": "H", "T": "H", "A": "H" },// Soft 18
            "A,6": { "2": "H", "3": "D", "4": "D", "5": "D", "6": "D", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" }, // Soft 17
            "A,5": { "2": "H", "3": "H", "4": "D", "5": "D", "6": "D", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" }, // Soft 16
            "A,4": { "2": "H", "3": "H", "4": "D", "5": "D", "6": "D", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" }, // Soft 15
            "A,3": { "2": "H", "3": "H", "4": "H", "5": "D", "6": "D", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" }, // Soft 14
            "A,2": { "2": "H", "3": "H", "4": "H", "5": "D", "6": "D", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" }  // Soft 13
        },
        pairs: { // Player Pair
            "A,A": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "P", "9": "P", "T": "P", "A": "P" },
            "T,T": { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "T": "S", "A": "S" }, // Tens
            "9,9": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "S", "8": "P", "9": "P", "T": "S", "A": "S" },
            "8,8": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "P", "9": "P", "T": "P", "A": "P" }, // Always split 8s
            "7,7": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "H", "9": "H", "T": "H", "A": "H" },
            "6,6": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" },
            "5,5": { "2": "D", "3": "D", "4": "D", "5": "D", "6": "D", "7": "D", "8": "D", "9": "D", "T": "H", "A": "H" }, // Never split 5s, treat as 10
            "4,4": { "2": "H", "3": "H", "4": "H", "5": "P", "6": "P", "7": "H", "8": "H", "9": "H", "T": "H", "A": "H" },
            "3,3": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "H", "9": "H", "T": "H", "A": "H" },
            "2,2": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "H", "9": "H", "T": "H", "A": "H" }
        },
        legend: "H: Hit, S: Stand, D: Double (if not allowed, Hit), DS: Double (if not allowed, Stand), P: Split"
    };

    function generateBasicStrategyChartHTML() {
        if (!basicStrategyChartContainerEl) return;
        let html = `<p><strong>Legend:</strong> ${basicStrategyData.legend}</p>`;
        const dealerRow = "<th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10/A</th><th>Ace</th>"; // Simplified 10/A for T
        
        function createTable(title, data) {
            let tableHTML = `<h3>${title}</h3><table><thead><tr>${dealerRow}</tr></thead><tbody>`;
            for (const playerHand in data) {
                tableHTML += `<tr><td><strong>${playerHand}</strong></td>`;
                const decisions = data[playerHand];
                // Order of dealer cards to match header
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
    // 8. BETTING PRACTICE (for Guess Card Value mode)
    // =========================================================================
    // (Your existing setupBettingPracticeControls, triggerBettingPractice, handleBetChoiceInput, resumeAfterBettingPractice)
    // Ensure triggerBettingPractice is only called if currentGameMode === 'guessValue'
    function setupBettingPracticeControls() { /* ... your existing code ... */ }
    function triggerBettingPractice() {
        if (currentGameMode !== 'guessValue' || levelSelectEl.value === "practice") { 
            dealNewCard(); 
            return;
        }
        /* ... rest of your existing code ... */
    }
    function handleBetChoiceInput(betChoice) { /* ... your existing code ... */ }
    function resumeAfterBettingPractice() { /* ... your existing code ... */ }

    // =========================================================================
    // 9. CORE GAME LOGIC ("Guess Card Value" mode)
    // =========================================================================
    function updateAccuracyDisplay() { /* ... your existing code ... */ }
    function resetSessionStats() { /* ... your existing code ... */ }
    
    function updateCurrentSystemDisplay() {
        if (!currentSystemDisplayEl || !currentSystemValuesDisplayEl) return;
        const systemData = countingSystemsData[currentCountingSystem];
        if (systemData) {
            currentSystemDisplayEl.textContent = systemData.name;
            currentSystemValuesDisplayEl.textContent = systemData.description;
        }
    }

    function buildShoe() {
        console.log("SCRIPT DEBUG: buildShoe for system:", currentCountingSystem);
        const numDecks = parseInt(deckSizeEl.value) || 1;
        gameShoe = [];
        const systemValues = countingSystemsData[currentCountingSystem].values;

        for (let i = 0; i < numDecks; i++) {
            cardLabels.forEach(label => { // Iterate through defined card labels '2' through 'A'
                const baseVal = cardBaseValues[label]; // Get '10' for J,Q,K or 'A' for Ace
                const pointVal = systemValues[baseVal] !== undefined ? systemValues[baseVal] : systemValues[label]; // Fallback to label if baseVal not in system (e.g. 7 for Hi-Lo)

                suits.forEach(suit => {
                    gameShoe.push({
                        label: label, // e.g., 'K', '7', 'A'
                        suit: suit,
                        pointVal: pointVal, // This is the crucial value from the selected system
                        color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
                    });
                });
            });
        }
        totalCardsInShoe = gameShoe.length;
        cardsDealtInShoe = 0;
        // Fisher-Yates Shuffle
        for (let i = gameShoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]];
        }
        console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards. First card pointVal: ${gameShoe[gameShoe.length-1]?.pointVal}`);
    }

    function handleUserChoice(choice) { // For "Guess Card Value" mode
        if (currentGameMode !== 'guessValue') return;
        // (Rest of your existing code for handleUserChoice)
        if (!gameActive && !gamePausedForBetting) { 
            startNewGame(); 
            return; 
        }
        if (gameActive && !gamePausedForBetting) { 
             processGuess(choice);
        }
    }
    
    function startNewGame() { // For "Guess Card Value" mode
        if (currentGameMode !== 'guessValue') {
            displayMessage("Switch to 'Guess Card Value' mode to start this game.", "info");
            return;
        }
        console.log("SCRIPT DEBUG: startNewGame (Guess Card Value mode)");
        // (Rest of your existing code, ensure it sets up for guessValue mode)
        clearInterval(gameTimer);
        gameActive = true;
        gamePausedForBetting = false; 
        score = 0;
        runningCount = 0; // KO might have a different IRC, but for training card values, 0 is fine.
        trueCount = 0;
        resetSessionStats(); 
        buildShoe(); 
        loadHighScoreForCurrentLevel();
        updateScoreboardVisuals();
        updateAllCountVisuals(); 
        updateCurrentSystemDisplay(); // Update display based on current system
        displayMessage("Shoe ready. Good luck!", "info");
        dealNewCard(); 
    }

    function processGuess(userChoice) { // For "Guess Card Value" mode
        if (!currentCard || !gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return;
        clearInterval(gameTimer);
        sessionTotalCardsDealt++;

        let expectedValue;
        if (userChoice === 'plus') expectedValue = 1;
        else if (userChoice === 'minus') expectedValue = -1;
        else expectedValue = 0;

        // Compare with currentCard.pointVal (which is based on selected system)
        if (expectedValue === currentCard.pointVal) {
            score++;
            sessionCorrectGuesses++;
            runningCount += currentCard.pointVal; // Use the card's actual point value
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
            gameOver(`Wrong guess! Card ${currentCard.label}${currentCard.suit} is ${currentCard.pointVal > 0 ? '+' : ''}${currentCard.pointVal} for ${countingSystemsData[currentCountingSystem].name}. RC: ${runningCount}`);
        }
    }

    function dealNewCard() { // For "Guess Card Value" mode
        if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') {
            return;
        }
        // (Rest of your existing code for dealNewCard)
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
    
    function updateAllCountVisuals() { // For "Guess Card Value" mode
        if (runningCountDisplayEl) runningCountDisplayEl.textContent = `Running Count: ${runningCount}`;
        
        const decksRemaining = Math.max(0.01, (totalCardsInShoe - cardsDealtInShoe) / 52);
        
        // True count is mainly for Hi-Lo. For KO Rookie, it's less relevant or not used.
        if (currentCountingSystem === 'hi-lo' && totalCardsInShoe > 0) {
            trueCount = runningCount / decksRemaining;
            let trueCountText = "0.0";
            if (isFinite(trueCount)) trueCountText = trueCount.toFixed(1);
            else if (trueCount === Infinity) trueCountText = "Very High+";
            else if (trueCount === -Infinity) trueCountText = "Very Low-";
            if (trueCountDisplayEl) {
                trueCountDisplayEl.textContent = `True Count: ${trueCountText}`;
                trueCountDisplayEl.style.display = 'block'; // Show for Hi-Lo
            }
        } else if (trueCountDisplayEl) {
            trueCountDisplayEl.textContent = 'True Count: N/A'; // Or hide for KO
            trueCountDisplayEl.style.display = currentCountingSystem === 'ko' ? 'none' : 'block';
        }
        
        if (deckInfoDisplayEl) deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`;
    }

    function animateCardFlip() { /* ... your existing code ... */ }
    function updateCardFaceAndFlipToFront() { /* ... your existing code, ensure it uses currentCard ... */ }

    function gameOver(reason) { // For "Guess Card Value" mode
        // (Your existing code - ensure it only proceeds if in guessValue mode)
        clearInterval(gameTimer);
        gameActive = false; 
        displayMessage(`${reason}. Score: ${score}. Click 'New Shoe / Start Game' or a value to play again.`, "wrong");
    }


    // =========================================================================
    // 10. FLASHING CARDS DRILL LOGIC
    // =========================================================================
    function setupFlashDrillControls() {
        if (!startFlashDrillButtonEl || !submitFlashDrillCountButtonEl) return;

        startFlashDrillButtonEl.addEventListener('click', startFlashDrill);
        submitFlashDrillCountButtonEl.addEventListener('click', evaluateFlashDrill);
    }

    function startFlashDrill() {
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

        // Build a temporary shoe for the drill or use a portion of the main shoe
        // For simplicity, let's build a small temporary sequence
        drillCardSequence = [];
        drillActualRunningCount = 0; // KO might start differently, but for this drill, 0 is fine.
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

    function flashNextDrillCard(speedMs) {
        if (!drillActive || drillCurrentCardIdx >= drillCardSequence.length) {
            endFlashDrillSequence();
            return;
        }

        const card = drillCardSequence[drillCurrentCardIdx];
        // Display card - for now, just text in the drill display area
        if (flashDrillCardDisplayAreaEl) {
            flashDrillCardDisplayAreaEl.innerHTML = `<div class="card-face card-front ${card.color}" style="width:120px; height:180px; display:flex; justify-content:center; align-items:center; font-size:4em; border:1px solid #ccc; border-radius:10px; margin:auto;">${card.label}${card.suit}</div>`;
        }
        
        drillActualRunningCount += card.pointVal;
        drillCurrentCardIdx++;

        drillTimer = setTimeout(() => {
            if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = ''; // Clear card
            flashNextDrillCard(speedMs);
        }, speedMs);
    }

    function endFlashDrillSequence() {
        console.log("SCRIPT DEBUG: Flash Drill sequence ended. Actual RC:", drillActualRunningCount);
        if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = '<p style="text-align:center; padding-top:70px;">Sequence Complete!</p>';
        if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'block';
        if (flashDrillUserCountInputEl) flashDrillUserCountInputEl.focus();
        if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = false;
        drillActive = false; // Drill sequence part is done
    }

    function evaluateFlashDrill() {
        if (flashDrillInputAreaEl.style.display === 'none') return; // Not expecting input yet

        const userCount = parseInt(flashDrillUserCountInputEl.value);
        if (isNaN(userCount)) {
            if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = "Please enter a valid number.";
            flashDrillFeedbackEl.className = 'message-wrong';
            return;
        }

        if (userCount === drillActualRunningCount) {
            if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = `Correct! Running count was ${drillActualRunningCount}.`;
            flashDrillFeedbackEl.className = 'message-correct';
            // You could add scoring for drills here if desired
        } else {
            if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = `Incorrect. Your count: ${userCount}. Actual count: ${drillActualRunningCount}.`;
            flashDrillFeedbackEl.className = 'message-wrong';
        }
        if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = false;
        // Keep input area visible for review, or hide it:
        // if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'none';
    }


    // =========================================================================
    // 11. SCOREBOARD, MESSAGES, SOUNDS, LOCALSTORAGE (Mostly existing)
    // =========================================================================
    function updateScoreboardVisuals() { /* ... your existing code ... */ }
    function displayMessage(msg, typeClass) { /* ... your existing code ... */ }
    function playSound(soundElement) { /* ... your existing code ... */ }
    function toggleMusic() { /* ... your existing code ... */ }
    function updateMusicButtonVisuals() { /* ... your existing code ... */ }

    function saveHighScoreForCurrentLevel() {
        try {
            const currentLevel = levelSelectEl.value;
            const currentDeckSize = deckSizeEl.value;
            const system = currentCountingSystem; // Add system to high score key
            const gameMode = currentGameMode; // Add gameMode to high score key if scores are separate
            // Only save for 'guessValue' mode for now, or adapt for drill scores
            if (gameMode === 'guessValue') {
                localStorage.setItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`, highScore.toString());
            }
        } catch (e) {
            console.warn("Could not save high score:", e.message);
        }
    }

    function loadHighScoreForCurrentLevel() {
        try {
            const currentLevel = levelSelectEl.value;
            const currentDeckSize = deckSizeEl.value;
            const system = currentCountingSystem;
            const gameMode = currentGameMode;
            if (gameMode === 'guessValue') {
                const savedScore = localStorage.getItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`);
                highScore = parseInt(savedScore) || 0;
            } else {
                highScore = 0; // No separate high score for drill yet
            }
        } catch (e) {
            console.warn("Could not load high score:", e.message);
            highScore = 0;
        }
    }
    
    function loadInitialSettings() { // For music, speed
        // (Your existing code for music and speed - seems fine)
        musicOn = localStorage.getItem('cardCounterMusicOn') === 'true';
        const savedSpeed = localStorage.getItem('cardCounterSpeed');
        if (savedSpeed !== null) {
            currentCardSpeed = parseFloat(savedSpeed);
            if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
        } else {
            updateCardSpeedInputFromLevel(); 
        }
        updateMusicButtonVisuals(); 
        // High score load is now handled by setupInitialScreen -> loadHighScoreForCurrentLevel
    }

    // =========================================================================
    // 12. START THE APPLICATION
    // =========================================================================
    loadInitialSettings(); // Loads music, speed settings
    initializeApp();       // Sets up event listeners and initial game state
});
