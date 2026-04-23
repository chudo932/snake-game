// =====================================================
// 1. ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ
// =====================================================

let scoreBlock;
let score = 0;

const config = {
  step: 0,
  maxStep: 12,
  sizeCell: 16,
  sizeBerry: 16 / 4
}

const snake = {
  x: 160,
  y: 160,
  dx: config.sizeCell,
  dy: 0,
  tails: [],
  maxTails: 3
}

let berry = {
  x: 0,
  y: 0
}

let colorBerry = {
  x: 0,
  y: 0,
  active: false
};

let canvas = document.querySelector("#game-canvas");
let context = canvas.getContext("2d");
scoreBlock = document.querySelector(".game-score .score-count");

// =====================================================
// 2. ФУНКЦИИ РАБОТЫ С РЕКОРДАМИ
// =====================================================

function saveHighScore(score) {
  const currentHighScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
  if (score > currentHighScore) {
    localStorage.setItem('highScore', score.toString());
    return true;
  }
  return false;
}

function getHighScore() {
  return parseInt(localStorage.getItem('highScore'), 10) || 0;
}

// =====================================================
// 3. ФУНКЦИИ ОТРИСОВКИ
// =====================================================

function drawGrid() {
  context.strokeStyle = "#333";
  context.lineWidth = 0.5;
  for (let x = 0; x <= canvas.width; x += config.sizeCell) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }
  for (let y = 0; y <= canvas.height; y += config.sizeCell) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }
  context.stroke();
}
// Отрисовка второй ягоды
function drawColorBerry() {
  if (!colorBerry.active) return;

  context.beginPath();
  context.fillStyle = "#00aaff";
  context.arc(
    colorBerry.x + (config.sizeCell / 2),
    colorBerry.y + (config.sizeCell / 2),
    config.sizeBerry,
    0,
    2 * Math.PI
  );
  context.fill();
}

function drawBerry() {
  context.beginPath();
  context.fillStyle = "#ff0707";
  context.arc(
    berry.x + (config.sizeCell / 2),
    berry.y + (config.sizeCell / 2),
    config.sizeBerry,
    0,
    2 * Math.PI
  );
  context.fill();
}

function drawSnake() {
  snake.x += snake.dx;
  snake.y += snake.dy;

  collisionBorder();

  snake.tails.unshift({ x: snake.x, y: snake.y });

  if (snake.tails.length > snake.maxTails) {
    snake.tails.pop();
  }

  // Генерируем цветную ягоду с вероятностью 20 % каждый ход
  if (!colorBerry.active) {
    randomPositionColorBerry();
  }

  snake.tails.forEach(function(el, index) {
  let scoredThisTurn = false; // Флаг: засчитано ли очко за этот ход

  // Проверяем столкновение с цветной ягодой
  if (el.x === colorBerry.x && el.y === colorBerry.y && colorBerry.active && !scoredThisTurn) {
    changeSnakeColor();
    colorBerry.active = false;
    scoredThisTurn = true;
  }

  if (index == 0) {
    context.fillStyle = snake.headColor || "#226d13";
  } else {
    context.fillStyle = snake.bodyColor || "#3d9c42";
  }
  context.fillRect(el.x, el.y, config.sizeCell, config.sizeCell);

  // Проверяем столкновение с обычной ягодой (только если ещё не засчитано очко)
  if (el.x === berry.x && el.y === berry.y && !scoredThisTurn) {
    snake.maxTails++;
    incScore(); // +1 очко
    randomPositionBerry();
  }

  for (let i = index + 1; i < snake.tails.length; i++) {
    if (el.x == snake.tails[i].x && el.y == snake.tails[i].y) {
      refreshGame();
    }
  }
});

}

function drawScore() {
  const currentScore = score;
  const highScore = getHighScore();
  if (scoreBlock) {
    scoreBlock.innerHTML = `Счёт: ${currentScore} | Рекорд: ${highScore}`;
  }
}

// =====================================================
// 4. ИГРОВАЯ ЛОГИКА
// =====================================================

function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (++config.step < config.maxStep) {
    return;
  }
  config.step = 0;

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawBerry();
  drawColorBerry();
  drawSnake();
}

function collisionBorder() {
  if (snake.x < 0) {
    snake.x = canvas.width - config.sizeCell;
  } else if (snake.x >= canvas.width) {
    snake.x = 0;
  }

  if (snake.y < 0) {
    snake.y = canvas.height - config.sizeCell;
  } else if (snake.y >= canvas.height) {
    snake.y = 0;
  }
}

function refreshGame() {
  score = 0;
  drawScore();

  snake.x = 160;
  snake.y = 160;
  snake.tails = [];
  snake.maxTails = 3;
  snake.dx = config.sizeCell;
  snake.dy = 0;
  snake.headColor = undefined; // Сброс цвета головы
  snake.bodyColor = undefined; // Сброс цвета тела

  randomPositionBerry();
  colorBerry.active = false;
}

// =====================================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =====================================================

function randomPositionBerry() {
  berry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
  berry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
}
// Вызов второй ягоды
function randomPositionColorBerry() {
  if (Math.random() > 0.2) {
    colorBerry.active = false;
    return;
  }

  colorBerry.active = true;
  colorBerry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
  colorBerry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
// проверка на появление на змее
  for (let tail of snake.tails) {
    if (colorBerry.x === tail.x && colorBerry.y === tail.y) {
      randomPositionColorBerry();
      return;
    }
  }
}

function changeSnakeColor() {
  const colors = [
    { head: "#ff6b6b", body: "#ee5253" }, // Красный
    { head: "#00cec9", body: "#01a2a6" }, // Бирюзовый
    { head: "#ffeaa7", body: "#fdcb6e" }, // Жёлтый
    { head: "#a29bfe", body: "#6c5ce7" }, // Фиолетовый
    { head: "#fd79a8", body: "#e84393" }  // Розовый
  ];

  const newColor = colors[Math.floor(Math.random() * colors.length)];
  snake.headColor = newColor.head;
  snake.bodyColor = newColor.body;

  // +2 очка за синию ягоду
  score += 2; 
  saveHighScore(score);
  drawScore();
}

function incScore() {
  score++;
  saveHighScore(score);
  drawScore();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// =====================================================
// 6. ОБРАБОТКА ВВОДА
// =====================================================

document.addEventListener("keydown", function (e) {
  if (e.code == "KeyW") {
    snake.dy = -config.sizeCell;
    snake.dx = 0;
  } else if (e.code == "KeyA") {
    snake.dx = -config.sizeCell;
    snake.dy = 0;
  } else if (e.code == "KeyS") {
    snake.dy = config.sizeCell;
    snake.dx = 0;
  } else if (e.code == "KeyD") {
    snake.dx = config.sizeCell;
    snake.dy = 0;
  }
});

// =====================================================
// 7. ЗАПУСК ИГРЫ
// =====================================================

drawScore(); // Инициализация отображения счёта
requestAnimationFrame(gameLoop); // Запуск игрового цикла