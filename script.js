document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements --- (Same as your current working version)
    // --- Game Variables --- (Same as your current working version, ensure runningCount is global)
    // --- Helper Functions (getSuitSymbol, getCardHiLoValue, etc.) --- (Same)
    // --- Card Rendering (renderCard) --- (Same as the text-based version)
    // --- Scoring (calculateScore) --- (Same)
    // --- Display Updates (updateScoresDisplay, updateCountsDisplay, setGameMessage, updateChipDisplay) --- (Same)

    function createShoe() {
        shoe = [];
        for (let i = 0; i < NUM_DECKS; i++) {
            for (const suit of CARD_SUITS) {
                for (const rankKey in CARD_RANKS_MAP) {
                    shoe.push({
                        rank: rankKey,
                        suit: suit,
                        bjValue: CARD_RANKS_MAP[rankKey].value,
                        imgRank: CARD_RANKS_MAP[rankKey].display,
                        countValue: getCardHiLoValue(rankKey),
                        id: `${rankKey}${suit}${i}`
                    });
                }
            }
        }
        shuffleShoe();
        runningCount = 0; // CORRECT: This is for a brand new, shuffled shoe.
        updateCountsDisplay(); // Update display with the reset count
        reshuffleMessageEl.textContent = "New Shoe! Shuffled.";
        setTimeout(() => reshuffleMessageEl.textContent = "", 3000);
    }

    function shuffleShoe() { /* ... same ... */ }
    function dealCard(targetHand, targetEl, isVisible = true) { /* ... same ... runningCount is INCREMENTED here per card ... */ }


    // --- MODIFIED Game Flow Logic ---
    function startNewHand() {
        const betVal = parseInt(betAmountInput.value);
        if (isNaN(betVal) || betVal <= 0) {
            setGameMessage("Please enter a valid bet amount.", "loss");
            return;
        }
        if (betVal > playerChips) {
            setGameMessage("You don't have enough chips for that bet.", "loss");
            return;
        }

        currentBet = betVal;
        playerChips -= currentBet;
        updateChipDisplay();
        currentBetAmountEl.textContent = currentBet;

        let needsFullReshuffle = false;
        const reshuffleThreshold = NUM_DECKS * 52 * 0.25; // Reshuffle if < 25% cards left

        if (shoe.length === 0) {
            reshuffleMessageEl.textContent = "Shoe empty! Creating new shoe...";
            needsFullReshuffle = true;
        } else if (shoe.length < reshuffleThreshold) {
            reshuffleMessageEl.textContent = "Low deck penetration. Reshuffling...";
            needsFullReshuffle = true;
        }

        if (needsFullReshuffle) {
            // Delay for message visibility, especially if it's penetration-based reshuffle
            const delay = (shoe.length > 0 && shoe.length < reshuffleThreshold) ? 1500 : 0;
            setTimeout(() => {
                createShoe(); // This will reset runningCount to 0 correctly.
                prepareHandAndDealUI(); // Then, setup UI for the new hand and deal.
            }, delay);
            // Important: Buttons will be re-enabled in prepareHandAndDealUI and checkInitialBlackjack
        } else {
            // No reshuffle needed, just prepare UI for a new hand with the current shoe.
            // Running count is preserved from the previous hand.
            prepareHandAndDealUI();
        }
    }

    // New helper function to prepare UI and deal cards for any new hand
    function prepareHandAndDealUI() {
        // 1. Reset state specific to a single hand (player/dealer hands, hole card)
        //    CRITICALLY: DO NOT RESET runningCount here.
        gameInProgress = true;
        playerHand = [];
        dealerHand = [];
        dealerHoleCard = null;

        // 2. Clear UI elements for cards and messages from the previous hand
        dealerCardsEl.innerHTML = '';
        playerCardsEl.innerHTML = '';
        setGameMessage(""); // Clear previous win/loss message
        lastCardInfoEl.textContent = ''; // Clear last card info

        // 3. Deal initial cards. `dealCard` will update runningCount for newly dealt cards.
        dealInitialCards();

        // 4. `dealInitialCards` also calls `checkInitialBlackjack`, which might end the hand.
        //    If the hand is still in progress (not ended by Blackjack), enable action buttons.
        //    The `dealInitialCards` or `checkInitialBlackjack` should handle button states.
    }


    function dealInitialCards() {
        dealCard(playerHand, playerCardsEl, true);
        dealCard(dealerHand, dealerCardsEl, false); // Dealer's hole card
        dealCard(playerHand, playerCardsEl, true);
        dealCard(dealerHand, dealerCardsEl, true);  // Dealer's up card

        updateScoresDisplay();
        // checkInitialBlackjack will determine if game continues and set button states
        checkInitialBlackjack();

        // If game didn't end from initial Blackjack, ensure buttons are set correctly
        if (gameInProgress) {
            hitButton.disabled = false;
            standButton.disabled = false;
            dealButton.disabled = true; // Deal button is disabled once hand starts
            betAmountInput.disabled = true;
        }
    }

    function checkInitialBlackjack() {
        // ... (same logic as before for checking blackjack and payouts) ...
        // This function calls endHand() if there's a blackjack, which disables hit/stand
        // and enables dealButton.
        // If no blackjack, gameInProgress remains true.
        const playerResult = calculateScore(playerHand);
        const playerHasBlackjack = playerResult.score === 21 && playerHand.length === 2;

        if (playerHasBlackjack) {
            revealDealerHoleCard(true);
            const dealerFinalScore = calculateScore(dealerHand).score;
            if (dealerFinalScore === 21 && dealerHand.length === 2) {
                setGameMessage("Push! Both have Blackjack.", "push");
                playerChips += currentBet;
            } else {
                setGameMessage(`Player Blackjack! You win $${(currentBet * 1.5).toFixed(0)}!`, "win");
                playerChips += currentBet + (currentBet * 1.5);
            }
            endHand(); // This will disable hit/stand, enable deal
        }
        // If player doesn't have blackjack, game continues, buttons should be enabled by dealInitialCards or here
    }

    function hit() { /* ... same ... */ }
    function stand() { /* ... same ... */ }
    function revealDealerHoleCard(updateCountForGame = true) { /* ... same ... */ }
    function determineWinner() { /* ... same ... */ }

    function endHand() { // This function is called when a hand concludes (win, loss, push, blackjack)
        gameInProgress = false;
        hitButton.disabled = true;
        standButton.disabled = true;
        dealButton.disabled = false; // Enable deal button for the next hand
        betAmountInput.disabled = false; // Enable bet input for the next hand
        updateChipDisplay();
        currentBetAmountEl.textContent = 0;

        if (playerChips <= 0) {
            setGameMessage("Game Over! You're out of chips. Refresh to play again.", "loss");
            dealButton.disabled = true;
            betAmountInput.disabled = true;
        }
    }

    // --- Event Listeners --- (Same)
    // --- Initial Game Setup --- (Same: call createShoe() once, set initial message)
    // Initial setup should look like:
    // updateChipDisplay();
    // createShoe(); // Initial shoe creation and runningCount reset to 0
    // setGameMessage("Place your bet and click 'Place Bet & Deal' to start.", "");
    // hitButton.disabled = true;
    // standButton.disabled = true;
    // dealButton.disabled = false; // Deal button should be enabled to start the first game
    // betAmountInput.disabled = false;
});
