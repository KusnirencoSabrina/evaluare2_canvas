const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('size');
const newGameBtn = document.getElementById('newGame');
const message = document.getElementById('message');

let gridSize = 4;
let tileSize = canvas.width / gridSize;
let tiles = [];
let emptyIndex = null;

function init() {
  gridSize = parseInt(sizeSelect.value);
  tileSize = canvas.width / gridSize;

  tiles = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    tiles.push(i);
  }
  tiles[tiles.length-1] = -1; // ultimul = gol
  shuffle(tiles);
  emptyIndex = tiles.indexOf(-1);

  message.classList.remove('show');
  draw();
}

function shuffle(array) {
  do {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  } while (!isSolvable(array));
}

function isSolvable(tiles) {
  let inversions = 0;
  const n = gridSize;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === -1) continue;
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[j] === -1) continue;
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  if (n % 2 === 1) return true; // odd grid, always solvable
  const blankRow = Math.floor(tiles.indexOf(-1) / n);
  const blankRowFromBottom = n - 1 - blankRow;
  return (inversions + blankRowFromBottom) % 2 === 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === -1) continue;

    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    const x = col * tileSize;
    const y = row * tileSize;

    // Desenează pătratul
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, tileSize, tileSize);

    // Desenează numărul
    ctx.fillStyle = 'white';
    ctx.font = `${tileSize / 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tiles[i].toString(), x + tileSize / 2, y + tileSize / 2);
  }
}

function getClickedIndex(x, y) {
  const col = Math.floor(x / tileSize);
  const row = Math.floor(y / tileSize);
  return row * gridSize + col;
}

function canMove(idx) {
  const row = Math.floor(idx / gridSize);
  const col = idx % gridSize;
  const eRow = Math.floor(emptyIndex / gridSize);
  const eCol = emptyIndex % gridSize;

  return (Math.abs(row - eRow) + Math.abs(col - eCol) === 1);
}

function moveTile(idx) {
  if (!canMove(idx)) return;

  // swap logic
  [tiles[idx], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[idx]];
  emptyIndex = idx;

  draw();
  checkWin();
}

function checkWin() {
  let won = true;
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i) {
      won = false;
      break;
    }
  }
  if (won) {
    message.classList.add('show');
    // mic delay apoi confetti
    setTimeout(() => {
      confetti();
    }, 800);
  }
}

// Confetti simplă pe canvas
function confetti() {
  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - 100,
      vx: Math.random() * 10 - 5,
      vy: Math.random() * 8 + 4,
      color: `hsl(${Math.random()*360}, 80%, 60%)`,
      size: Math.random() * 8 + 4
    });
  }

  let start = performance.now();
  function animateConfetti(t) {
    const dt = t - start;
    if (dt > 3000) return;

    ctx.save();
    ctx.globalAlpha = 1 - dt/3000;
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.restore();

    requestAnimationFrame(animateConfetti);
  }
  requestAnimationFrame(animateConfetti);
}

// Evenimente
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const idx = getClickedIndex(x, y);
  if (idx !== emptyIndex) {
    moveTile(idx);
  }
});

newGameBtn.addEventListener('click', init);

sizeSelect.addEventListener('change', init);

// Start
init();