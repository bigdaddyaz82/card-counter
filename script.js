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
    const decksRemainingEl = document.getElementById('decks-remaining');
    const reshuffleMessageEl = document.getElementById('reshuffle-message');


    // --- Game Variables ---
    const NUM_DECKS = 4; // Number of decks in the shoe
    let shoe = [];
    let playerHand = [];
    let dealerHand = [];
    let playerScore = 0;
    let dealerScore = 0;
    let playerAceCount = 0;
    let dealerAceCount = 0;
    let runningCount = 0;
    let gameInProgress = false;
    let dealerHoleCard = null; // To store the dealer's face-down card object

    const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const CARD_SUITS = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades

    // --- Game Logic Functions ---

    function getCardBlackjackValue(rank) {
        if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
        if (rank === 'A') return 11; // Ace is initially 11
        return parseInt(rank);
    }

    function getCardHiLoValue(rank) {
        if (['A', 'K', 'Q', 'J', '10'].includes(rank)) return -1;
        if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
        return 0; // 7, 8, 9
    }

    function createShoe() {
        shoe = [];
        for (let i = 0; i < NUM_DECKS; i++) {
            for (const suit of CARD_SUITS) {
                for (const rank of CARD_RANKS) {
                    shoe.push({
                        rank: rank,
                        suit: suit,
                        bjValue: getCardBlackjackValue(rank),
                        countValue: getCardHiLoValue(rank),
                        id: `${rank}${suit}${i}` // Unique ID for card element
                    });
                }
            }
        }
        shuffleShoe();
        runningCount = 0;
        updateCountsDisplay();
        reshuffleMessageEl.textContent = "New Shoe! Shuffled.";
        setTimeout(() => reshuffleMessageEl.textContent = "", 3000);
    }

    function shuffleShoe() {
        for (let i = shoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
        }
    }

    function dealCard(targetHand, targetEl, isVisible = true, isPlayer = true) {
        if (shoe.length === 0) {
            reshuffleMessageEl.textContent = "Shoe empty. Reshuffling...";
            createShoe();
            // Add a small delay or message to user
            if (shoe.length === 0) { // Should not happen
                gameMessageEl.textContent = "Error: Could not create shoe.";
                return null;
            }
        }

        const card = shoe.pop();
        targetHand.push(card);

        if (isVisible) {
            runningCount += card.countValue;
            lastCardInfoEl.textContent = `Card: ${card.rank}${card.suit} (Count: ${card.countValue > 0 ? '+' : ''}${card.countValue})`;
        } else {
            if (!isPlayer) dealerHoleCard = card; // Store dealer's hole card
            lastCardInfoEl.textContent = ""; // Clear for hidden card
        }
        updateCountsDisplay();
        renderCard(card, targetEl, isVisible);
        return card;
    }

    function renderCard(card, targetEl, isVisible) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.id = `card-${card.id}`; // Assign a unique ID

        if (isVisible) {
            const rankSpan = document.createElement('span');
            rankSpan.classList.add('rank');
            rankSpan.textContent = card.rank;

            const suitSpan = document.createElement('span');
            suitSpan.classList.add('suit', `suit-${card.suit}`);
            suitSpan.textContent = getSuitSymbol(card.suit); // Use symbols for suits

            const countValSpan = document.createElement('span');
            countValSpan.classList.add('count-value');
            countValSpan.textContent = `${card.countValue > 0 ? '+' : ''}${card.countValue}`;

            cardDiv.appendChild(rankSpan);
            cardDiv.appendChild(suitSpan);
            cardDiv.appendChild(countValSpan); // Show count value on the card
        } else {
            cardDiv.classList.add('back');
            cardDiv.textContent = ""; // No text on back
        }
        targetEl.appendChild(cardDiv);
    }

    function getSuitSymbol(suitChar) {
        switch(suitChar) {
            case 'H': return '♥';
            case 'D': return '♦';
            case 'C': return '♣';
            case 'S': return '♠';
            default: return suitChar;
        }
    }


    function calculateScore(hand) {
        let score = 0;
        let aceCount = 0;
        for (const card of hand) {
            score += card.bjValue;
            if (card.rank === 'A') {
                aceCount++;
            }
        }
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        return { score: score, aceCount: aceCount };
    }

    function updateScoresDisplay() {
        const pResult = calculateScore(playerHand);
        playerScore = pResult.score;
        playerAceCount = pResult.aceCount;
        playerScoreEl.textContent = playerScore;

        // For dealer, if game is ongoing and hole card exists, calculate score based on visible cards only for display
        let dScoreToDisplay = 0;
        if (gameInProgress && dealerHand.length > 0 && dealerHoleCard && dealerHand[0].id === dealerHoleCard.id && dealerHand.length > 1) {
             // Calculate score only of the upcard if hole card is still hidden
             dScoreToDisplay = calculateScore([dealerHand[1]]).score; // Assuming second card is the upcard
        } else {
            // Calculate full score if hole card is revealed or it's the end of game
            const dResult = calculateScore(dealerHand);
            dealerScore = dResult.score;
            dealerAceCount = dResult.aceCount;
            dScoreToDisplay = dealerScore;
        }
         dealerScoreEl.textContent = dScoreToDisplay;
    }


    function updateCountsDisplay() {
        runningCountEl.textContent = runningCount;
        const decksLeft = shoe.length / 52;
        decksRemainingEl.textContent = decksLeft.toFixed(1);
        if (decksLeft > 0.1) {
            const trueCountVal = runningCount / decksLeft;
            trueCountEl.textContent = trueCountVal.toFixed(2);
        } else {
            trueCountEl.textContent = "N/A";
        }
    }

    function startNewHand() {
        // Reshuffle logic (e.g., if less than 25% of shoe remains)
        if (shoe.length < (NUM_DECKS * 52 * 0.25) && shoe.length > 0) { // Don't reshuffle if just started
            reshuffleMessageEl.textContent = "Low deck penetration. Reshuffling...";
            setTimeout(() => { // Delay reshuffle slightly for message visibility
                createShoe();
                resetHandState();
                dealInitialCards();
            }, 1500);
            return;
        } else if (shoe.length === 0) {
            createShoe(); // If shoe is completely empty, create a new one immediately
        }


        resetHandState();
        dealInitialCards();
    }

    function resetHandState() {
        gameInProgress = true;
        playerHand = [];
        dealerHand = [];
        dealerHoleCard = null;
        playerScore = 0;
        dealerScore = 0;
        playerAceCount = 0;
        dealerAceCount = 0;

        // Clear card displays
        dealerCardsEl.innerHTML = '';
        playerCardsEl.innerHTML = '';
        gameMessageEl.textContent = '';
        lastCardInfoEl.textContent = ''; // Clear last card info for new hand

        hitButton.disabled = false;
        standButton.disabled = false;
        dealButton.textContent = "New Hand";
        updateScoresDisplay(); // Reset scores to 0 on display
        // Counts (RC, TC) are not reset here, they persist through hands until shuffle
    }


    function dealInitialCards() {
        // Player gets two cards face up
        dealCard(playerHand, playerCardsEl, true, true);
        dealCard(playerHand, playerCardsEl, true, true);

        // Dealer gets one card face down, one face up
        dealCard(dealerHand, dealerCardsEl, false, false); // Hole card
        dealCard(dealerHand, dealerCardsEl, true, false);  // Up card

        updateScoresDisplay();
        checkInitialBlackjack();
    }

    function checkInitialBlackjack() {
        updateScoresDisplay(); // Ensure scores are current
        const playerHasBlackjack = playerScore === 21 && playerHand.length === 2;
        const dealerUpCard = dealerHand.length > 1 ? dealerHand[1] : null; // Second card is upcard
        const dealerShowsPotentialBlackjack = dealerUpCard && (dealerUpCard.bjValue === 10 || dealerUpCard.rank === 'A');

        if (playerHasBlackjack) {
            revealDealerHoleCard(true); // Reveal dealer card
            updateScoresDisplay(); // Update dealer score with hole card
            const dealerHasBlackjack = dealerScore === 21 && dealerHand.length === 2;
            if (dealerHasBlackjack) {
                gameMessageEl.textContent = "Push! Both have Blackjack.";
            } else {
                gameMessageEl.textContent = "Player Blackjack! Player wins!";
            }
            endHand();
        } else if (dealerShowsPotentialBlackjack) {
            // In a real game, dealer checks for Blackjack if showing Ace or 10.
            // For simplicity here, we'll reveal and check if player stands or busts.
            // If player doesn't have blackjack, game continues.
        }
    }


    function hit() {
        if (!gameInProgress) return;
        dealCard(playerHand, playerCardsEl, true, true);
        updateScoresDisplay();

        if (playerScore > 21) {
            gameMessageEl.textContent = "Player Busts! Dealer wins.";
            revealDealerHoleCard(false); // Reveal even on bust for count
            endHand();
        } else if (playerScore === 21) {
            stand(); // Auto-stand if player hits to 21
        }
    }

    function stand() {
        if (!gameInProgress) return;
        revealDealerHoleCard(true); // Reveal and count dealer's hole card
        updateScoresDisplay(); // Update dealer's score with the revealed card

        // Dealer's turn
        while (dealerScore < 17 && playerScore <= 21) {
            // Dealer must hit on soft 17 in many games, adjust if needed.
            // For simplicity: dealer hits until 17 or more.
            if (dealerScore < 17 || (dealerScore === 17 && dealerAceCount > 0 && calculateScore(dealerHand).score === 17) ) { // Hit on soft 17
                 dealCard(dealerHand, dealerCardsEl, true, false);
                 updateScoresDisplay();
            } else {
                break; // Stand on hard 17 or more, or soft 18+
            }
        }
        determineWinner();
        endHand();
    }

    function revealDealerHoleCard(updateCount = true) {
        if (dealerHoleCard) {
            const holeCardEl = document.getElementById(`card-${dealerHoleCard.id}`);
            if (holeCardEl) {
                holeCardEl.classList.remove('back');
                holeCardEl.innerHTML = ''; // Clear back content

                const rankSpan = document.createElement('span');
                rankSpan.classList.add('rank');
                rankSpan.textContent = dealerHoleCard.rank;

                const suitSpan = document.createElement('span');
                suitSpan.classList.add('suit', `suit-${dealerHoleCard.suit}`);
                suitSpan.textContent = getSuitSymbol(dealerHoleCard.suit);

                const countValSpan = document.createElement('span');
                countValSpan.classList.add('count-value');
                countValSpan.textContent = `${dealerHoleCard.countValue > 0 ? '+' : ''}${dealerHoleCard.countValue}`;


                holeCardEl.appendChild(rankSpan);
                holeCardEl.appendChild(suitSpan);
                holeCardEl.appendChild(countValSpan);


                if (updateCount) {
                    runningCount += dealerHoleCard.countValue;
                    lastCardInfoEl.textContent = `Dealer Hole: ${dealerHoleCard.rank}${dealerHoleCard.suit} (Count: ${dealerHoleCard.countValue > 0 ? '+' : ''}${dealerHoleCard.countValue})`;
                    updateCountsDisplay();
                }
            }
            dealerHoleCard = null; // Hole card is now revealed
        }
    }

    function determineWinner() {
        updateScoresDisplay(); // Final score update
        if (playerScore > 21) {
            gameMessageEl.textContent = "Player Busts! Dealer wins.";
        } else if (dealerScore > 21) {
            gameMessageEl.textContent = "Dealer Busts! Player wins.";
        } else if (dealerScore > playerScore) {
            gameMessageEl.textContent = "Dealer wins.";
        } else if (playerScore > dealerScore) {
            gameMessageEl.textContent = "Player wins.";
        } else {
            gameMessageEl.textContent = "Push!";
        }
    }

    function endHand() {
        gameInProgress = false;
        hitButton.disabled = true;
        standButton.disabled = true;
        dealButton.textContent = "Deal New Hand";
    }

    // --- Event Listeners ---
    hitButton.addEventListener('click', hit);
    standButton.addEventListener('click', stand);
    dealButton.addEventListener('click', () => {
        if (!gameInProgress || shoe.length < (NUM_DECKS * 52 * 0.75)) { // Start new game or if hand ended
            startNewHand();
        }
    });

    // --- Initial Game Setup ---
    createShoe(); // Create and shuffle the shoe first
    startNewHand(); // Then deal the first hand
});
