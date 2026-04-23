// =====================================================
// 1. ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ
// =====================================================
let canvas;
let context;
let scoreBlock;
let score = 0;
let stepCounter = 0; // Счётчик кадров для ограничения скорости

const config = {
  step: 0,
  maxStep: 12,
  sizeCell: 16,
  sizeBerry: 16 / 4
};

const snake = {
  x: 160,
  y: 160,
  dx: config.sizeCell,
  dy: 0,
  tails: [],
  maxTails: 3,
  headColor: "#226d13",
  bodyColor: "#3d9c42"
};

let berry = { x: 0, y: 0 };
let colorBerry = { x: 0, y: 0, active: false };
let purpleBerry = { x: 0, y: 0, active: false };

let backgroundMusic = document.getElementById('backgroundMusic');

// =====================================================
// 2. ФУНКЦИИ РАБОТЫ С РЕКОРДАМИ
// =====================================================
function saveHighScore(score) {
  const currentHighScore = parseInt(localStorage.getItem('highScore'), 10) || 0;
  if (score > currentHighScore) {
    localStorage.setItem('highScore', score.toString());
  }
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

function drawPurpleBerry() {
  if (!purpleBerry.active) return;
  context.beginPath();
  context.fillStyle = "#8312ec";
  context.arc(
    purpleBerry.x + (config.sizeCell / 2),
    purpleBerry.y + (config.sizeCell / 2),
    config.sizeBerry,
    0,
    2 * Math.PI
  );
  context.fill();
}

function drawSnake() {
  snake.tails.forEach(function(el, index) {
    context.fillStyle = (index === 0) ? snake.headColor : snake.bodyColor;
    context.fillRect(el.x, el.y, config.sizeCell, config.sizeCell);
  });
}

function drawScore() {
  scoreBlock.innerHTML = `Счёт: ${score} | Рекорд: ${getHighScore()}`;
}

// =====================================================
// 4. ИГРОВАЯ ЛОГИКА
// =====================================================
function gameLoop() {
  // 1. Очистка
  context.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Логика (движение, коллизии)
  updateSnake();

  // 3. Отрисовка
  drawGrid();
  drawSnake();
  drawBerry();
  drawColorBerry();
  drawPurpleBerry();
  drawScore();

  // 4. Следующий кадр
  requestAnimationFrame(gameLoop);
}

function collisionBorder() {
  if (snake.x < 0) snake.x = canvas.width - config.sizeCell;
  else if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - config.sizeCell;
  else if (snake.y >= canvas.height) snake.y = 0;
}

function refreshGame() {
  score = 0;
  drawScore();
  snake.x = 160;
  snake.y = 160;
  snake.maxTails = 3;
  snake.dx = config.sizeCell;
  snake.dy = 0;
  randomPositionBerry();
  colorBerry.active = false;
  purpleBerry.active = false;
  pauseBackgroundMusic();
  snake.tails = [{ x: snake.x, y: snake.y }]; // Создаём первый сегмент
}

// =====================================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =====================================================
function randomPositionBerry() {
  berry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
  berry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
}

function randomPositionColorBerry() {
  if (Math.random() > 0.2) {
    colorBerry.active = false;
    return;
  }
  colorBerry.active = true;
  let attempts = 0;
  do {
    colorBerry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
    colorBerry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
    attempts++;
  } while (
    attempts < 100 &&
    (snake.tails.some(tail => tail.x === colorBerry.x && tail.y === colorBerry.y) ||
     (berry.x === colorBerry.x && berry.y === colorBerry.y))
  );
  if (attempts >= 100) colorBerry.active = false;
}

function randomPositionPurpleBerry() {
  if (Math.random() > 0.1) {
    purpleBerry.active = false;
    return;
  }
  purpleBerry.active = true;
  let attempts = 0;
  do {
    purpleBerry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
    purpleBerry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;
    attempts++;
  } while (
    attempts < 100 &&
    (snake.tails.some(tail => tail.x === purpleBerry.x && tail.y === purpleBerry.y) ||
     (berry.x === purpleBerry.x && berry.y === purpleBerry.y) ||
     (colorBerry.x === purpleBerry.x && colorBerry.y === purpleBerry.y))
  );
  if (attempts >= 100) purpleBerry.active = false;
}

function handlePurpleBerry() {
  const reduction = getRandomInt(3, 9);
  const newLength = Math.max(snake.maxTails - reduction, 3);
  snake.maxTails = newLength;

  while (snake.tails.length > snake.maxTails) {
    snake.tails.pop();
  }
  // Ускорение на 1 секунду
  const originalSpeed = config.maxStep;
  config.maxStep = Math.floor(config.maxStep / 1.5);
  setTimeout(() => {
    config.maxStep = originalSpeed;
  }, 1000);

  score = Math.max(score - 3, 0);
  saveHighScore(score);
  drawScore();
}

function changeSnakeColor() {
  const colors = [
    { head: "#ff6b6b", body: "#ee5253" },
    { head: "#00cec9", body: "#01a2a6" },
    { head: "#ffeaa7", body: "#fdcb6e" },
    { head: "#a29bfe", body: "#6c5ce7" },
    { head: "#fd79a8", body: "#e84393" },
    { head: "#f0edee", body: "#9e979b" }
  ];
  const newColor = colors[Math.floor(Math.random() * colors.length)];
  snake.headColor = newColor.head;
  snake.bodyColor = newColor.body;
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
// 6. АУДИО ФУНКЦИИ
// =====================================================
function playBackgroundMusic() {
  backgroundMusic.play().catch(e => console.warn('Автовоспроизведение заблокировано:', e));
}

function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

function initAudio() {
  backgroundMusic.volume = 0.10;
  document.addEventListener('click', function enableAudio() {
    playBackgroundMusic();
    document.removeEventListener('click', enableAudio);
  }, { once: true });
}

// =====================================================
// 7. ОБРАБОТКА ВВОДА (КЛАВИАТУРА)
// =====================================================
document.addEventListener("keydown", function (e) {
  if (e.code === "KeyW" && snake.dy !== config.sizeCell) {
    snake.dy = -config.sizeCell;
    snake.dx = 0;
  } else if (e.code === "KeyA" && snake.dx !== config.sizeCell) {
    snake.dx = -config.sizeCell;
    snake.dy = 0;
  } else if (e.code === "KeyS" && snake.dy !== -config.sizeCell) {
    snake.dy = config.sizeCell;
    snake.dx = 0;
  } else if (e.code === "KeyD" && snake.dx !== -config.sizeCell) {
    snake.dx = config.sizeCell;
    snake.dy = 0;
  }
});

// =====================================================
// 8. ФУНКЦИЯ ДВИЖЕНИЯ ЗМЕИ (ОБНОВЛЕНИЕ)
// =====================================================
function updateSnake() {
  // Увеличиваем счётчик кадров
  stepCounter++;

  // Двигаем змею только если счётчик достиг лимита из config.maxStep
  if (stepCounter >= config.maxStep) {
    // Сброс счётчика для следующего цикла
    stepCounter = 0;

    // Логика движения (выполняется только раз в config.maxStep кадров)
    snake.x += snake.dx;
    snake.y += snake.dy;
    collisionBorder();

    // Добавляем новую голову
    snake.tails.unshift({ x: snake.x, y: snake.y });

    // Обрезаем хвост, если превышена длина
    if (snake.tails.length > snake.maxTails) {
      snake.tails.pop();
    }

    // Генерируем ягоды
    if (!colorBerry.active) randomPositionColorBerry();
    if (!purpleBerry.active) randomPositionPurpleBerry();

    // Проверяем столкновения
    snake.tails.forEach(function(el, index) {
      let scoredThisTurn = false;

      if (el.x === purpleBerry.x && el.y === purpleBerry.y && purpleBerry.active && !scoredThisTurn) {
        handlePurpleBerry();
        purpleBerry.active = false;
        scoredThisTurn = true;
      }

      if (el.x === colorBerry.x && el.y === colorBerry.y && colorBerry.active && !scoredThisTurn) {
        changeSnakeColor();
        colorBerry.active = false;
        scoredThisTurn = true;
      }

      if (el.x === berry.x && el.y === berry.y && !scoredThisTurn) {
        snake.maxTails++;
        incScore();
        randomPositionBerry();
      }

      // Столкновение с хвостом
      for (let i = index + 1; i < snake.tails.length; i++) {
        if (el.x === snake.tails[i].x && el.y === snake.tails[i].y) {
          refreshGame();
        }
      }
    });
  }
}

// =====================================================
// 9. ЗАПУСК ИГРЫ (ПОСЛЕ ЗАГРУЗКИ СТРАНИЦЫ)
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
  canvas = document.querySelector("#snake-canvas");
  context = canvas.getContext("2d");
  scoreBlock = document.querySelector(".game-score .score-count");

  if (!canvas || !context || !scoreBlock) {
    console.error("Ошибка: не найдены элементы игры в HTML.");
    return;
  }

  initAudio();
  refreshGame();
  requestAnimationFrame(gameLoop);
});