const cards = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
let count = 0;
let currentCard = '';
let timer;
let timeLeft = 0;
let mode = 'practice';

const modeTimes = {
  practice: 0,
  beginner: 15,
  advanced: 10,
  expert: 5
};

function startGame(selectedMode) {
  mode = selectedMode;
  count = 0;
  document.getElementById('countDisplay').innerText = count;
  document.getElementById('gameArea').style.display = 'block';
  document.getElementById('message').innerText = '';
  nextCard();
}

function nextCard() {
  clearInterval(timer);
  currentCard = cards[Math.floor(Math.random() * cards.length)];
  document.getElementById('cardDisplay').innerText = currentCard;

  timeLeft = modeTimes[mode];
  document.getElementById('timer').innerText = timeLeft === 0 ? '∞' : timeLeft;

  if (timeLeft > 0) {
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        gameOver('Time\'s up!');
      }
    }, 1000);
  }
}

function cardValue(card) {
  if (['2','3','4','5','6'].includes(card)) return 1;
  if (['7','8','9'].includes(card)) return 0;
  return -1;
}

function userInput(input) {
  const correct = cardValue(currentCard);
  if (input === correct) {
    count += correct;
    document.getElementById('countDisplay').innerText = count;
    nextCard();
  } else {
    gameOver('Wrong answer!');
  }
}

function gameOver(reason) {
  clearInterval(timer);
  document.getElementById('message').innerText = reason + ' Final Count: ' + count;
  document.getElementById('gameArea').style.display = 'none';
}
