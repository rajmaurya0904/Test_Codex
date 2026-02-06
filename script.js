const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

const tileCount = 20;
const tileSize = canvas.width / tileCount;
const baseSpeed = 140;

let snake;
let direction;
let nextDirection;
let food;
let score;
let gameOver;
let gameStarted;
let loopId;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  gameStarted = false;
  scoreEl.textContent = '0';
  statusEl.textContent = 'Press any arrow key or WASD to start.';

  placeFood();
  draw();

  clearTimeout(loopId);
}

function placeFood() {
  let valid = false;

  while (!valid) {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    valid = !snake.some((segment) => segment.x === food.x && segment.y === food.y);
  }
}

function startLoop() {
  if (gameOver) return;

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    gameOver = true;
    statusEl.textContent = `Game over! Final score: ${score}. Press Restart.`;
    draw();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = String(score);
    placeFood();
  } else {
    snake.pop();
  }

  draw();
  loopId = setTimeout(startLoop, Math.max(70, baseSpeed - score * 3));
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const p = i * tileSize;

    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(food.x * tileSize + 2, food.y * tileSize + 2, tileSize - 4, tileSize - 4);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#22c55e' : '#4ade80';
    ctx.fillRect(segment.x * tileSize + 2, segment.y * tileSize + 2, tileSize - 4, tileSize - 4);
  });
}

function updateDirection(key) {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const incoming = map[key];
  if (!incoming) return;

  const reversing = incoming.x + direction.x === 0 && incoming.y + direction.y === 0;
  if (reversing) return;

  nextDirection = incoming;

  if (!gameStarted && !gameOver) {
    gameStarted = true;
    statusEl.textContent = 'Game in progress...';
    startLoop();
  }
}

document.addEventListener('keydown', (event) => {
  updateDirection(event.key);
});

restartBtn.addEventListener('click', () => {
  resetGame();
});

resetGame();
