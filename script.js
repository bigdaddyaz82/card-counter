document.addEventListener('DOMContentLoaded', () => {
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

    // Theme Toggle Elements
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
    if (bgMusic) bgMusic.volume = 0.15;

    const sunIcon = '☀️'; // For Dark Mode
    const moonIcon = '🌙'; // For Light Mode

    // =========================================================================
    // 2. CARD DATA & COUNTING SYSTEMS (Keep your existing data)
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
    // 3. GAME STATE VARIABLES (Keep your existing variables)
    // =========================================================================
    let currentCard = null, score = 0, runningCount = 0, highScore = 0, gameTimer = null, timeLeft = 0, gameActive = false;
    let musicOn = false; // Will be updated by loadInitialSettings
    let gameShoe = [], cardsDealtInShoe = 0, totalCardsInShoe = 0, trueCount = 0;
    const SHUFFLE_PENETRATION = 0.75;
    let currentCardSpeed = 5; // Default, will be updated
    let sessionCorrectGuesses = 0, sessionTotalCardsDealt = 0, gamePausedForBetting = false;
    const CARDS_BETWEEN_BETS = 10;
    const levelDefaultTimes = { practice: 600, beginner: 15, advanced: 10, expert: 5 };
    let currentGameMode = 'guessValue';
    let drillActive = false, drillCardSequence = [], drillActualRunningCount = 0, drillCurrentCardIdx = 0, drillTimer = null;

    // =========================================================================
    // 4. INITIALIZATION & SETUP
    // =========================================================================
    function initializeApp() {
        // Event Listeners for controls
        if (levelSelectEl) levelSelectEl.addEventListener('change', handleGameSettingChange);
        if (deckSizeEl) deckSizeEl.addEventListener('change', handleGameSettingChange);
        if (countingSystemSelectEl) countingSystemSelectEl.addEventListener('change', handleGameSystemChange);
        if (gameModeSelectEl) gameModeSelectEl.addEventListener('change', handleGameModeChange);

        if (musicToggleBtn) {
            musicToggleBtn.addEventListener('click', () => {
                console.log("Music Toggle Button Clicked!");
                toggleMusic();
            });
        } else {
            console.warn("Music toggle button not found!");
        }

        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleUserChoice(button.dataset.choice));
        });
        if (newShoeButtonEl) {
            newShoeButtonEl.addEventListener('click', startNewGame);
        }

        // Feature Setups
        setupThemeToggle(); // This will also call loadInitialTheme
        setupCardSpeedControl();
        setupHowToPlayModal();
        setupBasicStrategyModal();
        setupBettingPracticeControls();
        setupFlashDrillControls();
        
        updateCurrentSystemDisplay();
        setupInitialScreen();
    }

    function setupInitialScreen() {
        console.log("SCRIPT DEBUG: setupInitialScreen called");
        clearInterval(gameTimer); clearInterval(drillTimer);
        gameActive = false; drillActive = false; gamePausedForBetting = false;
        score = 0; runningCount = 0; trueCount = 0; cardsDealtInShoe = 0;
        sessionCorrectGuesses = 0; sessionTotalCardsDealt = 0;
        
        if(levelSelectEl) updateCardSpeedInputFromLevel(); // Check if element exists
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
        
        switchGameModeView(currentGameMode);
        if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'none';
        if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = '';
        if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = '';
    }

    function handleGameSettingChange() { console.log("SCRIPT DEBUG: Game setting changed (level or deck size)"); updateCardSpeedInputFromLevel(); setupInitialScreen(); }
    function handleGameSystemChange() { currentCountingSystem = countingSystemSelectEl.value; console.log("SCRIPT DEBUG: Counting system changed to:", currentCountingSystem); updateCurrentSystemDisplay(); updateHowToPlayModalContent(); setupInitialScreen(); }
    function handleGameModeChange() { currentGameMode = gameModeSelectEl.value; console.log("SCRIPT DEBUG: Game mode changed to:", currentGameMode); setupInitialScreen(); }
    function switchGameModeView(mode) { if (mode === 'flashDrill') { if (mainGameAreaEl) mainGameAreaEl.style.display = 'none'; if (flashDrillAreaEl) flashDrillAreaEl.style.display = 'block'; if (bettingPracticeSectionEl) bettingPracticeSectionEl.style.display = 'none'; displayMessage("Setup Flash Drill and click 'Start Drill'.", "info"); } else { if (mainGameAreaEl) mainGameAreaEl.style.display = 'block'; if (flashDrillAreaEl) flashDrillAreaEl.style.display = 'none'; } }

    // =========================================================================
    // 5. THEME TOGGLE (Light/Dark Mode)
    // =========================================================================
    function applyTheme(theme) { // theme is 'light' or 'dark'
        bodyEl.classList.remove('light-mode', 'dark-mode'); // Clear existing
        if (theme === 'light') {
            bodyEl.classList.add('light-mode');
            if (themeIconEl) themeIconEl.textContent = moonIcon; // Show moon for light mode
        } else { // 'dark'
            bodyEl.classList.add('dark-mode');
            if (themeIconEl) themeIconEl.textContent = sunIcon;  // Show sun for dark mode
        }
        localStorage.setItem('theme', theme);
        console.log("Theme applied:", theme);
    }

    function loadInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const bodyIsDarkByDefault = bodyEl.classList.contains('dark-mode'); // From HTML
        console.log("loadInitialTheme: savedTheme =", savedTheme, ", bodyIsDarkByDefault =", bodyIsDarkByDefault);

        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (bodyIsDarkByDefault) {
            applyTheme('dark'); // Ensure icon and local storage are set if HTML default is dark
        } else {
            // Fallback if no saved theme and body doesn't have dark-mode class by default
            const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        }
    }

    function setupThemeToggle() {
        if (!themeToggleBtn || !themeIconEl) {
            console.warn("Theme toggle button or icon not found!");
            return;
        }
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = bodyEl.classList.contains('light-mode') ? 'light' : 'dark';
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
        loadInitialTheme(); // Load theme when setting up the toggle
    }


    // =========================================================================
    // 6. CARD SPEED & TIMER
    // =========================================================================
    function setupCardSpeedControl() { if (!cardSpeedInputEl) return; cardSpeedInputEl.value = currentCardSpeed; cardSpeedInputEl.addEventListener('input', () => { let speedVal = parseFloat(cardSpeedInputEl.value); if (isNaN(speedVal) || speedVal < 0.5) speedVal = 0.5; if (speedVal > 600) speedVal = 600; currentCardSpeed = speedVal; localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); if (!gameActive && currentGameMode === 'guessValue') { updateTimerDisplayVisuals(); } }); if (levelSelectEl) updateCardSpeedInputFromLevel(); }
    function updateCardSpeedInputFromLevel() { if(!levelSelectEl) return; const currentLevel = levelSelectEl.value; currentCardSpeed = levelDefaultTimes[currentLevel] || 5; if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed; localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); if (!gameActive && currentGameMode === 'guessValue') updateTimerDisplayVisuals(); }
    function updateTimerDisplayVisuals() { if (!timerDisplayEl || currentGameMode !== 'guessValue') return; const isPractice = levelSelectEl && levelSelectEl.value === "practice"; if (isPractice || currentCardSpeed >= 600) { timerDisplayEl.textContent = "Time: ∞"; } else { timerDisplayEl.textContent = `Time: ${currentCardSpeed}s`; } }
    function startRoundTimer() { if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return; clearInterval(gameTimer); const isPractice = levelSelectEl && levelSelectEl.value === "practice"; if (isPractice || currentCardSpeed >= 600) { if (timerDisplayEl) timerDisplayEl.textContent = "Time: ∞"; return; } timeLeft = currentCardSpeed; if (timerDisplayEl) timerDisplayEl.textContent = `Time: ${timeLeft}s`; gameTimer = setInterval(() => { if (gamePausedForBetting) { clearInterval(gameTimer); return; } timeLeft--; if (timerDisplayEl) timerDisplayEl.textContent = `Time: ${timeLeft}s`; if (timeLeft <= 0) { clearInterval(gameTimer); playSound(wrongSound); sessionTotalCardsDealt++; updateAccuracyDisplay(); gameOver(`Time's up! RC: ${runningCount}`); } }, 1000); }

    // =========================================================================
    // 7. HOW TO PLAY & BASIC STRATEGY MODALS
    // =========================================================================
    function setupHowToPlayModal() { if (!howToPlayButtonEl || !howToPlayModalEl || !closeHowToPlayModalButtonEl) return; updateHowToPlayModalContent(); howToPlayButtonEl.addEventListener('click', () => { updateHowToPlayModalContent(); if (howToPlayModalEl) howToPlayModalEl.style.display = 'flex'; if(howToPlayModalEl) howToPlayModalEl.classList.add('active'); }); closeHowToPlayModalButtonEl.addEventListener('click', () => { if (howToPlayModalEl) howToPlayModalEl.style.display = 'none'; if(howToPlayModalEl) howToPlayModalEl.classList.remove('active'); }); window.addEventListener('click', (event) => { if (event.target === howToPlayModalEl) { if (howToPlayModalEl) howToPlayModalEl.style.display = 'none'; if(howToPlayModalEl) howToPlayModalEl.classList.remove('active');} }); }
    function updateHowToPlayModalContent() { if (!howToPlayContentEl) return; const systemData = countingSystemsData[currentCountingSystem]; if (systemData) { howToPlayContentEl.innerHTML = `<h2>How to Play: ${systemData.name}</h2>${systemData.howToPlay}`; } else { howToPlayContentEl.innerHTML = `<p>Select a counting system to see instructions.</p>`; } }
    function setupBasicStrategyModal() { if (!basicStrategyButtonEl || !basicStrategyModalEl || !closeBasicStrategyModalButtonEl) return; basicStrategyButtonEl.addEventListener('click', () => { generateBasicStrategyChartHTML(); if (basicStrategyModalEl) basicStrategyModalEl.style.display = 'flex'; if(basicStrategyModalEl) basicStrategyModalEl.classList.add('active'); }); closeBasicStrategyModalButtonEl.addEventListener('click', () => { if (basicStrategyModalEl) basicStrategyModalEl.style.display = 'none'; if(basicStrategyModalEl) basicStrategyModalEl.classList.remove('active'); }); window.addEventListener('click', (event) => { if (event.target === basicStrategyModalEl) { if (basicStrategyModalEl) basicStrategyModalEl.style.display = 'none'; if(basicStrategyModalEl) basicStrategyModalEl.classList.remove('active'); } }); }
    const basicStrategyData = { hardTotals:{"17+":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"16":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"15":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"14":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"13":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"12":{2:"H",3:"H",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"11":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"D",A:"H"},"10":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"H",A:"H"},"9":{2:"H",3:"D",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"5-8":{2:"H",3:"H",4:"H",5:"H",6:"H",7:"H",8:"H",9:"H",T:"H",A:"H"}},softTotals:{"A,9":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"A,8":{2:"S",3:"S",4:"S",5:"S",6:"DS",7:"S",8:"S",9:"S",T:"S",A:"S"},"A,7":{2:"DS",3:"DS",4:"DS",5:"DS",6:"DS",7:"S",8:"S",9:"H",T:"H",A:"H"},"A,6":{2:"H",3:"D",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,5":{2:"H",3:"H",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,4":{2:"H",3:"H",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,3":{2:"H",3:"H",4:"H",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,2":{2:"H",3:"H",4:"H",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"}},pairs:{"A,A":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"P",9:"P",T:"P",A:"P"},"T,T":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"9,9":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"S",8:"P",9:"P",T:"S",A:"S"},"8,8":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"P",9:"P",T:"P",A:"P"},"7,7":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"},"6,6":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"H",8:"H",9:"H",T:"H",A:"H"},"5,5":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"H",A:"H"},"4,4":{2:"H",3:"H",4:"H",5:"P",6:"P",7:"H",8:"H",9:"H",T:"H",A:"H"},"3,3":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"},"2,2":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"}},legend:"H: Hit, S: Stand, D: Double (if not allowed, Hit), DS: Double (if not allowed, Stand), P: Split" };
    function generateBasicStrategyChartHTML() { if (!basicStrategyChartContainerEl) return; let html = `<p><strong>Legend:</strong> ${basicStrategyData.legend}</p>`; const dealerRow = "<th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10/A</th><th>Ace</th>"; function createTable(title, data) { let tableHTML = `<h3>${title}</h3><table><thead><tr>${dealerRow}</tr></thead><tbody>`; for (const playerHand in data) { tableHTML += `<tr><td><strong>${playerHand}</strong></td>`; const decisions = data[playerHand]; const dealerCardsOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"]; dealerCardsOrder.forEach(dealerCard => { tableHTML += `<td>${decisions[dealerCard] || '-'}</td>`; }); tableHTML += `</tr>`; } tableHTML += `</tbody></table>`; return tableHTML; } html += createTable("Hard Totals", basicStrategyData.hardTotals); html += createTable("Soft Totals", basicStrategyData.softTotals); html += createTable("Pairs", basicStrategyData.pairs); basicStrategyChartContainerEl.innerHTML = html; }

    // =========================================================================
    // 8. BETTING PRACTICE
    // =========================================================================
    function setupBettingPracticeControls() { /* ... your existing code ... */ }
    function triggerBettingPractice() { if (currentGameMode !== 'guessValue' || (levelSelectEl && levelSelectEl.value === "practice")) { dealNewCard(); return; } /* ... rest of your existing code ... */ }
    function handleBetChoiceInput(betChoice) { /* ... your existing code ... */ }
    function resumeAfterBettingPractice() { /* ... your existing code ... */ }

    // =========================================================================
    // 9. CORE GAME LOGIC ("Guess Card Value" mode)
    // =========================================================================
    function updateAccuracyDisplay() { /* ... your existing code ... */ }
    function resetSessionStats() { /* ... your existing code ... */ }
    function updateCurrentSystemDisplay() { if (!currentSystemDisplayEl || !currentSystemValuesDisplayEl) return; const systemData = countingSystemsData[currentCountingSystem]; if (systemData) { currentSystemDisplayEl.textContent = systemData.name; currentSystemValuesDisplayEl.textContent = systemData.description; } }
    function buildShoe() { console.log("SCRIPT DEBUG: buildShoe for system:", currentCountingSystem); const numDecks = (deckSizeEl && parseInt(deckSizeEl.value)) || 1; gameShoe = []; const systemValues = countingSystemsData[currentCountingSystem].values; for (let i = 0; i < numDecks; i++) { cardLabels.forEach(label => { const baseVal = cardBaseValues[label]; const pointVal = systemValues[baseVal] !== undefined ? systemValues[baseVal] : systemValues[label]; suits.forEach(suit => { gameShoe.push({ label, suit, pointVal, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' }); }); }); } totalCardsInShoe = gameShoe.length; cardsDealtInShoe = 0; for (let i = gameShoe.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]]; } console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards.`); }
    function handleUserChoice(choice) { if (currentGameMode !== 'guessValue') return; if (!gameActive && !gamePausedForBetting) { startNewGame(); return; } if (gameActive && !gamePausedForBetting) { processGuess(choice); } }
    function startNewGame() { if (currentGameMode !== 'guessValue') { displayMessage("Switch to 'Guess Card Value' mode to start this game.", "info"); return; } console.log("SCRIPT DEBUG: startNewGame (Guess Card Value mode)"); clearInterval(gameTimer); gameActive = true; gamePausedForBetting = false; score = 0; runningCount = 0; trueCount = 0; resetSessionStats(); buildShoe(); loadHighScoreForCurrentLevel(); updateScoreboardVisuals(); updateAllCountVisuals(); updateCurrentSystemDisplay(); displayMessage("Shoe ready. Good luck!", "info"); dealNewCard(); }
    function processGuess(userChoice) { if (!currentCard || !gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return; clearInterval(gameTimer); sessionTotalCardsDealt++; let expectedValue; if (userChoice === 'plus') expectedValue = 1; else if (userChoice === 'minus') expectedValue = -1; else expectedValue = 0; if (expectedValue === currentCard.pointVal) { score++; sessionCorrectGuesses++; runningCount += currentCard.pointVal; displayMessage("Correct!", "correct"); playSound(correctSound); if (score > highScore) { highScore = score; saveHighScoreForCurrentLevel(); } updateScoreboardVisuals(); updateAllCountVisuals(); updateAccuracyDisplay(); if (sessionCorrectGuesses > 0 && sessionCorrectGuesses % CARDS_BETWEEN_BETS === 0 && (levelSelectEl && levelSelectEl.value !== "practice")) { triggerBettingPractice(); } else { dealNewCard(); } } else { playSound(wrongSound); updateAccuracyDisplay(); gameOver(`Wrong guess! Card ${currentCard.label}${currentCard.suit} is ${currentCard.pointVal > 0 ? '+' : ''}${currentCard.pointVal} for ${countingSystemsData[currentCountingSystem].name}. RC: ${runningCount}`); } }
    function dealNewCard() { if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return; if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) { const penetrationPercent = totalCardsInShoe > 0 ? ((cardsDealtInShoe/totalCardsInShoe)*100).toFixed(0) : 0; displayMessage(`Shuffle time! Penetration: ${penetrationPercent}%. Starting new shoe.`, "info"); setTimeout(() => { if (gameActive && currentGameMode === 'guessValue') startNewGame(); }, 2000); return; } currentCard = gameShoe.pop(); cardsDealtInShoe++; updateAllCountVisuals(); animateCardFlip(); }
    function updateAllCountVisuals() { if (runningCountDisplayEl) runningCountDisplayEl.textContent = `Running Count: ${runningCount}`; const decksRemaining = Math.max(0.01, (totalCardsInShoe - cardsDealtInShoe) / 52); if (currentCountingSystem === 'hi-lo' && totalCardsInShoe > 0) { trueCount = runningCount / decksRemaining; let trueCountText = "0.0"; if (isFinite(trueCount)) trueCountText = trueCount.toFixed(1); else if (trueCount === Infinity) trueCountText = "Very High+"; else if (trueCount === -Infinity) trueCountText = "Very Low-"; if (trueCountDisplayEl) { trueCountDisplayEl.textContent = `True Count: ${trueCountText}`; trueCountDisplayEl.style.display = 'block'; } } else if (trueCountDisplayEl) { trueCountDisplayEl.textContent = 'True Count: N/A'; trueCountDisplayEl.style.display = currentCountingSystem === 'ko' ? 'none' : 'block'; } if (deckInfoDisplayEl) deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`; }
    function animateCardFlip() { /* ... your existing code ... */ }
    function updateCardFaceAndFlipToFront() { /* ... your existing code ... */ }
    function gameOver(reason) { clearInterval(gameTimer); gameActive = false; displayMessage(`${reason}. Score: ${score}. Click 'New Shoe / Start Game' or a value to play again.`, "wrong"); }

    // =========================================================================
    // 10. FLASHING CARDS DRILL LOGIC
    // =========================================================================
    function setupFlashDrillControls() { if (!startFlashDrillButtonEl || !submitFlashDrillCountButtonEl) return; startFlashDrillButtonEl.addEventListener('click', startFlashDrill); submitFlashDrillCountButtonEl.addEventListener('click', evaluateFlashDrill); }
    function startFlashDrill() { if (currentGameMode !== 'flashDrill') return; console.log("SCRIPT DEBUG: Starting Flash Drill"); drillActive = true; clearInterval(drillTimer); if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = true; if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'none'; if (flashDrillFeedbackEl) flashDrillFeedbackEl.textContent = ''; if (flashDrillUserCountInputEl) flashDrillUserCountInputEl.value = ''; const numCards = (flashDrillNumCardsInputEl && parseInt(flashDrillNumCardsInputEl.value)) || 10; const speedMs = ((flashDrillSpeedInputEl && parseFloat(flashDrillSpeedInputEl.value)) || 1) * 1000; drillCardSequence = []; drillActualRunningCount = 0; const systemValues = countingSystemsData[currentCountingSystem].values; for (let i = 0; i < numCards; i++) { const randomLabelIdx = Math.floor(Math.random() * cardLabels.length); const randomSuitIdx = Math.floor(Math.random() * suits.length); const label = cardLabels[randomLabelIdx]; const suit = suits[randomSuitIdx]; const baseVal = cardBaseValues[label]; const pointVal = systemValues[baseVal] !== undefined ? systemValues[baseVal] : systemValues[label]; drillCardSequence.push({ label, suit, pointVal, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' }); } drillCurrentCardIdx = 0; flashNextDrillCard(speedMs); }
    function flashNextDrillCard(speedMs) { if (!drillActive || drillCurrentCardIdx >= drillCardSequence.length) { endFlashDrillSequence(); return; } const card = drillCardSequence[drillCurrentCardIdx]; if (flashDrillCardDisplayAreaEl) { flashDrillCardDisplayAreaEl.innerHTML = `<div class="card-face card-front ${card.color}" style="width:120px; height:180px; display:flex; justify-content:center; align-items:center; font-size:4em; border:1px solid #ccc; border-radius:10px; margin:auto;">${card.label}${card.suit}</div>`; } drillActualRunningCount += card.pointVal; drillCurrentCardIdx++; drillTimer = setTimeout(() => { if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = ''; flashNextDrillCard(speedMs); }, speedMs); }
    function endFlashDrillSequence() { console.log("SCRIPT DEBUG: Flash Drill sequence ended. Actual RC:", drillActualRunningCount); if (flashDrillCardDisplayAreaEl) flashDrillCardDisplayAreaEl.innerHTML = '<p style="text-align:center; padding-top:70px;">Sequence Complete!</p>'; if (flashDrillInputAreaEl) flashDrillInputAreaEl.style.display = 'block'; if (flashDrillUserCountInputEl) flashDrillUserCountInputEl.focus(); if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = false; drillActive = false; }
    function evaluateFlashDrill() { if (!flashDrillInputAreaEl || flashDrillInputAreaEl.style.display === 'none') return; const userCount = (flashDrillUserCountInputEl && parseInt(flashDrillUserCountInputEl.value)); if (isNaN(userCount)) { if (flashDrillFeedbackEl) { flashDrillFeedbackEl.textContent = "Please enter a valid number."; flashDrillFeedbackEl.className = 'message-wrong visible';} return; } if (flashDrillFeedbackEl) { flashDrillFeedbackEl.classList.add('visible'); if (userCount === drillActualRunningCount) { flashDrillFeedbackEl.textContent = `Correct! Running count was ${drillActualRunningCount}.`; flashDrillFeedbackEl.className = 'message-correct visible'; } else { flashDrillFeedbackEl.textContent = `Incorrect. Your count: ${userCount}. Actual count: ${drillActualRunningCount}.`; flashDrillFeedbackEl.className = 'message-wrong visible'; } } if (startFlashDrillButtonEl) startFlashDrillButtonEl.disabled = false; }

    // =========================================================================
    // 11. SCOREBOARD, MESSAGES, SOUNDS, LOCALSTORAGE
    // =========================================================================
    function updateScoreboardVisuals() { if (scoreEl) scoreEl.textContent = score; if (highscoreEl) highscoreEl.textContent = highScore; }
    function displayMessage(msg, typeClass) {
        if (messageDisplayEl) {
            messageDisplayEl.textContent = msg;
            messageDisplayEl.className = `message-display message-${typeClass || 'info'} visible`; // Add 'visible'
            // Optional: auto-hide message after a few seconds
            // setTimeout(() => { if(messageDisplayEl) messageDisplayEl.classList.remove('visible'); }, 5000);
        }
    }

    function playSound(soundElement) {
        if (soundElement && musicOn) {
            soundElement.currentTime = 0;
            const playPromise = soundElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error playing sound ${soundElement.id}:`, error.message);
                });
            }
        } else if (soundElement && !musicOn) {
            console.log(`playSound: musicOn is false, not playing ${soundElement.id}`);
        } else if (!soundElement) {
            console.warn("playSound: soundElement is null or undefined.");
        }
    }

    function toggleMusic() {
        console.log("toggleMusic called. Current musicOn state (before toggle):", musicOn);
        musicOn = !musicOn;
        console.log("musicOn state (after toggle):", musicOn);
        localStorage.setItem('cardCounterMusicOn', musicOn.toString());
        updateMusicButtonVisuals();

        if (bgMusic) {
            if (musicOn) {
                console.log("Attempting to play background music.");
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log("Background music playback started/resumed.");
                        if (musicToggleBtn) musicToggleBtn.classList.add('on');
                    }).catch(error => {
                        console.warn("Background music playback failed after toggle:", error.message);
                        displayMessage("Music play failed. Browser may need interaction. Try again.", "info");
                        // If play fails, we should ideally revert musicOn state and button
                        // musicOn = false; 
                        // localStorage.setItem('cardCounterMusicOn', musicOn.toString());
                        // updateMusicButtonVisuals(); // Revert button
                    });
                }
            } else {
                console.log("Attempting to pause background music.");
                bgMusic.pause();
                if (musicToggleBtn) musicToggleBtn.classList.remove('on');
                console.log("Background music paused.");
            }
        } else {
            console.warn("bgMusic element not found in toggleMusic function.");
        }
    }

    function updateMusicButtonVisuals() {
        if (musicToggleBtn) {
            musicToggleBtn.textContent = musicOn ? "Music ON" : "Music OFF";
            if (musicOn) {
                musicToggleBtn.classList.add('on');
            } else {
                musicToggleBtn.classList.remove('on');
            }
            console.log("Music button updated. Text:", musicToggleBtn.textContent, "Class 'on':", musicToggleBtn.classList.contains('on'));
        } else {
            console.warn("Music toggle button not found for updating visuals.");
        }
    }

    function saveHighScoreForCurrentLevel() { try { const currentLevel = levelSelectEl && levelSelectEl.value; const currentDeckSize = deckSizeEl && deckSizeEl.value; const system = currentCountingSystem; const gameMode = currentGameMode; if (gameMode === 'guessValue' && currentLevel && currentDeckSize) { localStorage.setItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`, highScore.toString()); } } catch (e) { console.warn("Could not save high score:", e.message); } }
    function loadHighScoreForCurrentLevel() { try { const currentLevel = levelSelectEl && levelSelectEl.value; const currentDeckSize = deckSizeEl && deckSizeEl.value; const system = currentCountingSystem; const gameMode = currentGameMode; if (gameMode === 'guessValue' && currentLevel && currentDeckSize) { const savedScore = localStorage.getItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`); highScore = parseInt(savedScore) || 0; } else { highScore = 0; } } catch (e) { console.warn("Could not load high score:", e.message); highScore = 0; } }
    
    function loadInitialSettings() {
        // Speed
        const savedSpeed = localStorage.getItem('cardCounterSpeed');
        if (savedSpeed !== null) {
            currentCardSpeed = parseFloat(savedSpeed);
            if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
        } else {
            if (levelSelectEl) updateCardSpeedInputFromLevel(); else currentCardSpeed = 5;
        }

        // Music
        musicOn = localStorage.getItem('cardCounterMusicOn') === 'true';
        console.log("loadInitialSettings: Loaded musicOn state as:", musicOn);
        updateMusicButtonVisuals(); // Update button based on loaded state

        if (musicOn && bgMusic) {
            console.log("loadInitialSettings: musicOn is true, attempting to play bgMusic.");
            setTimeout(() => { // Small delay
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log("Background music started based on saved preference (initial load).");
                        if (musicToggleBtn) musicToggleBtn.classList.add('on');
                    }).catch(error => {
                        console.warn("Initial background music autoplay was prevented by browser:", error.message);
                        displayMessage("Music was ON, but autoplay failed. Click button or interact, then try again.", "info");
                        // musicOn = false; // Keep musicOn true, button ON, let user toggle if needed
                        // localStorage.setItem('cardCounterMusicOn', 'false');
                        // updateMusicButtonVisuals();
                    });
                }
            }, 100);
        } else if (!bgMusic) {
            console.warn("loadInitialSettings: bgMusic element not found.");
        } else {
            console.log("loadInitialSettings: musicOn is false, not attempting to play bgMusic initially.");
            if (musicToggleBtn) musicToggleBtn.classList.remove('on');
        }
    }

    // =========================================================================
    // 12. START THE APPLICATION
    // =========================================================================
    loadInitialSettings(); // Music, Speed
    initializeApp();       // Event listeners, Theme, UI, Game State
});
