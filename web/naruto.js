const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");
const overlay = document.getElementById("overlay");

const width = canvas.width;
const height = canvas.height;

const narutoSprite = new Image();
narutoSprite.src = "assets/naruto-pixel.png";
let spriteReady = false;
narutoSprite.onload = () => {
  spriteReady = true;
};

const shurikenSprite = new Image();
shurikenSprite.src = "assets/shuriken-pixel.png";
let shurikenReady = false;
shurikenSprite.onload = () => {
  shurikenReady = true;
};

const SPRITE = {
  width: 64,
  height: 64,
  scale: 2,
};

const player = {
  x: width / 2,
  y: height - 140,
  speed: 3.6,
  r: 18,
  trail: [],
  afterImages: [],
  vx: 0,
  vy: 0,
  stepTime: 0,
  facing: 1,
  dashGlow: 0,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};
let shurikens = [];
let running = true;
let startTime = performance.now();
let bestTime = 0;
let lastSpawn = 0;
let spawnInterval = 1100;
let lastFrame = performance.now();
let elapsedTime = 0;
const FIRE_DURATION = 1800;
let fireTimeout = null;

const formatTime = (value) => `${value.toFixed(2)} с`;

const updateTimerText = (value) => {
  timerEl.textContent = formatTime(value);
};

const updateBestText = () => {
  bestEl.textContent = formatTime(bestTime);
};

const resetGame = () => {
  shurikens = [];
  running = true;
  spawnInterval = 1100;
  startTime = performance.now();
  elapsedTime = 0;
  overlay.classList.add("hidden");
  player.x = width / 2;
  player.y = height - 60;
  player.trail = [];
  clearFireEffect();
  updateTimerText(0);
  updateBestText();
};

const getDifficultyFactor = () => {
  if (elapsedTime <= 10) return 1;
  const extra = Math.min(1.2, (elapsedTime - 10) * 0.08);
  return 1 + extra;
};

const spawnShuriken = () => {
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  switch (edge) {
    case 0:
      x = Math.random() * width;
      y = -20;
      break;
    case 1:
      x = width + 20;
      y = Math.random() * height;
      break;
    case 2:
      x = Math.random() * width;
      y = height + 20;
      break;
    default:
      x = -20;
      y = Math.random() * height;
  }
  const angle = Math.atan2(player.y - y, player.x - x);
  const difficulty = getDifficultyFactor();
  const speed = (1.5 + Math.random() * 1.1) * difficulty;
  shurikens.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 18,
    spin: (Math.random() * 0.1 + 0.04) * (Math.random() < 0.5 ? -1 : 1),
    rotation: Math.random() * Math.PI * 2,
    trail: [],
  });
};

const updatePlayer = (deltaMs) => {
  const delta = deltaMs / 1000;
  let dx = 0;
  let dy = 0;
  if (keys.ArrowUp || keys.w) dy -= 1;
  if (keys.ArrowDown || keys.s) dy += 1;
  if (keys.ArrowLeft || keys.a) dx -= 1;
  if (keys.ArrowRight || keys.d) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    player.vx = dx * player.speed;
    player.vy = dy * player.speed;
    player.facing = Math.abs(dx) > 0.1 ? Math.sign(dx) : player.facing;
    player.dashGlow = Math.min(1, player.dashGlow + 0.05);
  } else {
    player.vx *= 0.7;
    player.vy *= 0.7;
    player.dashGlow *= 0.9;
  }
  player.x += player.vx;
  player.y += player.vy;
  clampPlayerWithinArena();
  player.stepTime += deltaMs;

  if (Math.hypot(player.vx, player.vy) > 0.8) {
    player.afterImages.push({
      x: player.x,
      y: player.y,
      alpha: 0.5,
      facing: player.facing,
      offset: (player.stepTime % 400) / 400,
    });
  }

  player.afterImages = player.afterImages.filter((img) => {
    img.alpha *= 0.86;
    return img.alpha > 0.05;
  });

  player.trail.push({ x: player.x, y: player.y, alpha: 1 });
  if (player.trail.length > 18) player.trail.shift();
  player.trail.forEach((p) => (p.alpha *= 0.94));
};

const updateShurikens = () => {
  shurikens.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    s.rotation += s.spin;

    s.trail.push({ x: s.x, y: s.y, alpha: 0.6 });
    if (s.trail.length > 10) s.trail.shift();

    if (collidesWithPlayer(s)) {
      running = false;
      overlay.classList.remove("hidden");
      const survived = (performance.now() - startTime) / 1000;
      if (survived > bestTime) {
        bestTime = survived;
        updateBestText();
        triggerFireEffect();
      }
    }
  });
  shurikens = shurikens.filter((s) => s.x > -40 && s.x < width + 40 && s.y > -40 && s.y < height + 40);
};

