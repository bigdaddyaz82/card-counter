class BlackjackGame {
    constructor() {
        this.SUITS = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
        this.VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.NUM_DECKS = 6;
        this.RESHUFFLE_PENETRATION = 0.75; // Reshuffle after 75% of cards dealt

        this.shoe = [];
        this.playerCards = [];
        this.dealerCards = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.playerChips = 1000;
        this.currentBet = 0;
        this.runningCount = 0;
        this.trueCount = 0;
        this.isPlayerTurn = false;
        this.initialDealDone = false;

        // DOM Elements
        this.chipCountEl = document.getElementById('chip-count');
        this.currentBetEl = document.getElementById('current-bet');
        this.runningCountEl = document.getElementById('running-count');
        this.trueCountEl = document.getElementById('true-count');
        this.cardsInShoeEl = document.getElementById('cards-in-shoe');
        this.dealerScoreEl = document.getElementById('dealer-score');
        this.dealerCardsEl = document.getElementById('dealer-cards');
        this.playerScoreEl = document.getElementById('player-score');
        this.playerCardsEl = document.getElementById('player-cards');
        this.messageEl = document.getElementById('message');
        this.betAmountInput = document.getElementById('bet-amount');
        this.dealButton = document.getElementById('deal-button');
        this.hitButton = document.getElementById('hit-button');
        this.standButton = document.getElementById('stand-button');
        this.bettingControlsEl = document.getElementById('betting-controls');
        this.actionControlsEl = document.getElementById('action-controls');

        this._setupEventListeners();
        this._initializeShoe();
        this.updateDisplay();
    }

    _createDeck() {
        let deck = [];
        for (let suit of this.SUITS) {
            for (let value of this.VALUES) {
                deck.push({ value, suit });
            }
        }
        return deck;
    }

    _initializeShoe() {
        this.shoe = [];
        for (let i = 0; i < this.NUM_DECKS; i++) {
            this.shoe.push(...this._createDeck());
        }
        this._shuffleShoe();
        this.runningCount = 0; // Reset running count on new shoe
        this.messageEl.textContent = "New shoe! Place your bet.";
        this.messageEl.className = 'message reshuffle';
    }

    _shuffleShoe() {
        // Fisher-Yates Shuffle
        for (let i = this.shoe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shoe[i], this.shoe[j]] = [this.shoe[j], this.shoe[i]];
        }
    }

    _dealCard(targetHand, isDealerHidden = false) {
        if (this.shoe.length === 0) {
            this.messageEl.textContent = "Shoe is empty! This shouldn't happen.";
            return null;
        }
        const card = this.shoe.pop();
        card.hidden = isDealerHidden; // For dealer's first hidden card
        targetHand.push(card);
        if (!isDealerHidden) { // Don't count hidden card until revealed
            this._updateRunningCount(card.value);
        }
        this._calculateTrueCount();
        return card;
    }

    _updateRunningCount(cardValue) {
        if (['2', '3', '4', '5', '6'].includes(cardValue)) {
            this.runningCount++;
        } else if (['10', 'J', 'Q', 'K', 'A'].includes(cardValue)) {
            this.runningCount--;
        }
    }

    _calculateTrueCount() {
        const decksRemaining = Math.max(0.25, this.shoe.length / 52); // Avoid division by zero or tiny denominators
        this.trueCount = decksRemaining > 0 ? Math.round(this.runningCount / decksRemaining) : 0;
    }

    _getHandValue(hand) {
        let score = 0;
        let aceCount = 0;
        for (let card of hand) {
            if (card.hidden) continue; // Don't count hidden cards for score display yet

            if (card.value === 'A') {
                aceCount++;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        return score;
    }

    _checkReshuffle() {
        if (this.shoe.length < (this.NUM_DECKS * 52 * (1 - this.RESHUFFLE_PENETRATION))) {
            this.messageEl.textContent = "Reshuffling the shoe...";
            this.messageEl.className = 'message reshuffle';
            setTimeout(() => { // Give a moment for the message to be seen
                this._initializeShoe();
                this.updateDisplay(); // Update counts and shoe size
                this.messageEl.textContent = "Shoe reshuffled! Place your bet.";
            }, 2000);
            return true;
        }
        return false;
    }

    _setupEventListeners() {
        this.dealButton.addEventListener('click', () => this.startNewRound());
        this.hitButton.addEventListener('click', () => this.playerHit());
        this.standButton.addEventListener('click', () => this.playerStand());
    }

    startNewRound() {
        if (this._checkReshuffle()) {
             // Reshuffle message is handled in _checkReshuffle, wait for it
            setTimeout(() => this.bettingControlsEl.style.display = 'block', 2100);
            this.actionControlsEl.style.display = 'none';
            return; // Wait for reshuffle to complete if it happened
        }

        const bet = parseInt(this.betAmountInput.value);
        if (isNaN(bet) || bet <= 0 || bet > this.playerChips) {
            this.messageEl.textContent = "Invalid bet amount.";
            this.messageEl.className = 'message lose';
            return;
        }

        this.currentBet = bet;
        this.playerChips -= this.currentBet;
        this.isPlayerTurn = true;
        this.initialDealDone = false;

        this.playerCards = [];
        this.dealerCards = [];

        // Deal initial cards
        this._dealCard(this.playerCards);
        this._dealCard(this.dealerCards, true); // Dealer's first card hidden
        this._dealCard(this.playerCards);
        this._dealCard(this.dealerCards);

        this.playerScore = this._getHandValue(this.playerCards);
        this.dealerScore = this._getHandValue(this.dealerCards); // Will only count visible card initially

        this.updateDisplay();
        this.bettingControlsEl.style.display = 'none';
        this.actionControlsEl.style.display = 'block';
        this.messageEl.textContent = "Your turn. Hit or Stand?";
        this.messageEl.className = 'message';

        // Check for player Blackjack immediately
        if (this.playerScore === 21 && this.playerCards.length === 2) {
            this.revealDealerCard(); // Need to see dealer's full hand
            this.dealerScore = this._getHandValue(this.dealerCards);
            this.updateDisplay();

            if (this.dealerScore === 21 && this.dealerCards.length === 2) { // Dealer also has Blackjack
                this.messageEl.textContent = "Push! Both have Blackjack.";
                this.messageEl.className = 'message push';
                this.playerChips += this.currentBet; // Return bet
            } else {
                this.messageEl.textContent = "Blackjack! You win 3:2!";
                this.messageEl.className = 'message blackjack';
                this.playerChips += this.currentBet * 2.5; // Bet back + 1.5x winnings
            }
            this.endRound();
        }
        this.initialDealDone = true;
    }

    playerHit() {
        if (!this.isPlayerTurn) return;
        this._dealCard(this.playerCards);
        this.playerScore = this._getHandValue(this.playerCards);
        this.updateDisplay();

        if (this.playerScore > 21) {
            this.messageEl.textContent = `Bust! You lost $${this.currentBet}.`;
            this.messageEl.className = 'message lose';
            this.endRound();
        } else if (this.playerScore === 21) {
            this.playerStand(); // Auto-stand on 21
        }
    }

    playerStand() {
        if (!this.isPlayerTurn) return;
        this.isPlayerTurn = false;
        this.revealDealerCard();
        this.dealerPlay();
    }

    revealDealerCard() {
        const hiddenCard = this.dealerCards.find(card => card.hidden);
        if (hiddenCard) {
            hiddenCard.hidden = false;
            this._updateRunningCount(hiddenCard.value); // Now count the revealed card
            this._calculateTrueCount();
        }
        this.dealerScore = this._getHandValue(this.dealerCards);
        this.updateDisplay(); // Update display with revealed card and new counts
    }

    dealerPlay() {
        this.messageEl.textContent = "Dealer's turn...";
        this.messageEl.className = 'message';

        // Dealer reveals hidden card (already done in playerStand via revealDealerCard)
        // this.dealerScore is already updated.

        const playInterval = setInterval(() => {
            if (this.dealerScore < 17) { // Dealer hits on 16 or less (stands on soft 17 by default)
                                        // To hit on soft 17: this.dealerScore < 17 || (this.dealerScore === 17 && this._hasAce(this.dealerCards) && this._getHandValue([{value:'A'}, ...this.dealerCards.filter(c=>c.value!=='A') && this._getHandValue(this.dealerCards.filter(c=>c.value!=='A')) === 6]))
                                        // ^^^ Simplified soft 17 check: (this.dealerScore === 17 && this.dealerCards.some(c => c.value === 'A' && this._getHandValue(this.dealerCards) === 17))
                                        // Correct soft 17 logic: If score is 17 and an Ace is counted as 11.
                let hasAceContributingTo17 = false;
                if (this.dealerScore === 17) {
                    let tempScore = 0;
                    let aceCount = 0;
                    for(let card of this.dealerCards) {
                        if(card.value === 'A') aceCount++;
                        tempScore += this._getCardNumericValue(card.value, true); // Count Ace as 11
                    }
                    while(tempScore > 21 && aceCount > 0) {
                        tempScore -=10;
                        aceCount--;
                    }
                    if (tempScore === 17 && this.dealerCards.some(c => c.value === 'A' && this._getCardNumericValue(c.value, true) === 11)) {
                       // This is a soft 17. For "Dealer STANDS on soft 17", we stop.
                       // For "Dealer HITS on soft 17", we would continue to hit.
                       // Current implementation: STANDS on soft 17.
                       // To HIT on soft 17, add a game rule and check here, then deal.
                    }
                }


                this._dealCard(this.dealerCards);
                this.dealerScore = this._getHandValue(this.dealerCards);
                this.updateDisplay();
            } else {
                clearInterval(playInterval);
                this._determineWinner();
            }
        }, 1000); // Delay for dealer actions
    }
    
    _getCardNumericValue(value, countAceAsEleven = false) {
        if (['K', 'Q', 'J'].includes(value)) return 10;
        if (value === 'A') return countAceAsEleven ? 11 : 1; // Simplified for this specific check
        return parseInt(value);
    }


    _determineWinner() {
        if (this.playerScore > 21) { // Player already busted, handled in playerHit
            // this.messageEl.textContent = `Player busts! Dealer wins. You lost $${this.currentBet}.`;
            // this.messageEl.className = 'message lose';
        } else if (this.dealerScore > 21) {
            this.messageEl.textContent = `Dealer busts! You win $${this.currentBet}!`;
            this.messageEl.className = 'message win';
            this.playerChips += this.currentBet * 2;
        } else if (this.dealerScore === this.playerScore) {
            this.messageEl.textContent = `Push! Bet of $${this.currentBet} returned.`;
            this.messageEl.className = 'message push';
            this.playerChips += this.currentBet;
        } else if (this.playerScore > this.dealerScore) {
            this.messageEl.textContent = `You win $${this.currentBet}!`;
            this.messageEl.className = 'message win';
            this.playerChips += this.currentBet * 2;
        } else {
            this.messageEl.textContent = `Dealer wins. You lost $${this.currentBet}.`;
            this.messageEl.className = 'message lose';
        }
        this.endRound();
    }

    endRound() {
        this.isPlayerTurn = false;
        this.currentBet = 0;
        this.bettingControlsEl.style.display = 'block';
        this.actionControlsEl.style.display = 'none';
        this.updateDisplay();

        if (this.playerChips <= 0) {
            this.messageEl.textContent = "Game Over! You're out of chips. Refresh to play again.";
            this.messageEl.className = 'message lose';
            this.dealButton.disabled = true;
            this.betAmountInput.disabled = true;
        }
    }

    updateDisplay() {
        this.chipCountEl.textContent = this.playerChips;
        this.currentBetEl.textContent = this.currentBet;
        this.runningCountEl.textContent = this.runningCount;
        this.trueCountEl.textContent = this.trueCount;
        this.cardsInShoeEl.textContent = this.shoe.length;

        this.dealerScoreEl.textContent = this.initialDealDone ? (this.dealerCards.some(c=>c.hidden) ? this._getHandValue(this.dealerCards.filter(c=>!c.hidden)) : this.dealerScore) : 0;
        this.playerScoreEl.textContent = this.playerScore;

        this._renderCards(this.dealerCards, this.dealerCardsEl);
        this._renderCards(this.playerCards, this.playerCardsEl);
    }

    _renderCards(hand, element) {
        element.innerHTML = '';
        for (let card of hand) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.textContent = card.hidden ? '?' : `${card.value}${card.suit[0]}`; // Show suit initial
            if (card.suit === 'H' || card.suit === 'D') {
                cardDiv.style.color = 'red';
            }
            element.appendChild(cardDiv);
        }
    }
}

// Initialize the game
const game = new BlackjackGame();
