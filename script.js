document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const numDecksSelect = document.getElementById('numDecks');
    const startGameBtn = document.getElementById('startGameBtn');
    const gameAreaDiv = document.getElementById('gameArea');
    const currentCardDisplay = document.getElementById('currentCardDisplay');
    const runningCountDisplay = document.getElementById('runningCountDisplay');
    const trueCountDisplay = document.getElementById('trueCountDisplay');
    const cardsRemainingDisplay = document.getElementById('cardsRemainingDisplay');
    const decksRemainingDisplay = document.getElementById('decksRemainingDisplay');

    const valueGuessSection = document.getElementById('valueGuessSection');
    // REMOVED: cardValueGuessInput and submitValueGuessBtn
    const valueGuessButtons = document.querySelectorAll('.value-btn'); // NEW: Select all value buttons
    const valueFeedback = document.getElementById('valueFeedback');

    const rcGuessSection = document.getElementById('rcGuessSection');
    const rcGuessInput = document.getElementById('rcGuess');
    const submitRcGuessBtn = document.getElementById('submitRcGuessBtn');
    const rcFeedback = document.getElementById('rcFeedback');

    const shoeEndMessage = document.getElementById('shoeEndMessage');

    // --- Card Definitions ---
    const SUITS = {"H": "♥", "D": "♦", "C": "♣", "S": "♠"};
    const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    const RANK_NAMES = {
        "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
        "T": "10", "J": "Jack", "Q": "Queen", "K": "King", "A": "Ace"
    };
    const HI_LO_VALUES = {
        "2": 1, "3": 1, "4": 1, "5": 1, "6": 1,
        "7": 0, "8": 0, "9": 0,
        "T": -1, "J": -1, "Q": -1, "K": -1, "A": -1
    };

    // --- Game State Variables ---
    let deck = [];
    let runningCount = 0;
    let initialNumDecks = 0;
    let currentCard = null;
    let actualCardHiLoValue = 0;

    function createDeck(numDecks) {
        const newDeck = [];
        for (let i = 0; i < numDecks; i++) {
            for (const suitKey of Object.keys(SUITS)) {
                for (const rank of RANKS) {
                    newDeck.push({
                        rank: rank,
                        suitKey: suitKey,
                        displayString: `${RANK_NAMES[rank]} of ${SUITS[suitKey]}`
                    });
                }
            }
        }
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }

    function getCardHiLoValue(cardRank) {
        return HI_LO_VALUES[cardRank];
    }

    function updateUIDisplays() {
        runningCountDisplay.textContent = runningCount;
        const cardsLeft = deck.length;
        cardsRemainingDisplay.textContent = cardsLeft;
        const decksLeft = cardsLeft / 52;
        decksRemainingDisplay.textContent = decksLeft.toFixed(1);
        let trueCount = 0;
        if (decksLeft > 0.25) {
            trueCount = runningCount / decksLeft;
        } else if (cardsLeft > 0) {
            trueCount = runningCount / Math.max(decksLeft, 0.5);
        }
        trueCountDisplay.textContent = trueCount.toFixed(1);
    }

    function dealNextCard() {
        if (deck.length === 0) {
            shoeEndMessage.textContent = `Shoe finished! Final Running Count: ${runningCount}.`;
            shoeEndMessage.className = 'feedback-message';
            if (runningCount === 0) {
                shoeEndMessage.textContent += " Perfect balance!";
                shoeEndMessage.classList.add('correct');
            } else {
                shoeEndMessage.textContent += ` Expected 0. Review your game!`;
                shoeEndMessage.classList.add('error');
            }
            valueGuessSection.classList.add('hidden');
            rcGuessSection.classList.add('hidden');
            currentCardDisplay.textContent = "End of Shoe.";
            startGameBtn.textContent = "Start New Shoe";
            return false;
        }

        currentCard = deck.pop();
        actualCardHiLoValue = getCardHiLoValue(currentCard.rank);
        currentCardDisplay.textContent = currentCard.displayString;
        valueFeedback.textContent = "";
        rcFeedback.textContent = "";
        rcGuessInput.value = ""; // Clear RC guess input

        valueGuessSection.classList.remove('hidden');
        rcGuessSection.classList.add('hidden');
        updateUIDisplays();
        return true;
    }

    function handleStartGame() {
        initialNumDecks = parseInt(numDecksSelect.value);
        deck = createDeck(initialNumDecks);
        runningCount = 0;
        gameAreaDiv.classList.remove('hidden');
        shoeEndMessage.textContent = "";
        shoeEndMessage.className = 'feedback-message';
        startGameBtn.textContent = "Restart Current Shoe";
        dealNextCard();
    }

    // MODIFIED FUNCTION: handleValueGuess (replaces handleSubmitValueGuess)
    function handleValueGuess(guessedValue) {
        if (guessedValue === actualCardHiLoValue) {
            valueFeedback.textContent = `Correct! The value of ${currentCard.displayString} is ${actualCardHiLoValue}.`;
            valueFeedback.className = 'feedback correct';
        } else {
            valueFeedback.textContent = `Not quite. The value of ${currentCard.displayString} is actually ${actualCardHiLoValue}. Your guess: ${guessedValue}.`;
            valueFeedback.className = 'feedback error';
        }

        // Always transition to Running Count guess after a short delay for feedback
        setTimeout(() => {
            valueGuessSection.classList.add('hidden');
            rcGuessSection.classList.remove('hidden');
            rcGuessInput.focus();
        }, valueFeedback.classList.contains('error') ? 1800 : 1000); // Shorter delay if correct
    }
    // END OF MODIFIED FUNCTION

    function handleSubmitRcGuess() {
        const guessStr = rcGuessInput.value;
        if (guessStr === "") {
            rcFeedback.textContent = "Please enter the new running count.";
            rcFeedback.className = 'feedback error';
            rcGuessInput.focus();
            return;
        }
        const guess = parseInt(guessStr);
        const expectedNewRc = runningCount + actualCardHiLoValue;

        if (isNaN(guess)) {
            rcFeedback.textContent = "Invalid input. Please enter a number.";
            rcFeedback.className = 'feedback error';
            rcGuessInput.value = "";
            rcGuessInput.focus();
            return;
        }

        if (guess === expectedNewRc) {
            rcFeedback.textContent = `Excellent! The new Running Count is indeed ${expectedNewRc}.`;
            rcFeedback.className = 'feedback correct';
        } else {
            rcFeedback.textContent = `Close! The new Running Count is actually ${expectedNewRc}. (Previous: ${runningCount} + Card Value: ${actualCardHiLoValue}). Your guess: ${guess}.`;
            rcFeedback.className = 'feedback error';
        }
        
        runningCount = expectedNewRc;
        
        setTimeout(() => {
            rcFeedback.textContent = ""; 
            valueFeedback.textContent = ""; 
            if (deck.length > 0) {
                dealNextCard();
            } else {
                updateUIDisplays();
                shoeEndMessage.textContent = `Shoe finished! Final Running Count: ${runningCount}.`;
                shoeEndMessage.className = 'feedback-message';
                if (runningCount === 0) {
                    shoeEndMessage.textContent += " Perfect balance!";
                    shoeEndMessage.classList.add('correct');
                } else {
                    shoeEndMessage.textContent += ` Expected 0. Review your game!`;
                    shoeEndMessage.classList.add('error');
                }
                valueGuessSection.classList.add('hidden');
                rcGuessSection.classList.add('hidden');
                currentCardDisplay.textContent = "End of Shoe.";
                startGameBtn.textContent = "Start New Shoe";
            }
        }, rcFeedback.classList.contains('error') ? 2000 : 1500); // Delay for user to read feedback
    }

    // --- Event Listeners ---
    startGameBtn.addEventListener('click', handleStartGame);

    // NEW: Event listeners for the value guess buttons
    valueGuessButtons.forEach(button => {
        button.addEventListener('click', () => {
            const guessedValue = parseInt(button.dataset.value);
            handleValueGuess(guessedValue);
        });
    });
    // END OF NEW Event Listeners

    submitRcGuessBtn.addEventListener('click', handleSubmitRcGuess);

    // REMOVED: Keypress listener for cardValueGuessInput

    rcGuessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitRcGuessBtn.click();
        }
    });

    gameAreaDiv.classList.add('hidden');
});
