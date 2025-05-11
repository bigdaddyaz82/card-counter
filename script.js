let runningCount = 0;

function getCardValue(card) {
  if (['2', '3', '4', '5', '6'].includes(card)) return 1;
  if (['10', 'J', 'Q', 'K', 'A'].includes(card)) return -1;
  return 0;
}

function nextCard() {
  const card = cards[Math.floor(Math.random() * cards.length)];
  document.getElementById('card').textContent = card;
  runningCount += getCardValue(card);
  document.getElementById('result').textContent = '';
  document.getElementById('userCount').value = '';
}

function adjustCount(amount) {
  const input = document.getElementById('userCount');
  input.value = parseInt(input.value || '0') + amount;
}

function checkCount() {
  const userCount = parseInt(document.getElementById('userCount').value);
  const result = document.getElementById('result');
  if (userCount === runningCount) {
    result.textContent = 'Correct!';
    result.className = 'correct'; // Adds the correct class (light green)
  } else {
    result.textContent = `Wrong. Correct count: ${runningCount}`;
    result.className = 'wrong'; // Adds the wrong class (red)
  }
}
