document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dealerCardsEl = document.getElementById('dealer-cards');
    const playerCardsEl = document.getElementById('player-cards');
    const dealerScoreEl = document.getElementById('dealer-score');
    const playerScoreEl = document.getElementById('player-score');

    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const dealButton = document.getElementById('deal-button');

    const gameMessageEl = document.getElementById('game-message');
    const lastCardInfoEl = document.getElementById('last-card-info');

    const runningCountEl = document.getElementById('running-count');
    const trueCountEl = document.getElementById('true-count');
    const decksRemainingEl = document.getElementById('decks-remaining'); // For Decks Remaining display
    const reshuffleMessageEl = document.getElementById('reshuffle-message');

    const chipsAmountEl = document.getElementById('chips-amount');
    const currentBetAmountEl = document.getElementById('current-bet-amount');
    const betAmountInput = document.getElementById('bet-amount');

    // --- Game Variables ---
    const NUM_DECKS = 4; // Matched screenshot, can be adjusted
    let shoe = [];
    let playerHand = [];
    let dealerHand = [];
    let runningCount = 0;
    let dealerHoleCard = null;
    let gameInProgress = false;
    let playerChips = 1000; // Starting chips
    let currentBet = 0;

    const CARD_RANKS_MAP = { // For display and BJ values
        '2': { value: 2, display: '2' }, '3': { value: 3, display: '3' },
        '4': { value: 4, display: '4' }, '5': { value: 5, display: '5' },
        '6': { value: 6, display: '6' }, '7': { value: 7, display: '7' },
        '8': { value: 8, display: '8' }, '9': { value: 9, display: '9' },
        '10': { value: 10, display: '10' },
        'J': { value: 10, display: 'J' },
        'Q': { value: 10, display: 'Q' },
        'K': { value: 10, display: 'K' },
        'A': { value: 11, display: 'A' }
    };
    const CARD_SUITS = ['H', 'D', 'C', 'S'];

    // --- Helper Functions ---
    function getSuitSymbol(suitChar) {
        switch(suitChar) {
            case 'H': return '♥'; case 'D': return '♦';
            case 'C': return '♣'; case 'S': return '♠';
            default: return suitChar;
        }
    }

    function getCardHiLoValue(rank) {
        if (['A', 'K', 'Q', 'J', '10'].includes(rank)) return -1;
        if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
        return 0;
    }

    // --- Card Rendering (Text-Based, styled like screenshot) ---
    function renderCard(card, targetEl, isVisible) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card-display');
        cardDiv.id = `card-${card.id}`;

        if (isVisible) {
            cardDiv.classList.add(`suit-${card.suit}`); // For suit color on symbols

// --- Card Rendering (Text-Based, with improved layout) ---
function renderCard(card, targetEl, isVisible) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-display');
    cardDiv.id = `card-${card.id}`; // Used for revealing the hole card

    if (isVisible) {
        // Add suit-specific class to the main cardDiv for styling suit symbols
        cardDiv.classList.add(`suit-${card.suit}`);

        // Rank Display (typically at the top/center)
        const rankSpan = document.createElement('span');
        rankSpan.classList.add('card-rank');
        rankSpan.textContent = CARD_RANKS_MAP[card.rank].display;
        cardDiv.appendChild(rankSpan);

        // Container for Suit Symbol and Hi-Lo Count Value (at the bottom)
        const bottomInfoContainer = document.createElement('div');
        bottomInfoContainer.classList.add('card-bottom-info');

        const suitSpan = document.createElement('span');
        suitSpan.classList.add('card-suit-symbol');
        suitSpan.innerHTML = getSuitSymbol(card.suit); // Use innerHTML for HTML entities like ♥
        bottomInfoContainer.appendChild(suitSpan);

        const countValueEl = document.createElement('span');
        countValueEl.classList.add('card-count-value-text');
        let countText = card.countValue.toString();
        if (card.countValue > 0) {
            countText = "+" + countText; // Add '+' for positive counts
        }
        countValueEl.textContent = countText;
        bottomInfoContainer.appendChild(countValueEl);

        cardDiv.appendChild(bottomInfoContainer);

    } else {
        // This is a face-down card (Dealer's hole card initially)
        cardDiv.classList.add('card-back');
    }
    targetEl.appendChild(cardDiv);
}

