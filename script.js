const cards = [
  '2', '3', '4', '5', '6', // +1
  '7', '8', '9',           // 0
  '10', 'J', 'Q', 'K', 'A' // -1
];
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

function checkCount() {
  const userCount = parseInt(document.getElementById('userCount').value);
  const result = document.getElementById('result');
  if (userCount === runningCount) {
    result.textContent = 'Correct!';
    result.style.color = 'lightgreen';
  } else {
    result.textContent = `Wrong. Correct count: ${runningCount}`;
    result.style.color = 'red';
  }
}