const drawArena = () => {
  ctx.clearRect(0, 0, width, height);

  const gridSize = 40;
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  player.trail.forEach((p, i) => {
    ctx.fillStyle = `rgba(255,167,96,${p.alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, player.r * (i / player.trail.length), 0, Math.PI * 2);
    ctx.fill();
  });

  drawAfterImages();
  drawPlayer();

  shurikens.forEach(drawShuriken);
};

const updateTimer = () => {
  if (!running) return;
  elapsedTime = (performance.now() - startTime) / 1000;
  updateTimerText(elapsedTime);
  const difficulty = getDifficultyFactor();
  const base = Math.max(600, 1100 - elapsedTime * 25);
  spawnInterval = Math.max(260, base / difficulty);
};

const drawShuriken = (s) => {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  s.trail.forEach((t, idx) => {
    const alpha = t.alpha * ((idx + 1) / s.trail.length);
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  });

  ctx.translate(s.x, s.y);
  ctx.rotate(s.rotation);
  const size = s.size * 2.2;
  if (shurikenReady) {
    ctx.drawImage(shurikenSprite, -size / 2, -size / 2, size, size);
  } else {
    ctx.fillStyle = "#050505";
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size * 0.6, Math.sin(angle) * size * 0.6);
      ctx.lineTo(Math.cos(angle + Math.PI / 6) * (size * 0.25), Math.sin(angle + Math.PI / 6) * (size * 0.25));
      ctx.closePath();
    }
    ctx.fill();
  }
  ctx.restore();
};

const drawAfterImages = () => {
  if (!spriteReady) return;
  const { drawWidth, drawHeight } = getSpriteMetrics();
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  player.afterImages.forEach((img) => {
    ctx.save();
    ctx.globalAlpha = img.alpha * 0.5;
    ctx.translate(img.x, img.y - drawHeight * 0.85);
    ctx.scale(img.facing, 1);
    ctx.drawImage(narutoSprite, -drawWidth / 2, 0, drawWidth, drawHeight);
    ctx.restore();
  });
  ctx.restore();
  ctx.globalAlpha = 1;
};

const clampPlayerWithinArena = () => {
  const { drawWidth, drawHeight } = getSpriteMetrics();
  const halfW = drawWidth * 0.35;
  const minX = halfW + 20;
  const maxX = width - halfW - 20;
  const minY = drawHeight * 0.75;
  const maxY = height - 30;
  player.x = Math.min(Math.max(player.x, minX), maxX);
  player.y = Math.min(Math.max(player.y, minY), maxY);
};

const getSpriteMetrics = () => ({
  drawWidth: SPRITE.width * SPRITE.scale,
  drawHeight: SPRITE.height * SPRITE.scale,
});

const collidesWithPlayer = (shuriken) => {
  const { drawWidth, drawHeight } = getSpriteMetrics();
  const hitCenterX = player.x;
  const hitCenterY = player.y - drawHeight * 0.45;
  const halfW = drawWidth * 0.28;
  const halfH = drawHeight * 0.35;
  const dx = Math.abs(shuriken.x - hitCenterX);
  const dy = Math.abs(shuriken.y - hitCenterY);
  const normX = dx / (halfW + shuriken.size * 0.5);
  const normY = dy / (halfH + shuriken.size * 0.5);
  return normX * normX + normY * normY < 1;
};
const drawPlayer = () => {
  const { drawWidth, drawHeight } = getSpriteMetrics();
  const bob = Math.sin(player.stepTime * 0.015) * (Math.hypot(player.vx, player.vy) > 0.5 ? 6 : 2);
  const lean = (player.vx / player.speed) * 0.12;
  if (spriteReady) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(player.x, player.y - drawHeight * 0.85 + bob);
    ctx.rotate(lean);
    ctx.scale(player.facing, 1);
    ctx.shadowColor = `rgba(255,153,51,${player.dashGlow * 0.4})`;
    ctx.shadowBlur = 25 * player.dashGlow;
    ctx.drawImage(narutoSprite, -drawWidth / 2, 0, drawWidth, drawHeight);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else {
    ctx.fillStyle = "#ffbf69";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fef5e7";
    ctx.stroke();
  }
};

const loop = (time) => {
  const delta = time - lastFrame;
  lastFrame = time;
  if (running) {
    updatePlayer(delta);
    updateShurikens();
    if (time - lastSpawn > spawnInterval) {
      spawnShuriken();
      lastSpawn = time;
    }
    updateTimer();
  }

  drawArena();
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);

window.addEventListener("keydown", (e) => {
  const lower = e.key.toLowerCase();
  if (keys.hasOwnProperty(lower)) keys[lower] = true;
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
  if (e.key === " " && !running) resetGame();
});

window.addEventListener("keyup", (e) => {
  const lower = e.key.toLowerCase();
  if (keys.hasOwnProperty(lower)) keys[lower] = false;
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

restartBtn.addEventListener("click", resetGame);

resetGame();

function triggerFireEffect() {
  clearTimeout(fireTimeout);
  [timerEl, bestEl].forEach((el) => el.classList.add("fire"));
  fireTimeout = setTimeout(clearFireEffect, FIRE_DURATION);
}

function clearFireEffect() {
  if (fireTimeout) {
    clearTimeout(fireTimeout);
    fireTimeout = null;
  }
  [timerEl, bestEl].forEach((el) => el.classList.remove("fire"));
}

