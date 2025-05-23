document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const levelSelect = document.getElementById('level');
    const deckSizeSelect = document.getElementById('deckSize');
    const cardSpeedInput = document.getElementById('cardSpeed');
    const systemSelect = document.getElementById('countingSystem');
    const howToPlayButton = document.getElementById('howToPlayButton');
    const basicStrategyButton = document.getElementById('basicStrategyButton');
    const musicToggleButton = document.getElementById('musicToggle');
    const newShoeButton = document.getElementById('newShoeButton');
    const gameModeSelect = document.getElementById('gameMode');

    const mainGameArea = document.getElementById('mainGameArea');
    const timerDisplay = document.getElementById('timerDisplay');
    const cardContainer = document.getElementById('cardContainer');
    const cardFront = cardContainer.querySelector('.card-front');
    const cardBack = cardContainer.querySelector('.card-back');
    const runningCountDisplay = document.getElementById('runningCountDisplay');
    const trueCountDisplay = document.getElementById('trueCountDisplay');
    const deckInfoDisplay = document.getElementById('deckInfoDisplay');
    const currentSystemDisplay = document.getElementById('currentSystemDisplay');
    const currentSystemValuesDisplay = document.getElementById('currentSystemValuesDisplay');
    const actionButtons = document.querySelectorAll('.action-buttons button');

    const flashDrillArea = document.getElementById('flashDrillArea');
    const flashDrillNumCardsInput = document.getElementById('flashDrillNumCards');
    const flashDrillSpeedInput = document.getElementById('flashDrillSpeed');
    const startFlashDrillButton = document.getElementById('startFlashDrillButton');
    const flashDrillCardDisplayArea = document.getElementById('flashDrillCardDisplayArea');
    const flashDrillInputArea = document.getElementById('flashDrillInputArea');
    const flashDrillUserCountInput = document.getElementById('flashDrillUserCount');
    const submitFlashDrillCountButton = document.getElementById('submitFlashDrillCountButton');
    const flashDrillFeedback = document.getElementById('flashDrillFeedback');

    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('highscore');
    const accuracyDisplay = document.getElementById('accuracyDisplay');

    const bettingPracticeSection = document.getElementById('bettingPracticeSection');
    const bettingTrueCountDisplay = document.getElementById('bettingTrueCountDisplay');
    const betMinButton = document.getElementById('betMinButton');
    const betMidButton = document.getElementById('betMidButton');
    const betMaxButton = document.getElementById('betMaxButton');
    const bettingFeedback = document.getElementById('bettingFeedback');
    const continueDealingButton = document.getElementById('continueDealingButton');

    const messageDisplay = document.getElementById('messageDisplay');

    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');
    const bgMusic = document.getElementById('bgMusic');

    const howToPlayModal = document.getElementById('howToPlayModal');
    const closeHowToPlayModalButton = document.getElementById('closeHowToPlayModalButton');
    const howToPlayContent = document.getElementById('howToPlayContent');
    const basicStrategyModal = document.getElementById('basicStrategyModal');
    const closeBasicStrategyModalButton = document.getElementById('closeBasicStrategyModalButton');
    const basicStrategyChartContainer = document.getElementById('basicStrategyChartContainer');

    // --- Game State Variables ---
    let shoe = [];
    let currentCard = null;
    let runningCount = 0;
    let trueCount = 0;
    let cardsDealt = 0;
    let totalShoeCards = 0;
    let gameTimerInterval;
    let timeLeft = 0;
    let score = 0;
    let highscore = localStorage.getItem('cardCounterHighScore') || 0;
    let correctGuesses = 0;
    let totalAttempts = 0;
    let gameActive = false;
    let musicPlaying = false;
    let currentCountingSystem = 'hi-lo';
    let flashDrillActive = false;
    let flashDrillActualCount = 0;

    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const cardHtmlValues = { 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A', '10': '10', '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2' };


    const countingSystems = {
        'hi-lo': {
            name: 'Hi-Lo',
            values: { '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 0, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1 },
            description: "+1 (2-6), 0 (7-9), -1 (10-A, K, Q, J)"
        },
        'ko': {
            name: 'KO (Rookie)',
            values: { '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1 }, // KO values
            description: "+1 (2-7), 0 (8-9), -1 (10-A, K, Q, J)" // Check KO definition for 7
        }
        // Add other systems here
    };

    const gameLevels = {
        practice: { time: Infinity, name: "Practice" },
        beginner: { time: 15, name: "Beginner" },
        advanced: { time: 10, name: "Advanced" },
        expert: { time: 5, name: "Expert" }
    };

    // --- Initialization ---
    function init() {
        updateTheme(localStorage.getItem('theme') || 'dark');
        highScoreDisplay.textContent = highscore;
        updateSystemInfoDisplay();
        populateHowToPlayModal();
        populateBasicStrategyChart(); // Call this to generate chart on load
        updateScoreboard(); // Initialize scoreboard display

        // Event Listeners
        themeToggle.addEventListener('click', toggleTheme);
        newShoeButton.addEventListener('click', startNewGame);
        musicToggleButton.addEventListener('click', toggleMusic);
        levelSelect.addEventListener('change', updateGameSettings);
        deckSizeSelect.addEventListener('change', updateGameSettings);
        cardSpeedInput.addEventListener('change', updateGameSettings);
        systemSelect.addEventListener('change', () => {
            currentCountingSystem = systemSelect.value;
            updateSystemInfoDisplay();
            populateHowToPlayModal(); // Update modal content for new system
            // If a game is active, you might want to reset counts or warn the user
            if (gameActive || shoe.length > 0) {
                resetCounts(); // Reset counts when system changes mid-shoe
                updateCountDisplays();
            }
        });

        actionButtons.forEach(button => {
            button.addEventListener('click', () => handleGuess(button.dataset.choice));
        });

        howToPlayButton.addEventListener('click', () => howToPlayModal.style.display = 'block');
        closeHowToPlayModalButton.addEventListener('click', () => howToPlayModal.style.display = 'none');
        basicStrategyButton.addEventListener('click', () => basicStrategyModal.style.display = 'block');
        closeBasicStrategyModalButton.addEventListener('click', () => basicStrategyModal.style.display = 'none');
        window.addEventListener('click', (event) => { // Close modal if clicked outside
            if (event.target === howToPlayModal) howToPlayModal.style.display = 'none';
            if (event.target === basicStrategyModal) basicStrategyModal.style.display = 'none';
        });

        gameModeSelect.addEventListener('change', switchGameMode);

        startFlashDrillButton.addEventListener('click', startFlashDrill);
        submitFlashDrillCountButton.addEventListener('click', handleSubmitFlashDrillCount);

        // Betting practice (simplified)
        betMinButton.addEventListener('click', () => checkBet('min'));
        betMidButton.addEventListener('click', () => checkBet('mid'));
        betMaxButton.addEventListener('click', () => checkBet('max'));
        continueDealingButton.addEventListener('click', () => {
            bettingPracticeSection.style.display = 'none';
            if (gameActive && shoe.length > 0) {
                 displayNewCard();
            } else if (gameActive && shoe.length === 0){
                showMessage("Shoe finished. Start a new shoe.", "info");
            }
        });

        updateMessageDisplay("Select settings and click 'New Shoe / Start Game'", "info");
        switchGameMode(); // Initialize view based on default game mode
    }

    // --- Theme Management ---
    function updateTheme(theme) {
        document.body.className = theme + '-mode';
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }

    function toggleTheme() {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        updateTheme(newTheme);
    }

    // --- Game Settings Update ---
    function updateGameSettings() {
        if (gameActive) {
            showMessage("Game settings changed. Restarting shoe.", "info");
            startNewGame(); // Restart if settings change mid-game
        } else {
             // If no game active, just update visuals or prepare for next game
            timeLeft = gameLevels[levelSelect.value].time;
            timerDisplay.textContent = levelSelect.value === 'practice' ? `Time: ∞` : `Time: ${timeLeft}s`;
        }
    }

    // --- Music ---
    function toggleMusic() {
        if (musicPlaying) {
            bgMusic.pause();
            musicToggleButton.textContent = 'Music OFF';
        } else {
            bgMusic.play().catch(e => console.warn("Music play failed:", e)); // Autoplay can be blocked
            musicToggleButton.textContent = 'Music ON';
        }
        musicPlaying = !musicPlaying;
    }

    // --- Deck Creation and Management ---
    function createShoe(numDecks) {
        shoe = [];
        for (let i = 0; i < numDecks; i++) {
            for (const suit of suits) {
                for (const value of values) {
                    shoe.push({ value, suit });
                }
            }
        }
        shuffleShoe();
        totalShoeCards = shoe.length;
    }

    function shuffleShoe() {
        for (let i = shoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
        }
    }

    function dealCard() {
        if (shoe.length > 0) {
            cardsDealt++;
            return shoe.pop();
        }
        return null; // No cards left
    }

    function getCardDisplayHTML(card) {
        if (!card) return "";
        const isRed = card.suit === '♥' || card.suit === '♦';
        return `
            <div class="value">${cardHtmlValues[card.value]}</div>
            <div class="suit">${card.suit}</div>
        `;
    }
    
    // --- Counting Logic ---
    function getCardCountValue(card) {
        if (!card) return 0;
        return countingSystems[currentCountingSystem].values[card.value] || 0;
    }

    function updateCounts(cardValue) {
        runningCount += cardValue;
        calculateTrueCount();
    }

    function calculateTrueCount() {
        const decksRemaining = (totalShoeCards - cardsDealt) / 52;
        if (decksRemaining > 0) {
            trueCount = runningCount / decksRemaining;
        } else {
            trueCount = 0; // Or handle as infinity/undefined if preferred
        }
    }

    function resetCounts() {
        runningCount = 0;
        trueCount = 0;
        // cardsDealt and totalShoeCards are reset with new shoe
    }

    // --- UI Updates ---
    function updateCountDisplays() {
        runningCountDisplay.textContent = `Running Count: ${runningCount}`;
        trueCountDisplay.textContent = `True Count: ${trueCount.toFixed(1)}`;
    }

    function updateDeckInfoDisplay() {
        const decksRemaining = ((totalShoeCards - cardsDealt) / 52).toFixed(1);
        deckInfoDisplay.textContent = `Shoe: ${cardsDealt}/${totalShoeCards} cards (${decksRemaining} decks left)`;
    }

    function updateScoreboard() {
        scoreDisplay.textContent = score;
        highScoreDisplay.textContent = highscore;
        if (totalAttempts > 0) {
            const acc = (correctGuesses / totalAttempts) * 100;
            accuracyDisplay.textContent = `${acc.toFixed(1)}%`;
        } else {
            accuracyDisplay.textContent = 'N/A';
        }
    }

    function updateSystemInfoDisplay() {
        const system = countingSystems[currentCountingSystem];
        currentSystemDisplay.textContent = system.name;
        currentSystemValuesDisplay.textContent = system.description;
    }

    function showMessage(text, type = 'info') { // types: info, success, error
        messageDisplay.textContent = text;
        messageDisplay.className = `message-display message-${type}`;
    }

    function renderCardFront(card) {
        if (card) {
            cardFront.innerHTML = getCardDisplayHTML(card);
            const isRed = card.suit === '♥' || card.suit === '♦';
            cardFront.className = 'card-face card-front ' + (isRed ? 'red' : 'black');
        } else {
            cardFront.innerHTML = '';
            cardFront.className = 'card-face card-front';
        }
    }

    // --- Game Flow: Guess Card Value Mode ---
    function startNewGame() {
        gameActive = true;
        flashDrillActive = false;
        bettingPracticeSection.style.display = 'none'; // Hide betting
        continueDealingButton.style.display = 'none';
        
        createShoe(parseInt(deckSizeSelect.value));
        cardsDealt = 0;
        resetCounts();
        // score = 0; // Reset score for new game, or keep for session? Let's reset for new game.
        // correctGuesses = 0; // Reset accuracy for new game
        // totalAttempts = 0; // Reset accuracy for new game

        updateCountDisplays();
        updateDeckInfoDisplay();
        updateScoreboard(); // update score after reset
        showMessage("New shoe started. Good luck!", "success");
        
        if (gameModeSelect.value === "guessValue") {
             displayNewCard();
        } else {
            // If in flash drill mode, starting new shoe doesn't auto-start drill
            showMessage("New shoe created. Start drill when ready.", "info");
        }
    }

    function displayNewCard() {
        if (!gameActive || flashDrillActive) return;

        currentCard = dealCard();
        if (currentCard) {
            cardContainer.classList.remove('flipped');
            renderCardFront(currentCard); // Pre-render for flip

            // Set timer based on level, cardSpeedInput is for "practice" or if we want to override level
            const selectedLevel = levelSelect.value;
            if (selectedLevel === 'practice') {
                timeLeft = parseFloat(cardSpeedInput.value);
                timerDisplay.textContent = `Time: ${timeLeft.toFixed(1)}s`;
            } else {
                timeLeft = gameLevels[selectedLevel].time;
                timerDisplay.textContent = `Time: ${timeLeft}s`;
            }
            
            actionButtons.forEach(b => b.disabled = false);

            // Short delay before flipping to show back
            setTimeout(() => {
                cardContainer.classList.add('flipped');
                startCardTimer();
            }, 100); // Small delay to ensure back is seen

        } else {
            endShoe();
        }
    }
    
    function startCardTimer() {
        clearInterval(gameTimerInterval);
        const maxTime = levelSelect.value === 'practice' ? parseFloat(cardSpeedInput.value) : gameLevels[levelSelect.value].time;
        let currentTime = maxTime;

        if (levelSelect.value !== 'practice') {
            timerDisplay.textContent = `Time: ${currentTime}s`;
            gameTimerInterval = setInterval(() => {
                currentTime--;
                timerDisplay.textContent = `Time: ${currentTime}s`;
                if (currentTime <= 0) {
                    clearInterval(gameTimerInterval);
                    handleTimeout();
                }
            }, 1000);
        } else {
             timerDisplay.textContent = `Time: ${maxTime.toFixed(1)}s (Practice)`; // Or just ∞
             // No auto-timeout in practice with cardSpeedInput, user controls pace
        }
    }

    function handleTimeout() {
        if (!currentCard) return; // Card already processed
        
        playSound(wrongSound);
        showMessage("Time's up!", "error");
        totalAttempts++;
        // Don't update counts, card wasn't "guessed"
        // but we need to process it for the shoe to continue
        const actualCardValue = getCardCountValue(currentCard);
        updateCounts(actualCardValue); // Silently update counts
        updateCountDisplays();
        updateDeckInfoDisplay();
        updateScoreboard();
        
        currentCard = null; // Mark card as processed
        actionButtons.forEach(b => b.disabled = true);

        // Check for betting practice trigger
        if (shouldTriggerBettingPractice()) {
            triggerBettingPractice();
        } else {
             setTimeout(displayNewCard, 1500); // Delay before next card
        }
    }

    function handleGuess(choice) {
        if (!currentCard || !gameActive || flashDrillActive) return;

        clearInterval(gameTimerInterval); // Stop timer on guess
        actionButtons.forEach(b => b.disabled = true);

        const actualCardValue = getCardCountValue(currentCard);
        let guessedValue;
        if (choice === 'plus') guessedValue = 1;
        else if (choice === 'zero') guessedValue = 0;
        else guessedValue = -1;

        totalAttempts++;
        if (actualCardValue === guessedValue) {
            score++;
            correctGuesses++;
            playSound(correctSound);
            showMessage("Correct!", "success");
        } else {
            score--;
            playSound(wrongSound);
            showMessage(`Incorrect. Card was ${actualCardValue > 0 ? '+' : ''}${actualCardValue}.`, "error");
        }

        if (score > highscore) {
            highscore = score;
            localStorage.setItem('cardCounterHighScore', highscore);
        }

        updateCounts(actualCardValue); // Update counts with the actual card value
        updateCountDisplays();
        updateDeckInfoDisplay();
        updateScoreboard();
        currentCard = null; // Mark card as processed

        // Check for betting practice trigger
        if (shouldTriggerBettingPractice()) {
            triggerBettingPractice();
        } else {
            setTimeout(displayNewCard, 1000); // Delay before next card
        }
    }
    
    function endShoe() {
        gameActive = false;
        clearInterval(gameTimerInterval);
        showMessage("Shoe finished! Start a new shoe or change settings.", "info");
        actionButtons.forEach(b => b.disabled = true);
        cardContainer.classList.remove('flipped'); // Show back of card
        // Optionally, trigger betting practice one last time if desired
    }

    // --- Game Mode Switching ---
    function switchGameMode() {
        const mode = gameModeSelect.value;
        clearInterval(gameTimerInterval); // Stop any active timers

        if (mode === "guessValue") {
            mainGameArea.style.display = "block";
            flashDrillArea.style.display = "none";
            gameActive = true; // Or re-evaluate based on if shoe exists
            flashDrillActive = false;
            if (shoe.length === 0 || cardsDealt === totalShoeCards) {
                 showMessage("Switched to Guess Value. Start a new shoe.", "info");
            } else {
                // Resume existing game?
                showMessage("Switched to Guess Value. Continue or start new shoe.", "info");
                // displayNewCard(); // Potentially display next card from existing shoe
            }
        } else if (mode === "flashDrill") {
            mainGameArea.style.display = "none";
            flashDrillArea.style.display = "block";
            gameActive = false; // Main game is paused
            flashDrillActive = true;
            flashDrillInputArea.style.display = "none";
            flashDrillFeedback.textContent = "";
            showMessage("Switched to Flashing Cards Drill. Configure and start.", "info");
        }
    }

    // --- Flashing Cards Drill Logic ---
    async function startFlashDrill() {
        if (!shoe || shoe.length < parseInt(flashDrillNumCardsInput.value)) {
            showMessage("Not enough cards in shoe for drill. Start a new shoe.", "error");
            if (confirm("Start a new shoe for the drill?")) {
                startNewGame(); // This will create a shoe
                // Then try to start drill again after a delay or user action
                setTimeout(() => {
                     if (shoe.length >= parseInt(flashDrillNumCardsInput.value)) {
                        startFlashDrillInternal();
                     }
                }, 500);
            }
            return;
        }
        startFlashDrillInternal();
    }
    
    async function startFlashDrillInternal() {
        flashDrillActive = true;
        gameActive = false; // Ensure main game logic is paused
        flashDrillInputArea.style.display = "none";
        flashDrillFeedback.textContent = "Drill starting...";
        startFlashDrillButton.disabled = true;
        submitFlashDrillCountButton.disabled = true;
        flashDrillUserCountInput.value = "";
        mainGameArea.style.display = "none"; // Ensure main game is hidden

        const numCardsToFlash = parseInt(flashDrillNumCardsInput.value);
        const speedPerCard = parseFloat(flashDrillSpeedInput.value) * 1000; // in ms
        
        flashDrillActualCount = 0;
        let flashedCardsCount = 0;

        // Use a temporary card display area for the drill
        flashDrillCardDisplayArea.innerHTML = `<div class="card-face card-back" style="display:flex; justify-content:center; align-items:center; font-size:2em;">?</div>`; // Initial back

        // Create a temporary copy of part of the shoe for the drill without affecting main shoe
        // Or, deal cards from the main shoe if that's intended
        let drillDeck = shoe.slice(-numCardsToFlash); // Take from end for pop like behavior
        if (shoe.length < numCardsToFlash) {
            showMessage("Not enough cards for the drill. Create a larger shoe or reduce drill cards.", "error");
            startFlashDrillButton.disabled = false;
            return;
        }


        for (let i = 0; i < numCardsToFlash; i++) {
            if (shoe.length === 0) {
                flashDrillFeedback.textContent = "Ran out of cards in shoe during drill.";
                break;
            }
            const card = dealCard(); // This removes card from main shoe
            if (!card) break;

            flashDrillActualCount += getCardCountValue(card);
            flashedCardsCount++;

            // Display card
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-face card-front';
            const isRed = card.suit === '♥' || card.suit === '♦';
            cardDiv.classList.add(isRed ? 'red' : 'black');
            cardDiv.innerHTML = getCardDisplayHTML(card);
            
            flashDrillCardDisplayArea.innerHTML = ''; // Clear previous
            flashDrillCardDisplayArea.appendChild(cardDiv);

            // Wait for card speed
            await new Promise(resolve => setTimeout(resolve, speedPerCard));

            // Briefly show back or clear (optional)
            if (i < numCardsToFlash -1) { // Don't clear last card immediately
                 flashDrillCardDisplayArea.innerHTML = `<div class="card-face card-back" style="display:flex; justify-content:center; align-items:center; font-size:2em;">?</div>`;
                 await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause on back
            }
        }
        
        // After flashing all cards
        flashDrillCardDisplayArea.innerHTML = `<div style="padding:20px;">All cards flashed. Enter your count.</div>`;
        flashDrillFeedback.textContent = "Enter your final running count for the flashed cards.";
        flashDrillInputArea.style.display = "flex";
        flashDrillUserCountInput.focus();
        startFlashDrillButton.disabled = false;
        submitFlashDrillCountButton.disabled = false;

        // Update main game deck info as drill uses cards from the shoe
        updateDeckInfoDisplay();
        updateCounts(flashDrillActualCount); // Update overall RC with the drill's RC.
                                            // Or, keep drill separate and don't update main RC here
                                            // Current implementation: drill affects main shoe and RC.
        updateCountDisplays();
    }


    function handleSubmitFlashDrillCount() {
        const userCount = parseInt(flashDrillUserCountInput.value);
        if (isNaN(userCount)) {
            flashDrillFeedback.textContent = "Please enter a valid number.";
            flashDrillFeedback.style.color = "var(--danger-color-light)"; // Use CSS var later
            return;
        }

        if (userCount === flashDrillActualCount) {
            flashDrillFeedback.textContent = `Correct! Actual count was ${flashDrillActualCount}. Great job!`;
            flashDrillFeedback.style.color = "var(--accent-color-light)";
            score += 5; // Bonus for drill success
            playSound(correctSound);
        } else {
            flashDrillFeedback.textContent = `Incorrect. Your count: ${userCount}, Actual count: ${flashDrillActualCount}. Keep practicing!`;
            flashDrillFeedback.style.color = "var(--danger-color-light)";
            playSound(wrongSound);
        }
        updateScoreboard();
        submitFlashDrillCountButton.disabled = true; // Prevent re-submission
        // flashDrillActive = false; // Drill is over
    }


    // --- Betting Practice ---
    function shouldTriggerBettingPractice() {
        // Example: Trigger every 1/4 of a shoe, or if TC is high/low significantly
        if (!gameActive || flashDrillActive) return false;
        const cardsPerDeck = 52;
        const quarterShoe = Math.floor(totalShoeCards / 4);
        if (cardsDealt > 0 && cardsDealt % quarterShoe === 0 && cardsDealt < totalShoeCards) {
            return true;
        }
        // Or trigger if |TC| >= 3 (absolute true count)
        // if (Math.abs(trueCount) >= 3) return true;
        return false;
    }

    function triggerBettingPractice() {
        clearInterval(gameTimerInterval); // Pause card dealing
        bettingPracticeSection.style.display = 'block';
        bettingTrueCountDisplay.textContent = trueCount.toFixed(1);
        bettingFeedback.textContent = "Based on the True Count, what's your bet?";
        continueDealingButton.style.display = 'none'; // Hide until bet is made
        actionButtons.forEach(b => b.disabled = true); // Disable main game guess buttons
    }

    function checkBet(betType) {
        let feedbackMsg = "";
        // Basic betting strategy example (very simplified)
        // This needs to be customized based on a proper betting spread strategy
        if (trueCount < 1) {
            if (betType === 'min') feedbackMsg = "Good! Minimum bet is wise with a low True Count.";
            else feedbackMsg = "Consider minimum bet with a True Count below +1.";
        } else if (trueCount >= 1 && trueCount < 3) {
            if (betType === 'mid') feedbackMsg = "Okay, a moderate bet for a moderate True Count.";
            else if (betType === 'min') feedbackMsg = "You could consider a slightly higher bet.";
            else feedbackMsg = "Max bet might be too aggressive here. Consider a moderate bet.";
        } else { // trueCount >= 3
            if (betType === 'max') feedbackMsg = "Good! Max bet is appropriate for a high True Count.";
            else if (betType === 'mid') feedbackMsg = "You could be more aggressive with this True Count.";
            else feedbackMsg = "Minimum bet is too conservative for this high True Count.";
        }
        bettingFeedback.textContent = feedbackMsg;
        continueDealingButton.style.display = 'inline-block';
    }


    // --- Modal Content ---
    function populateHowToPlayModal() {
        const system = countingSystems[currentCountingSystem];
        let content = `<h2>How to Play: ${system.name} System</h2>`;
        content += `<p>Card counting helps players estimate if the remaining cards in the shoe are favorable (rich in high cards) or unfavorable (rich in low cards).</p>`;
        content += `<h3>Card Values for ${system.name}:</h3><ul>`;
        content += `<li><strong>Low Cards (2,3,4,5,6${system.name === "KO (Rookie)" ? ",7" : ""}):</strong> +1</li>`;
        content += `<li><strong>Neutral Cards (${system.name === "KO (Rookie)" ? "8,9" : "7,8,9"}):</strong> 0</li>`;
        content += `<li><strong>High Cards (10, J, Q, K, A):</strong> -1</li></ul>`;
        content += `<h3>Running Count:</h3>`;
        content += `<p>Start at 0. As each card is dealt, add its value (+1, 0, or -1) to your current total. This is the Running Count.</p>`;
        if (system.name !== "KO (Rookie)") { // KO is often an "unbalanced" system where True Count isn't the primary focus in the same way
            content += `<h3>True Count (for Hi-Lo and similar):</h3>`;
            content += `<p>The True Count gives a more accurate measure of advantage by accounting for the number of decks remaining. It's calculated as: <strong>Running Count / Decks Remaining</strong>.</p>`;
            content += `<p>A higher positive True Count indicates more high cards are left, which is favorable to the player.</p>`;
        } else {
            content += `<p>The KO system is an unbalanced count. You start with an initial running count based on the number of decks and adjust your strategy based on the running count directly, rather than converting to a True Count for basic decisions. The key number (pivot point) for KO is often +4 (or similar, depending on rules/decks).</p>`;
        }
        content += `<h3>Practice:</h3><p>Use this trainer to practice identifying card values quickly and keeping an accurate count.</p>`;
        howToPlayContent.innerHTML = content;
    }

    function populateBasicStrategyChart() {
        // Basic Strategy Data (H17, DAS, No Surrender - common)
        // Dealer Upcard: 2, 3, 4, 5, 6, 7, 8, 9, T, A
        const hardTotals = {
            caption: "Hard Totals (Player Hand vs. Dealer Upcard)",
            headers: ["Player", "2", "3", "4", "5", "6", "7", "8", "9", "T", "A"],
            rows: {
                "17-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
                "16":    ["S", "S", "S", "S", "S", "H", "H", "Sr/H", "Sr/H", "Sr/H"], // Sr if allowed
                "15":    ["S", "S", "S", "S", "S", "H", "H", "H", "Sr/H", "H"],    // Sr if allowed for 9
                "14":    ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
                "13":    ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
                "12":    ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"],
                "11":    ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
                "10":    ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
                "9":     ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
                "5-8":   ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
            }
        };

        const softTotals = {
            caption: "Soft Totals (Player Ace Hand vs. Dealer Upcard)",
            headers: ["Player", "2", "3", "4", "5", "6", "7", "8", "9", "T", "A"],
            rows: {
                "A,9 (S20)": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
                "A,8 (S19)": ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"], // Ds = Double if allowed, else Stand
                "A,7 (S18)": ["Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"],
                "A,6 (S17)": ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
                "A,5 (S16)": ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
                "A,4 (S15)": ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
                "A,3 (S14)": ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
                "A,2 (S13)": ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
            }
        };

        const pairs = {
            caption: "Pairs (Player Pair vs. Dealer Upcard)",
            headers: ["Player", "2", "3", "4", "5", "6", "7", "8", "9", "T", "A"],
            rows: {
                "A,A":   ["SP", "SP", "SP", "SP", "SP", "SP", "SP", "SP", "SP", "SP"],
                "T,T":   ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], // Tens, Js, Qs, Ks
                "9,9":   ["SP", "SP", "SP", "SP", "SP", "S", "SP", "SP", "S", "S"],
                "8,8":   ["SP", "SP", "SP", "SP", "SP", "SP", "SP", "SP", "SP", "SP"], // Always split 8s (some Sr vs A if available)
                "7,7":   ["SP", "SP", "SP", "SP", "SP", "SP", "H", "H", "H", "H"],
                "6,6":   ["SP", "SP", "SP", "SP", "SP", "H", "H", "H", "H", "H"],
                "5,5":   ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"], // Never split 5s, treat as 10
                "4,4":   ["H", "H", "H", "SP", "SP", "H", "H", "H", "H", "H"], // Split only on 5,6 (DAS)
                "3,3":   ["SP", "SP", "SP", "SP", "SP", "SP", "H", "H", "H", "H"],
                "2,2":   ["SP", "SP", "SP", "SP", "SP", "SP", "H", "H", "H", "H"],
            }
        };
        
        const legend = {
            "S": "Stand", "H": "Hit", "D": "Double (Hit if not allowed)", "Ds": "Double (Stand if not allowed)",
            "SP": "Split", "Sr/H": "Surrender (Hit if not allowed)", "Sr/S": "Surrender (Stand if not allowed)"
        };
        // Note: The Sr/H, Sr/S above are simplified. Full surrender strategy is more nuanced.
        // This chart assumes H17, DAS. No Surrender is assumed for most cells unless specified by Sr.

        let html = `<p><strong>Legend:</strong> S=Stand, H=Hit, D=Double, SP=Split, Sr=Surrender (if available). Assumes Dealer Hits Soft 17, Double After Split Allowed.</p>`;
        html += generateTableHTML(hardTotals, legend);
        html += generateTableHTML(softTotals, legend);
        html += generateTableHTML(pairs, legend);
        basicStrategyChartContainer.innerHTML = html;
    }

    function getStrategyClass(action) {
        if (action.startsWith("Sr")) return "strat-Sr";
        if (action === "S") return "strat-S";
        if (action === "H") return "strat-H";
        if (action.includes("D")) return "strat-D"; // D or Ds
        if (action === "SP") return "strat-SP";
        return "";
    }

    function generateTableHTML(data, legend) {
        let tableHTML = `<table><caption>${data.caption}</caption><thead><tr>`;
        data.headers.forEach(header => tableHTML += `<th>${header}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        for (const playerHand in data.rows) {
            tableHTML += `<tr><td><strong>${playerHand}</strong></td>`;
            data.rows[playerHand].forEach(action => {
                const className = getStrategyClass(action);
                const titleText = legend[action.split('/')[0]] || action; // Get primary action for title
                tableHTML += `<td class="${className}" title="${titleText}">${action}</td>`;
            });
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    // --- Utility Functions ---
    function playSound(soundElement) {
        soundElement.currentTime = 0;
        soundElement.play().catch(e => console.warn("Sound play failed:", e));
    }

    // --- Start the app ---
    init();
});