// --- Revealing Dealer's Hole Card (Update to match new rendering structure) ---
function revealDealerHoleCard(updateCountForGameLogic = true) {
    if (dealerHoleCard) {
        const holeCardDiv = document.getElementById(`card-${dealerHoleCard.id}`);
        if (holeCardDiv) {
            // Clear current content (e.g., card back styling/content)
            holeCardDiv.innerHTML = '';
            holeCardDiv.classList.remove('card-back');

            // Apply visible card styling
            holeCardDiv.classList.add('card-display'); // Re-add if removed, though usually not
            holeCardDiv.classList.add(`suit-${dealerHoleCard.suit}`);

            // Rank Display
            const rankSpan = document.createElement('span');
            rankSpan.classList.add('card-rank');
            rankSpan.textContent = CARD_RANKS_MAP[card.rank].display;
            cardDiv.appendChild(rankSpan);
            rankSpan.textContent = CARD_RANKS_MAP[dealerHoleCard.rank].display;
            holeCardDiv.appendChild(rankSpan);

            // Combined suit symbol and count value at the bottom right (like screenshot)
            const suitAndCountContainer = document.createElement('div');
            suitAndCountContainer.classList.add('suit-bottom-right');
            // Container for Suit Symbol and Hi-Lo Count Value
            const bottomInfoContainer = document.createElement('div');
            bottomInfoContainer.classList.add('card-bottom-info');

            const suitSpan = document.createElement('span');
            suitSpan.classList.add('card-suit-symbol'); // Specific class for the symbol
            suitSpan.innerHTML = getSuitSymbol(card.suit);
            suitAndCountContainer.appendChild(suitSpan);
            suitSpan.classList.add('card-suit-symbol');
            suitSpan.innerHTML = getSuitSymbol(dealerHoleCard.suit);
            bottomInfoContainer.appendChild(suitSpan);

            const countValueEl = document.createElement('span');
            countValueEl.classList.add('card-count-value-text');
            let countText = card.countValue.toString();
            if (card.countValue > 0) countText = "+" + countText;
            countValueEl.textContent = countText;
            suitAndCountContainer.appendChild(countValueEl);

            cardDiv.appendChild(suitAndCountContainer);

        } else {
            cardDiv.classList.add('card-back');
        }
        targetEl.appendChild(cardDiv);
    }

    function createShoe() {
        shoe = [];
        for (let i = 0; i < NUM_DECKS; i++) {
            for (const suit of CARD_SUITS) {
                for (const rankKey in CARD_RANKS_MAP) {
                    shoe.push({
                        rank: rankKey, suit: suit,
                        bjValue: CARD_RANKS_MAP[rankKey].value,
                        displayRank: CARD_RANKS_MAP[rankKey].display,
                        countValue: getCardHiLoValue(rankKey),
                        id: `${rankKey}${suit}${i}`
                    });
                }
            }
        }
        shuffleShoe();
        runningCount = 0; // RESET on new shoe
        updateCountsDisplay();
        reshuffleMessageEl.textContent = "New Shoe! Shuffled.";
        setTimeout(() => reshuffleMessageEl.textContent = "", 2500);
    }

    function shuffleShoe() {
        for (let i = shoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
        }
    }

    function dealCard(targetHand, targetEl, isVisible = true) {
        if (shoe.length === 0) {
            reshuffleMessageEl.textContent = "Shoe empty! Auto-reshuffling...";
            createShoe(); // This will reset runningCount
            if (shoe.length === 0) {
                setGameMessage("Error: Could not create shoe.", "loss"); return null;
            }
        }

        const card = shoe.pop();
        targetHand.push(card);

        if (isVisible) {
            runningCount += card.countValue;
            let countText = card.countValue > 0 ? `+${card.countValue}` : card.countValue;
            lastCardInfoEl.textContent = `Card: ${card.displayRank}${getSuitSymbol(card.suit)} (Count: ${countText})`;
        } else {
            if (targetHand === dealerHand) dealerHoleCard = card;
            lastCardInfoEl.textContent = "";
        }
        updateCountsDisplay(); // Update counts after every card dealt
        renderCard(card, targetEl, isVisible);
        return card;
    }

    function calculateScore(hand) {
        let score = 0; let aceCount = 0;
        for (const card of hand) {
            score += card.bjValue;
            if (card.rank === 'A') aceCount++;
        }
        while (score > 21 && aceCount > 0) { score -= 10; aceCount--; }
        return { score: score, aceCount: aceCount };
    }

    function updateScoresDisplay() {
        const playerResult = calculateScore(playerHand);
        playerScoreEl.textContent = playerResult.score;
        let dealerScoreToDisplay;
        if (gameInProgress && dealerHoleCard && dealerHand.length > 0 && dealerHand[0].id === dealerHoleCard.id) {
             dealerScoreToDisplay = dealerHand.length > 1 ? calculateScore([dealerHand[1]]).score : 0;
        } else {
            dealerScoreToDisplay = calculateScore(dealerHand).score;
        }
        dealerScoreEl.textContent = dealerScoreToDisplay;
    }

    function updateCountsDisplay() {
        runningCountEl.textContent = runningCount;
        const decksLeft = shoe.length / 52.0;
        decksRemainingEl.textContent = decksLeft.toFixed(1); // Matched screenshot
        if (decksLeft > 0.05) { // More robust check
            const trueCountVal = runningCount / decksLeft;
            trueCountEl.textContent = trueCountVal.toFixed(2);
        } else {
            trueCountEl.textContent = "N/A";
        }
    }

    function setGameMessage(message, type = "") {
        gameMessageEl.textContent = message;
        gameMessageEl.className = 'message';
        if (type) gameMessageEl.classList.add(type);
    }

    function startNewHand() {
        const betVal = parseInt(betAmountInput.value);
        if (isNaN(betVal) || betVal <= 0) {
            setGameMessage("Please enter a valid bet.", "loss"); return;
        }
        if (betVal > playerChips) {
            setGameMessage("Not enough chips for that bet.", "loss"); return;
        }

        currentBet = betVal;
        playerChips -= currentBet;
        updateChipDisplay();
        currentBetAmountEl.textContent = currentBet;
        dealButton.textContent = "Dealing..."; // Feedback
        dealButton.disabled = true;
        betAmountInput.disabled = true;

        let needsFullReshuffle = false;
        const reshuffleThreshold = NUM_DECKS * 52 * 0.25;

        if (shoe.length === 0) {
            reshuffleMessageEl.textContent = "Shoe empty! New shoe...";
            needsFullReshuffle = true;
        } else if (shoe.length < reshuffleThreshold) {
            reshuffleMessageEl.textContent = "Low penetration. Reshuffling...";
            needsFullReshuffle = true;
        }

        if (needsFullReshuffle) {
            const delay = (shoe.length > 0 && shoe.length < reshuffleThreshold) ? 1000 : 0;
            setTimeout(() => {
                createShoe(); // Resets runningCount to 0.
                prepareHandAndDealUI();
            }, delay);
        } else {
            prepareHandAndDealUI(); // Uses existing shoe, preserves runningCount.
        }
    }

    function prepareHandAndDealUI() {
        gameInProgress = true;
        playerHand = []; dealerHand = []; dealerHoleCard = null;
        dealerCardsEl.innerHTML = ''; playerCardsEl.innerHTML = '';
        setGameMessage(""); lastCardInfoEl.textContent = '';

        dealInitialCards(); // This will enable hit/stand if game proceeds
    }

    function dealInitialCards() {
        dealCard(playerHand, playerCardsEl, true);
        dealCard(dealerHand, dealerCardsEl, false);
        dealCard(playerHand, playerCardsEl, true);
        dealCard(dealerHand, dealerCardsEl, true);
        updateScoresDisplay();
        checkInitialBlackjack();

        if (gameInProgress) { // If not ended by Blackjack
            hitButton.disabled = false; standButton.disabled = false;
            // dealButton remains disabled until hand ends
        }
    }

    function checkInitialBlackjack() {
        const playerResult = calculateScore(playerHand);
        const playerHasBlackjack = playerResult.score === 21 && playerHand.length === 2;
        if (playerHasBlackjack) {
            revealDealerHoleCard(true);
            const dealerFinalScore = calculateScore(dealerHand).score;
            if (dealerFinalScore === 21 && dealerHand.length === 2) {
                setGameMessage("Push! Both have Blackjack.", "push");
                playerChips += currentBet;
            } else {
                setGameMessage(`Player Blackjack! Win $${(currentBet * 1.5).toFixed(0)}!`, "win");
                playerChips += currentBet + Math.floor(currentBet * 1.5); // Blackjack pays 3:2
            let countText = dealerHoleCard.countValue.toString();
            if (dealerHoleCard.countValue > 0) {
                countText = "+" + countText;
            }
            endHand();
        }
    }

    function hit() {
        if (!gameInProgress) return;
        dealCard(playerHand, playerCardsEl, true);
        updateScoresDisplay();
        const pScore = calculateScore(playerHand).score;
        if (pScore > 21) {
            setGameMessage(`Player Busts! Lose $${currentBet}.`, "loss");
            revealDealerHoleCard(false); endHand();
        } else if (pScore === 21) { stand(); }
    }

    function stand() {
        if (!gameInProgress) return;
        revealDealerHoleCard(true);
        updateScoresDisplay();
        let dScore = calculateScore(dealerHand).score;
        let dAceCount = calculateScore(dealerHand).aceCount;
        while (dScore < 17 || (dScore === 17 && dAceCount > 0)) {
            setGameMessage("Dealer hits...", "");
            dealCard(dealerHand, dealerCardsEl, true);
            updateScoresDisplay();
            dScore = calculateScore(dealerHand).score;
            dAceCount = calculateScore(dealerHand).aceCount;
            if (dScore > 21) break;
        }
        determineWinner();
        endHand();
    }

    function revealDealerHoleCard(updateCount = true) {
        if (dealerHoleCard) {
            const holeCardDiv = document.getElementById(`card-${dealerHoleCard.id}`);
            if (holeCardDiv) {
                holeCardDiv.innerHTML = ''; // Clear back content
                holeCardDiv.classList.remove('card-back');
                holeCardDiv.classList.add(`suit-${dealerHoleCard.suit}`);
            countValueEl.textContent = countText;
            bottomInfoContainer.appendChild(countValueEl);

                const rankSpan = document.createElement('span');
                rankSpan.classList.add('card-rank');
                rankSpan.textContent = CARD_RANKS_MAP[dealerHoleCard.rank].display;
                holeCardDiv.appendChild(rankSpan);
            holeCardDiv.appendChild(bottomInfoContainer);

                const suitAndCountContainer = document.createElement('div');
                suitAndCountContainer.classList.add('suit-bottom-right');
                const suitSpan = document.createElement('span');
                suitSpan.classList.add('card-suit-symbol');
                suitSpan.innerHTML = getSuitSymbol(dealerHoleCard.suit);
                suitAndCountContainer.appendChild(suitSpan);
                const countValueEl = document.createElement('span');
                countValueEl.classList.add('card-count-value-text');
                let countText = dealerHoleCard.countValue > 0 ? `+${dealerHoleCard.countValue}` : dealerHoleCard.countValue;
                countValueEl.textContent = countText;
                suitAndCountContainer.appendChild(countValueEl);
                holeCardDiv.appendChild(suitAndCountContainer);

                if (updateCount) {
                    runningCount += dealerHoleCard.countValue;
                    lastCardInfoEl.textContent = `Dealer Hole: ${dealerHoleCard.displayRank}${getSuitSymbol(dealerHoleCard.suit)} (Count: ${countText})`;
                    updateCountsDisplay();
                }
            // Update running count if this reveal is part of game logic
            if (updateCountForGameLogic) {
                runningCount += dealerHoleCard.countValue;
                let hiloTextForMsg = dealerHoleCard.countValue > 0 ? `+${dealerHoleCard.countValue}` : dealerHoleCard.countValue.toString();
                lastCardInfoEl.textContent = `Dealer Hole: ${dealerHoleCard.displayRank}${getSuitSymbol(dealerHoleCard.suit)} (Count: ${hiloTextForMsg})`;
                updateCountsDisplay();
            }
            dealerHoleCard = null;
        }
        updateScoresDisplay();
    }

    function determineWinner() {
        const pFinal = calculateScore(playerHand).score;
        const dFinal = calculateScore(dealerHand).score;
        if (pFinal > 21) { /* Already handled by bust */ return; }
        if (dFinal > 21) {
            setGameMessage(`Dealer Busts! Win $${currentBet}!`, "win");
            playerChips += currentBet * 2;
        } else if (dFinal > pFinal) {
            setGameMessage(`Dealer wins (${dFinal} to ${pFinal}). Lose $${currentBet}.`, "loss");
        } else if (pFinal > dFinal) {
            setGameMessage(`Player wins (${pFinal} to ${dFinal})! Win $${currentBet}!`, "win");
            playerChips += currentBet * 2;
        } else {
            setGameMessage("Push!", "push"); playerChips += currentBet;
        }
    }

    function endHand() {
        gameInProgress = false;
        hitButton.disabled = true; standButton.disabled = true;
        dealButton.disabled = false; betAmountInput.disabled = false;
        dealButton.textContent = "Place Bet & Deal"; // Reset button text
        updateChipDisplay();
        currentBetAmountEl.textContent = 0;
        if (playerChips <= 0) {
            setGameMessage("Game Over! No chips left. Refresh to play again.", "loss");
            dealButton.disabled = true; betAmountInput.disabled = true;
        }
        dealerHoleCard = null; // The card is no longer hidden
    }

    function updateChipDisplay() { chipsAmountEl.textContent = playerChips; }

    // --- Event Listeners ---
    dealButton.addEventListener('click', startNewHand);
    hitButton.addEventListener('click', hit);
    standButton.addEventListener('click', stand);

    // --- Initial Game Setup ---
    updateChipDisplay();
    createShoe(); // Initial shoe, resets runningCount
    setGameMessage("Place bet and click 'Place Bet & Deal'.", "");
    hitButton.disabled = true; standButton.disabled = true;
    // Deal button and bet input are enabled by default for the first bet
});
    updateScoresDisplay(); // Always update scores after revealing
    }
