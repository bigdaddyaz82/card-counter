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
    const currentSystemDisplayEl = document.getElementById('currentSystemDisplay'); // For "Hi-Lo" name
    const currentSystemValuesDisplayEl = document.getElementById('currentSystemValuesDisplay'); // For "Cards 2-6..." description

    const gameModeSelectEl = document.getElementById('gameMode'); // Kept for now, even if only one option
    const mainGameAreaEl = document.getElementById('mainGameArea');
    // Flash Drill elements are removed

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
    let currentGameMode = 'guessValue'; // Default to the only remaining mode
    // Flash Drill state variables are removed

    // =========================================================================
    // 4. INITIALIZATION & SETUP
    // =========================================================================
    function initializeApp() {
        console.log("SCRIPT DEBUG: initializeApp() called.");
        if (levelSelectEl) levelSelectEl.addEventListener('change', handleGameSettingChange);
        if (deckSizeEl) deckSizeEl.addEventListener('change', handleGameSettingChange);
        if (countingSystemSelectEl) countingSystemSelectEl.addEventListener('change', handleGameSystemChange);
        if (gameModeSelectEl) gameModeSelectEl.addEventListener('change', handleGameModeChange);

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
        // setupFlashDrillControls(); // REMOVED
        
        updateCurrentSystemDisplay(); // This will update the #currentSystemDisplay and #currentSystemValuesDisplay
        setupInitialScreen();
        console.log("SCRIPT DEBUG: initializeApp() finished.");
    }

    function setupInitialScreen() {
        console.log("SCRIPT DEBUG: setupInitialScreen called");
        // clearInterval(drillTimer); // REMOVED
        clearInterval(gameTimer); 
        gameActive = false; 
        // drillActive = false; // REMOVED
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

        switchGameModeView(currentGameMode); // Will default to showing mainGameArea
        // Flash Drill UI elements are removed from HTML, so no need to manage them here
    }

    function handleGameSettingChange() { console.log("SCRIPT DEBUG: Game setting changed (level or deck size)"); updateCardSpeedInputFromLevel(); setupInitialScreen(); }
    function handleGameSystemChange() { currentCountingSystem = countingSystemSelectEl.value; console.log("SCRIPT DEBUG: Counting system changed to:", currentCountingSystem); updateCurrentSystemDisplay(); updateHowToPlayModalContent(); setupInitialScreen(); }
    function handleGameModeChange() { 
        if (gameModeSelectEl) { // Check if element exists
            currentGameMode = gameModeSelectEl.value; 
            console.log("SCRIPT DEBUG: Game mode changed to:", currentGameMode); 
        } else {
            currentGameMode = 'guessValue'; // Default if selector is removed
        }
        setupInitialScreen(); 
    }

    function switchGameModeView(mode) { 
        // Since Flash Drill is removed, mainGameArea should always be visible for 'guessValue'
        if (mainGameAreaEl) mainGameAreaEl.style.display = 'block';
        // No flashDrillAreaEl to manage
        if (bettingPracticeSectionEl && mode !== 'guessValue') { 
             bettingPracticeSectionEl.style.display = 'none';
        }
    }

    // =========================================================================
    // 5. THEME TOGGLE (Light/Dark Mode) - NO CHANGES
    // =========================================================================
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
        const bodyIsDarkByDefault = bodyEl.classList.contains('dark-mode');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (bodyIsDarkByDefault) {
            applyTheme('dark');
        } else {
            const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(systemPrefersDark ? 'dark' : 'light');
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
        loadInitialTheme();
    }

    // =========================================================================
    // 6. CARD SPEED & TIMER - NO CHANGES
    // =========================================================================
    function setupCardSpeedControl() { if (!cardSpeedInputEl) return; cardSpeedInputEl.value = currentCardSpeed; cardSpeedInputEl.addEventListener('input', () => { let speedVal = parseFloat(cardSpeedInputEl.value); if (isNaN(speedVal) || speedVal < 0.5) speedVal = 0.5; if (speedVal > 600) speedVal = 600; currentCardSpeed = speedVal; localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); if (!gameActive && currentGameMode === 'guessValue') { updateTimerDisplayVisuals(); } }); if (levelSelectEl) updateCardSpeedInputFromLevel(); }
    function updateCardSpeedInputFromLevel() { if(!levelSelectEl) return; const currentLevel = levelSelectEl.value; currentCardSpeed = levelDefaultTimes[currentLevel] || 5; if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed; localStorage.setItem('cardCounterSpeed', currentCardSpeed.toString()); if (!gameActive && currentGameMode === 'guessValue') updateTimerDisplayVisuals(); }
    function updateTimerDisplayVisuals() { if (!timerDisplayEl || currentGameMode !== 'guessValue') return; const isPractice = levelSelectEl && levelSelectEl.value === "practice"; if (isPractice || currentCardSpeed >= 600) { timerDisplayEl.textContent = "Time: ∞"; } else { timerDisplayEl.textContent = `Time: ${currentCardSpeed}s`; } }
    function startRoundTimer() { if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return; clearInterval(gameTimer); const isPractice = levelSelectEl && levelSelectEl.value === "practice"; if (isPractice || currentCardSpeed >= 600) { if (timerDisplayEl) timerDisplayEl.textContent = "Time: ∞"; return; } timeLeft = currentCardSpeed; if (timerDisplayEl) timerDisplayEl.textContent = `Time: ${timeLeft}s`; gameTimer = setInterval(() => { if (gamePausedForBetting) { clearInterval(gameTimer); return; } timeLeft--; if (timerDisplayEl) timerDisplayEl.textContent = `Time: ${timeLeft}s`; if (timeLeft <= 0) { clearInterval(gameTimer); playSound(wrongSound); sessionTotalCardsDealt++; updateAccuracyDisplay(); gameOver(`Time's up! RC: ${runningCount}`); } }, 1000); }

    // =========================================================================
    // 7. HOW TO PLAY & BASIC STRATEGY MODALS - NO CHANGES
    // =========================================================================
    function setupHowToPlayModal() { if (!howToPlayButtonEl || !howToPlayModalEl || !closeHowToPlayModalButtonEl) return; updateHowToPlayModalContent(); howToPlayButtonEl.addEventListener('click', () => { updateHowToPlayModalContent(); if (howToPlayModalEl) howToPlayModalEl.style.display = 'flex'; if(howToPlayModalEl) howToPlayModalEl.classList.add('active'); }); closeHowToPlayModalButtonEl.addEventListener('click', () => { if (howToPlayModalEl) howToPlayModalEl.style.display = 'none'; if(howToPlayModalEl) howToPlayModalEl.classList.remove('active'); }); window.addEventListener('click', (event) => { if (event.target === howToPlayModalEl) { if (howToPlayModalEl) howToPlayModalEl.style.display = 'none'; if(howToPlayModalEl) howToPlayModalEl.classList.remove('active');} }); }
    function updateHowToPlayModalContent() { if (!howToPlayContentEl) return; const systemData = countingSystemsData[currentCountingSystem]; if (systemData) { howToPlayContentEl.innerHTML = `<h2>How to Play: ${systemData.name}</h2>${systemData.howToPlay}`; } else { howToPlayContentEl.innerHTML = `<p>Select a counting system to see instructions.</p>`; } }
    function setupBasicStrategyModal() { if (!basicStrategyButtonEl || !basicStrategyModalEl || !closeBasicStrategyModalButtonEl) return; basicStrategyButtonEl.addEventListener('click', () => { generateBasicStrategyChartHTML(); if (basicStrategyModalEl) basicStrategyModalEl.style.display = 'flex'; if(basicStrategyModalEl) basicStrategyModalEl.classList.add('active'); }); closeBasicStrategyModalButtonEl.addEventListener('click', () => { if (basicStrategyModalEl) basicStrategyModalEl.style.display = 'none'; if(basicStrategyModalEl) basicStrategyModalEl.classList.remove('active'); }); window.addEventListener('click', (event) => { if (event.target === basicStrategyModalEl) { if (basicStrategyModalEl) basicStrategyModalEl.style.display = 'none'; if(basicStrategyModalEl) basicStrategyModalEl.classList.remove('active'); } }); }
    const basicStrategyData = { hardTotals:{"17+":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"16":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"15":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"14":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"13":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"12":{2:"H",3:"H",4:"S",5:"S",6:"S",7:"H",8:"H",9:"H",T:"H",A:"H"},"11":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"D",A:"H"},"10":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"H",A:"H"},"9":{2:"H",3:"D",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"5-8":{2:"H",3:"H",4:"H",5:"H",6:"H",7:"H",8:"H",9:"H",T:"H",A:"H"}},softTotals:{"A,9":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"A,8":{2:"S",3:"S",4:"S",5:"S",6:"DS",7:"S",8:"S",9:"S",T:"S",A:"S"},"A,7":{2:"DS",3:"DS",4:"DS",5:"DS",6:"DS",7:"S",8:"S",9:"H",T:"H",A:"H"},"A,6":{2:"H",3:"D",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,5":{2:"H",3:"H",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,4":{2:"H",3:"H",4:"D",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,3":{2:"H",3:"H",4:"H",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"},"A,2":{2:"H",3:"H",4:"H",5:"D",6:"D",7:"H",8:"H",9:"H",T:"H",A:"H"}},pairs:{"A,A":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"P",9:"P",T:"P",A:"P"},"T,T":{2:"S",3:"S",4:"S",5:"S",6:"S",7:"S",8:"S",9:"S",T:"S",A:"S"},"9,9":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"S",8:"P",9:"P",T:"S",A:"S"},"8,8":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"P",9:"P",T:"P",A:"P"},"7,7":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"},"6,6":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"H",8:"H",9:"H",T:"H",A:"H"},"5,5":{2:"D",3:"D",4:"D",5:"D",6:"D",7:"D",8:"D",9:"D",T:"H",A:"H"},"4,4":{2:"H",3:"H",4:"H",5:"P",6:"P",7:"H",8:"H",9:"H",T:"H",A:"H"},"3,3":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"},"2,2":{2:"P",3:"P",4:"P",5:"P",6:"P",7:"P",8:"H",9:"H",T:"H",A:"H"}},legend:"H: Hit, S: Stand, D: Double (if not allowed, Hit), DS: Double (if not allowed, Stand), P: Split" };
    function generateBasicStrategyChartHTML() { if (!basicStrategyChartContainerEl) return; let html = `<p><strong>Legend:</strong> ${basicStrategyData.legend}</p>`; const dealerRow = "<th>Player</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10/A</th><th>Ace</th>"; function createTable(title, data) { let tableHTML = `<h3>${title}</h3><table><thead><tr>${dealerRow}</tr></thead><tbody>`; for (const playerHand in data) { tableHTML += `<tr><td><strong>${playerHand}</strong></td>`; const decisions = data[playerHand]; const dealerCardsOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"]; dealerCardsOrder.forEach(dealerCard => { tableHTML += `<td>${decisions[dealerCard] || '-'}</td>`; }); tableHTML += `</tr>`; } tableHTML += `</tbody></table>`; return tableHTML; } html += createTable("Hard Totals", basicStrategyData.hardTotals); html += createTable("Soft Totals", basicStrategyData.softTotals); html += createTable("Pairs", basicStrategyData.pairs); basicStrategyChartContainerEl.innerHTML = html; }

    // =========================================================================
    // 8. BETTING PRACTICE - Contains DEBUG LOGS
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
        if (currentGameMode !== 'guessValue' || (levelSelectEl && levelSelectEl.value === "practice")) {
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
        if (gameActive && currentGameMode === 'guessValue') { 
           dealNewCard();
        } else if (!gameActive && currentGameMode === 'guessValue') {
           displayMessage("Betting practice ended. Start a new shoe to continue.", "info");
        }
    }

    // =========================================================================
    // 9. CORE GAME LOGIC ("Guess Card Value" mode) - NO CHANGES
    // =========================================================================
    function updateAccuracyDisplay() {
        if (!accuracyDisplayEl) return;
        if (sessionTotalCardsDealt === 0) {
            accuracyDisplayEl.textContent = "Accuracy: N/A";
        } else {
            const accuracy = (sessionCorrectGuesses / sessionTotalCardsDealt) * 100;
            accuracyDisplayEl.textContent = `Accuracy: ${accuracy.toFixed(1)}% (${sessionCorrectGuesses}/${sessionTotalCardsDealt})`;
        }
    }
    function resetSessionStats() {
        sessionCorrectGuesses = 0;
        sessionTotalCardsDealt = 0;
        updateAccuracyDisplay();
    }
    function updateCurrentSystemDisplay() { 
        if (currentSystemDisplayEl && countingSystemsData[currentCountingSystem]) {
             currentSystemDisplayEl.textContent = countingSystemsData[currentCountingSystem].name;
        }
        if (currentSystemValuesDisplayEl && countingSystemsData[currentCountingSystem]) {
            // If description contains HTML, use innerHTML. Otherwise, textContent is safer.
            // For your specific case, description is plain text.
            currentSystemValuesDisplayEl.textContent = countingSystemsData[currentCountingSystem].description; 
        }
    }
    function buildShoe() { console.log("SCRIPT DEBUG: buildShoe for system:", currentCountingSystem); const numDecks = (deckSizeEl && parseInt(deckSizeEl.value)) || 1; gameShoe = []; const systemValues = countingSystemsData[currentCountingSystem].values; for (let i = 0; i < numDecks; i++) { cardLabels.forEach(label => { const baseVal = cardBaseValues[label]; const pointVal = systemValues[baseVal] !== undefined ? systemValues[baseVal] : systemValues[label]; suits.forEach(suit => { gameShoe.push({ label, suit, pointVal, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' }); }); }); } totalCardsInShoe = gameShoe.length; cardsDealtInShoe = 0; for (let i = gameShoe.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [gameShoe[i], gameShoe[j]] = [gameShoe[j], gameShoe[i]]; } console.log(`SCRIPT DEBUG: Shoe built with ${totalCardsInShoe} cards.`); }
    function handleUserChoice(choice) { if (currentGameMode !== 'guessValue') return; if (!gameActive && !gamePausedForBetting) { startNewGame(); return; } if (gameActive && !gamePausedForBetting) { processGuess(choice); } }
    function startNewGame() { if (currentGameMode !== 'guessValue') { displayMessage("Switch to 'Guess Card Value' mode to start this game.", "info"); return; } console.log("SCRIPT DEBUG: startNewGame (Guess Card Value mode)"); clearInterval(gameTimer); gameActive = true; gamePausedForBetting = false; score = 0; runningCount = 0; trueCount = 0; resetSessionStats(); buildShoe(); loadHighScoreForCurrentLevel(); updateScoreboardVisuals(); updateAllCountVisuals(); updateCurrentSystemDisplay(); displayMessage("Shoe ready. Good luck!", "info"); dealNewCard(); }
    function processGuess(userChoice) { if (!currentCard || !gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return; clearInterval(gameTimer); sessionTotalCardsDealt++; let expectedValue; if (userChoice === 'plus') expectedValue = 1; else if (userChoice === 'minus') expectedValue = -1; else expectedValue = 0; if (expectedValue === currentCard.pointVal) { score++; sessionCorrectGuesses++; runningCount += currentCard.pointVal; displayMessage("Correct!", "correct"); playSound(correctSound); if (score > highScore) { highScore = score; saveHighScoreForCurrentLevel(); } updateScoreboardVisuals(); updateAllCountVisuals(); updateAccuracyDisplay(); if (sessionTotalCardsDealt > 0 && sessionTotalCardsDealt % CARDS_BETWEEN_BETS === 0 && (levelSelectEl && levelSelectEl.value !== "practice")) { triggerBettingPractice(); } else { dealNewCard(); } } else { playSound(wrongSound); updateAccuracyDisplay(); gameOver(`Wrong guess! Card ${currentCard.label}${currentCard.suit} is ${currentCard.pointVal > 0 ? '+' : ''}${currentCard.pointVal} for ${countingSystemsData[currentCountingSystem].name}. RC: ${runningCount}`); } }
    function dealNewCard() { if (!gameActive || gamePausedForBetting || currentGameMode !== 'guessValue') return; if (gameShoe.length === 0 || cardsDealtInShoe >= totalCardsInShoe * SHUFFLE_PENETRATION) { const penetrationPercent = totalCardsInShoe > 0 ? ((cardsDealtInShoe/totalCardsInShoe)*100).toFixed(0) : 0; displayMessage(`Shuffle time! Penetration: ${penetrationPercent}%. Starting new shoe.`, "info"); setTimeout(() => { if (gameActive && currentGameMode === 'guessValue') startNewGame(); }, 2000); return; } currentCard = gameShoe.pop(); cardsDealtInShoe++; updateAllCountVisuals(); animateCardFlip(); }
    function updateAllCountVisuals() { if (runningCountDisplayEl) runningCountDisplayEl.textContent = `Running Count: ${runningCount}`; const decksRemaining = Math.max(0.01, (totalCardsInShoe - cardsDealtInShoe) / 52); if (currentCountingSystem === 'hi-lo' && totalCardsInShoe > 0) { trueCount = runningCount / decksRemaining; let trueCountText = "0.0"; if (isFinite(trueCount)) trueCountText = trueCount.toFixed(1); else if (trueCount === Infinity) trueCountText = "Very High+"; else if (trueCount === -Infinity) trueCountText = "Very Low-"; if (trueCountDisplayEl) { trueCountDisplayEl.textContent = `True Count: ${trueCountText}`; trueCountDisplayEl.style.display = 'block'; } } else if (trueCountDisplayEl) { trueCountDisplayEl.textContent = 'True Count: N/A'; trueCountDisplayEl.style.display = currentCountingSystem === 'ko' ? 'none' : 'block'; } if (deckInfoDisplayEl) deckInfoDisplayEl.textContent = `Shoe: ${cardsDealtInShoe}/${totalCardsInShoe} cards (${decksRemaining.toFixed(1)} decks left)`; }
    
    function animateCardFlip() {
        if (!currentCard || !cardContainerEl || !cardFrontEl || !cardBackEl) {
            console.warn("animateCardFlip: Missing DOM elements or currentCard.");
            if (gameActive) gameOver("Error displaying card."); 
            return;
        }
        cardFrontEl.textContent = `${currentCard.label}${currentCard.suit}`;
        cardFrontEl.className = 'card-face card-front'; 
        if (currentCard.color === 'red') {
            cardFrontEl.classList.add('red-card'); 
        } else {
            cardFrontEl.classList.add('black-card'); 
        }
        cardBackEl.textContent = '?';
        cardContainerEl.classList.remove('flipping'); 
        void cardContainerEl.offsetWidth; 
        cardContainerEl.classList.add('flipping'); 
        if (gameActive && !gamePausedForBetting && currentGameMode === 'guessValue') {
            startRoundTimer();
        }
    }
    function gameOver(reason) { clearInterval(gameTimer); gameActive = false; displayMessage(`${reason}. Score: ${score}. Click 'New Shoe / Start Game' or a value to play again.`, "wrong"); }

    // Flash Drill Logic has been REMOVED

    // =========================================================================
    // 11. SCOREBOARD, MESSAGES, SOUNDS, LOCALSTORAGE - NO CHANGES
    // =========================================================================
    function updateScoreboardVisuals() { if (scoreEl) scoreEl.textContent = score; if (highscoreEl) highscoreEl.textContent = highScore; }
    function displayMessage(msg, typeClass) {
        if (messageDisplayEl) {
            messageDisplayEl.textContent = msg;
            messageDisplayEl.className = `message-display message-${typeClass || 'info'} visible`;
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
        } else if (soundElement && !musicOn) {} else if (!soundElement) {
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
                    }).catch(error => {
                        console.warn("Background music playback failed after toggle:", error.message);
                        displayMessage("Music play failed. Browser may need interaction.", "info");
                    });
                }
            } else {
                console.log("Attempting to pause background music.");
                bgMusic.pause();
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
        } else {
            console.warn("Music toggle button not found for updating visuals.");
        }
    }
    function saveHighScoreForCurrentLevel() { try { const currentLevel = levelSelectEl && levelSelectEl.value; const currentDeckSize = deckSizeEl && deckSizeEl.value; const system = currentCountingSystem; const gameMode = currentGameMode; if (gameMode === 'guessValue' && currentLevel && currentDeckSize) { localStorage.setItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`, highScore.toString()); } } catch (e) { console.warn("Could not save high score:", e.message); } }
    function loadHighScoreForCurrentLevel() { try { const currentLevel = levelSelectEl && levelSelectEl.value; const currentDeckSize = deckSizeEl && deckSizeEl.value; const system = currentCountingSystem; const gameMode = currentGameMode; if (gameMode === 'guessValue' && currentLevel && currentDeckSize) { const savedScore = localStorage.getItem(`cardCounterHighScore_${system}_${gameMode}_${currentLevel}_${currentDeckSize}`); highScore = parseInt(savedScore) || 0; } else { highScore = 0; } } catch (e) { console.warn("Could not load high score:", e.message); highScore = 0; } }
    
    function loadInitialSettings() {
        const savedSpeed = localStorage.getItem('cardCounterSpeed');
        if (savedSpeed !== null) {
            currentCardSpeed = parseFloat(savedSpeed);
            if (cardSpeedInputEl) cardSpeedInputEl.value = currentCardSpeed;
        } else {
            if (levelSelectEl) updateCardSpeedInputFromLevel(); else currentCardSpeed = 5;
        }
        musicOn = localStorage.getItem('cardCounterMusicOn') === 'true';
        updateMusicButtonVisuals();
        if (musicOn && bgMusic) {
            setTimeout(() => { 
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {}).catch(error => {
                        console.warn("Initial background music autoplay was prevented by browser:", error.message);
                        displayMessage("Music was ON, but autoplay failed. Click button or interact.", "info");
                    });
                }
            }, 100);
        } else if (!bgMusic) {
            console.warn("loadInitialSettings: bgMusic element not found.");
        }
    }

    // =========================================================================
    // 12. START THE APPLICATION
    // =========================================================================
    loadInitialSettings();
    initializeApp();
    console.log("SCRIPT DEBUG: Script execution finished at bottom.");
});
