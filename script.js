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
    const cardValueGuessInput = document.getElementById('cardValueGuess');
    const submitValueGuessBtn = document.getElementById('submitValueGuessBtn');
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
    let currentCard = null; // Object: { rank: 'A', suitKey: 'S', displayString: 'Ace of ♠' }
    let actualCardHiLoValue = 0; // The Hi-Lo value of the currentCard

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
        // Shuffle deck (Fisher-Yates shuffle)
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
        if (decksLeft > 0.25) { // Only calculate true count if enough decks remain
            trueCount = runningCount / decksLeft;
        } else if (cardsLeft > 0) {
            trueCount = runningCount / Math.max(decksLeft, 0.5); // Avoid division by very small number, use at least 0.5 deck
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
            // startGameBtn.disabled = false; // Already enabled
            return false; // No card dealt
        }

        currentCard = deck.pop();
        actualCardHiLoValue = getCardHiLoValue(currentCard.rank);

        currentCardDisplay.textContent = currentCard.displayString;
        // Reset card display color (if you were to implement suit colors)
        // currentCardDisplay.className = 'card-display';
        // if (currentCard.suitKey === "H" || currentCard.suitKey === "D") {
        //     currentCardDisplay.classList.add('red-card');
        // } else {
        //     currentCardDisplay.classList.add('black-card');
        // }


        valueFeedback.textContent = "";
        rcFeedback.textContent = "";
        cardValueGuessInput.value = "";
        rcGuessInput.value = "";

        valueGuessSection.classList.remove('hidden');
        rcGuessSection.classList.add('hidden'); // Hide RC guess until value is submitted
        cardValueGuessInput.focus();
        
        updateUIDisplays();
        return true; // Card dealt
    }

    function handleStartGame() {
        initialNumDecks = parseInt(numDecksSelect.value);
        deck = createDeck(initialNumDecks);
        runningCount = 0;

        gameAreaDiv.classList.remove('hidden');
        shoeEndMessage.textContent = "";
        shoeEndMessage.className = 'feedback-message'; // Reset class
        startGameBtn.textContent = "Restart Current Shoe";
        
        dealNextCard();
    }

    function handleSubmitValueGuess() {
        const guessStr = cardValueGuessInput.value;
        if (guessStr === "") {
            valueFeedback.textContent = "Please enter -1, 0, or 1.";
            valueFeedback.className = 'feedback error';
            cardValueGuessInput.focus();
            return;
        }
        const guess = parseInt(guessStr);

        if (isNaN(guess) || ![-1, 0, 1].includes(guess)) {
            valueFeedback.textContent = "Invalid input. Enter -1, 0, or 1.";
            valueFeedback.className = 'feedback error';
            cardValueGuessInput.value = "";
            cardValueGuessInput.focus();
            return;
        }

        if (guess === actualCardHiLoValue) {
            valueFeedback.textContent = `Correct! The value of ${currentCard.displayString} is ${actualCardHiLoValue}.`;
            valueFeedback.className = 'feedback correct';
            // Transition to Running Count guess
            valueGuessSection.classList.add('hidden');
            rcGuessSection.classList.remove('hidden');
            rcGuessInput.focus();
        } else {
            valueFeedback.textContent = `Not quite. The value of ${currentCard.displayString} is actually ${actualCardHiLoValue}. Your guess: ${guess}.`;
            valueFeedback.className = 'feedback error';
            // Still transition, but user knows the correct value for the RC calculation
            setTimeout(() => {
                valueGuessSection.classList.add('hidden');
                rcGuessSection.classList.remove('hidden');
                rcGuessInput.focus();
            }, 1800); // Give time to read feedback
        }
    }

    function handleSubmitRcGuess() {
        const guessStr = rcGuessInput.value;
        if (guessStr === "") {
            rcFeedback.textContent = "Please enter the new running count.";
            rcFeedback.className = 'feedback error';
            rcGuessInput.focus();
            return;
        }
        const guess = parseInt(guessStr);
        const expectedNewRc = runningCount + actualCardHiLoValue; // Use the actual card value

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
        
        // Update the actual running count with the correct value for progression
        runningCount = expectedNewRc;
        
        // After a brief moment for feedback, deal next card or end shoe
        setTimeout(() => {
            rcFeedback.textContent = ""; 
            valueFeedback.textContent = ""; 
            if (deck.length > 0) {
                dealNextCard();
            } else {
                updateUIDisplays(); // Update final counts
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
        }, 1800); // Delay for user to read feedback
    }

    // --- Event Listeners ---
    startGameBtn.addEventListener('click', handleStartGame);
    submitValueGuessBtn.addEventListener('click', handleSubmitValueGuess);
    submitRcGuessBtn.addEventListener('click', handleSubmitRcGuess);

    cardValueGuessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if it were in a form
            submitValueGuessBtn.click();
        }
    });

    rcGuessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitRcGuessBtn.click();
        }
    });

    // Initialize: Hide game area until "Start Game" is clicked
    gameAreaDiv.classList.add('hidden');
});
