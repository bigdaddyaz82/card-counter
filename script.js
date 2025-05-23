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
            rankSpan.textContent = CARD_RANKS_MAP[dealerHoleCard.rank].display;
            holeCardDiv.appendChild(rankSpan);

            // Container for Suit Symbol and Hi-Lo Count Value
            const bottomInfoContainer = document.createElement('div');
            bottomInfoContainer.classList.add('card-bottom-info');

            const suitSpan = document.createElement('span');
            suitSpan.classList.add('card-suit-symbol');
            suitSpan.innerHTML = getSuitSymbol(dealerHoleCard.suit);
            bottomInfoContainer.appendChild(suitSpan);

            const countValueEl = document.createElement('span');
            countValueEl.classList.add('card-count-value-text');
            let countText = dealerHoleCard.countValue.toString();
            if (dealerHoleCard.countValue > 0) {
                countText = "+" + countText;
            }
            countValueEl.textContent = countText;
            bottomInfoContainer.appendChild(countValueEl);

            holeCardDiv.appendChild(bottomInfoContainer);


            // Update running count if this reveal is part of game logic
            if (updateCountForGameLogic) {
                runningCount += dealerHoleCard.countValue;
                let hiloTextForMsg = dealerHoleCard.countValue > 0 ? `+${dealerHoleCard.countValue}` : dealerHoleCard.countValue.toString();
                lastCardInfoEl.textContent = `Dealer Hole: ${dealerHoleCard.displayRank}${getSuitSymbol(dealerHoleCard.suit)} (Count: ${hiloTextForMsg})`;
                updateCountsDisplay();
            }
        }
        dealerHoleCard = null; // The card is no longer hidden
    }
    updateScoresDisplay(); // Always update scores after revealing
}
