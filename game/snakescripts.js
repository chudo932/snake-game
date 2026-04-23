// =====================================================
// 1. ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ
// =====================================================

let scoreBlock;
let score = 0;

const config = {
  step: 0,
  maxStep: 10,
  sizeCell: 16,
  sizeBerry: 16 / 4
};

const snake = {
  x: 160,
  y: 160,
  dx: config.sizeCell,
  dy: 0,
  tails: [],
  maxTails: 3
};

let berry = { x: 0, y: 0 };
let colorBerry = { x: 0, y: 0, active: false };
let purpleBerry = { x: 0, y: 0, active: false };

let canvas = document.querySelector("#game-canvas");
let context = canvas.getContext("2d");
scoreBlock = document.querySelector(".game-score .score-count")

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
  // Генерируем фиолетовую ягоду с вероятностью 10 % каждый ход
  if (!purpleBerry.active) {
    randomPositionPurpleBerry();
  }

  snake.tails.forEach(function(el, index) {
    let scoredThisTurn = false;

    // Столкновение с фиолетовой ягодой
    if (el.x === purpleBerry.x && el.y === purpleBerry.y && purpleBerry.active && !scoredThisTurn) {
      handlePurpleBerry();
      purpleBerry.active = false;
      scoredThisTurn = true;
    }

    // Столкновение с цветной ягодой — теперь обновляем рекорд
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

    // Столкновение с обычной ягодой (только если ещё не засчитано очко)
    if (el.x === berry.x && el.y === berry.y && !scoredThisTurn) {
      snake.maxTails++;
      incScore();
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
  drawPurpleBerry();
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
  snake.headColor = undefined;
  snake.bodyColor = undefined;

  randomPositionBerry();
  colorBerry.active = false;
  purpleBerry.active = false;
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
  colorBerry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
  colorBerry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;

  for (let tail of snake.tails) {
    if (colorBerry.x === tail.x && colorBerry.y === tail.y) {
      randomPositionColorBerry();
      return;
    }
  }
}

function randomPositionPurpleBerry() {
  // Вероятность появления фиолетовой ягоды — 5 %
  if (Math.random() > 0.05) {
    purpleBerry.active = false;
    return;
  }

  purpleBerry.active = true;
  purpleBerry.x = getRandomInt(0, canvas.width / config.sizeCell) * config.sizeCell;
  purpleBerry.y = getRandomInt(0, canvas.height / config.sizeCell) * config.sizeCell;

  // Проверяем, чтобы ягода не появилась на змее или других ягодах
  for (let tail of snake.tails) {
    if (purpleBerry.x === tail.x && purpleBerry.y === tail.y) {
      randomPositionPurpleBerry();
      return;
    }
  }
  // Проверка на совпадение с обычной ягодой
  if (purpleBerry.x === berry.x && purpleBerry.y === berry.y) {
    randomPositionPurpleBerry();
    return;
  }
  // Проверка на совпадение с цветной ягодой
  if (purpleBerry.x === colorBerry.x && purpleBerry.y === colorBerry.y) {
    randomPositionPurpleBerry();
    return;
  }
}

function handlePurpleBerry() {
  // Отнимаем от 5 до 10 сегментов
  const reduction = getRandomInt(3, 9);
  const newLength = Math.max(snake.maxTails - reduction, 2); // Минимум 3 сегмента

  snake.maxTails = newLength;

  // Обрезаем хвост, если нужно
  while (snake.tails.length > snake.maxTails) {
    snake.tails.pop();
  }

  // Увеличиваем скорость в 2 раза на 3 секунды
  const originalSpeed = config.maxStep;
  config.maxStep = Math.floor(config.maxStep / 1.5);

  // Возвращаем скорость через 3 секунды
  setTimeout(() => {
    config.maxStep = originalSpeed;
  }, 1000);

  // Обновляем счёт (фиолетовая ягода отнимает 3 очка)
  score = Math.max(score - 3, 0);
  saveHighScore(score);
  drawScore();
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

  // +2 очка за цветную ягоду
  score += 2;
  // Автоматически проверяем и обновляем рекорд при сборе цветной ягоды
  saveHighScore(score);
  drawScore();
}

function incScore() {
  score++;
  // Также проверяем и обновляем рекорд при сборе обычной ягоды
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

// Инициализация отображения счёта
drawScore();
// Первоначальное размещение ягод
randomPositionBerry();
// Запуск игрового цикла
requestAnimationFrame(gameLoop);