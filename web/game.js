const canvas = document.getElementById("bolt-catcher");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best-score");
const speedEl = document.getElementById("speed-mult");
const milestoneBanner = document.getElementById("milestone-banner");
const restartBtn = document.getElementById("restart-game");
const shareBtn = document.getElementById("share-game");

const width = canvas.width;
const height = canvas.height;
const player = { x: width / 2 - 40, y: height - 42, w: 80, h: 16, speed: 6 };
const keys = { left: false, right: false };
const milestoneColors = ["#50e3c2", "#4cc6ff", "#ff6ec7", "#ffd166", "#8cff80", "#c79cff"];

let items = [];
let score = 0;
let bestScore = 0;
let running = true;
let lastSpawn = 0;
let speedMultiplier = 1;
let flashTimer = 0;
let screenShake = 0;
let milestoneTimeout;

const setAccentColor = (color) => {
  document.documentElement.style.setProperty("--accent", color);
};

const triggerMilestone = (value) => {
  if (value === 0) {
    setAccentColor("#50e3c2");
    scoreEl.style.color = "#f6f7fb";
    milestoneBanner.textContent = "Добро пожаловать!";
    milestoneBanner.classList.remove("show");
    return;
  }
  const color =
    milestoneColors[
      ((value / 10 - 1) % milestoneColors.length + milestoneColors.length) % milestoneColors.length
    ];
  setAccentColor(color);
  scoreEl.style.color = color;
  milestoneBanner.textContent = `Серия ${value}!`;
  milestoneBanner.classList.add("show");
  if (milestoneTimeout) clearTimeout(milestoneTimeout);
  milestoneTimeout = setTimeout(() => milestoneBanner.classList.remove("show"), 2200);
};

const updateSpeedMultiplier = () => {
  speedMultiplier = 1 + Math.min(score, 80) * 0.035;
  speedEl.textContent = `x${speedMultiplier.toFixed(1)}`;
};

const spawnItem = () => {
  const isBomb = Math.random() < 0.35;
  const base = {
    x: Math.random() * (width - 24) + 12,
    y: -20,
    r: 12,
    speed: isBomb ? 3.6 : 2.4 + Math.random() * 1.6,
    type: isBomb ? "bomb" : "bolt",
  };
  if (isBomb) {
    base.angle = Math.random() * Math.PI * 2;
    base.spin = (Math.random() * 0.008 + 0.004) * (Math.random() < 0.5 ? -1 : 1);
    base.vx = (Math.random() - 0.5) * 1.2;
    base.directionChangeTimer = Math.random() * 800 + 400;
    base.lastDirectionChange = performance.now();
  } else {
    base.angle = Math.random() * Math.PI * 2;
    base.spin = (Math.random() * 0.004 + 0.002) * (Math.random() < 0.5 ? -1 : 1);
    base.bodyStretch = 1.6 + Math.random() * 0.6;
  }
  items.push(base);
};

const triggerExplosion = () => {
  flashTimer = 1;
  screenShake = 10;
  if (typeof window.vibrate === 'function') {
    window.vibrate([100, 50, 100]);
  }
};

const resetGame = () => {
  items = [];
  score = 0;
  running = true;
  lastSpawn = performance.now();
  player.x = width / 2 - player.w / 2;
  scoreEl.textContent = score;
  flashTimer = 0;
  screenShake = 0;
  triggerMilestone(0);
  updateSpeedMultiplier();
};

const catchItem = (item) => {
  if (item.type === "bomb") {
    running = false;
    triggerExplosion();
    const newBest = Math.max(bestScore, score);
    if (newBest > bestScore) {
      bestScore = newBest;
      if (typeof window.sendScoreToBot === 'function') {
        window.sendScoreToBot(bestScore);
      }
    }
    bestEl.textContent = bestScore;
  } else {
    score += 1;
    scoreEl.textContent = score;
    updateSpeedMultiplier();
    if (score % 10 === 0) {
      triggerMilestone(score);
    }
  }
};

const updateItems = (delta) => {
  const now = performance.now();
  items.forEach((item) => {
    item.y += item.speed * speedMultiplier * delta * 0.06;
    
    if (item.type === "bomb") {
      item.angle += item.spin * delta;
      
      if (item.vx !== undefined) {
        item.x += item.vx * speedMultiplier * delta * 0.06;
        item.x = Math.max(item.r, Math.min(width - item.r, item.x));
        
        if (now - item.lastDirectionChange > item.directionChangeTimer) {
          const changeChance = Math.random();
          if (changeChance < 0.35) {
            item.vx = (Math.random() - 0.5) * 2.4;
          } else if (changeChance < 0.7) {
            item.vx *= -1.3;
          } else {
            item.vx = (Math.random() - 0.5) * 1.8;
          }
          item.lastDirectionChange = now;
          item.directionChangeTimer = Math.random() * 600 + 300;
        }
      }
    } else if (item.type === "bolt") {
      item.angle += item.spin * delta;
    }
    
    const intersects =
      item.y + item.r > player.y &&
      item.y - item.r < player.y + player.h &&
      item.x + item.r > player.x &&
      item.x - item.r < player.x + player.w;
    if (intersects) {
      catchItem(item);
      item.y = height + 60;
    }
  });
  items = items.filter((item) => item.y < height + 40);
};

const drawGrid = () => {
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawRoundedRect = (x, y, width, height, radius) => {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
};

const drawBolt = (item) => {
  const head = item.r * 1.1;
  const bodyLen = head * (item.bodyStretch || 2);
  const bodyWidth = head * 0.55;

  ctx.save();
  ctx.translate(item.x, item.y + head * 1.8);
  ctx.scale(1, 0.35);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 0, head * 0.9, head * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.angle);

  const bodyGradient = ctx.createLinearGradient(-bodyWidth, 0, bodyWidth, 0);
  bodyGradient.addColorStop(0, "#2f2c1c");
  bodyGradient.addColorStop(0.3, "#c1a862");
  bodyGradient.addColorStop(0.5, "#fff3c2");
  bodyGradient.addColorStop(0.7, "#c1a862");
  bodyGradient.addColorStop(1, "#2f2c1c");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  drawRoundedRect(-bodyWidth, head * 0.25, bodyWidth * 2, bodyLen, bodyWidth * 0.35);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const y = head * 0.5 + i * (bodyLen / 4);
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.85, y);
    ctx.lineTo(bodyWidth * 0.85, y - 4);
    ctx.stroke();
  }

  const headGradient = ctx.createRadialGradient(0, 0, head * 0.2, 0, 0, head);
  headGradient.addColorStop(0, "#fffce1");
  headGradient.addColorStop(0.4, "#f5e381");
  headGradient.addColorStop(1, "#9c8349");
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    const radius = head * (0.95 + Math.sin(item.angle * 3 + i) * 0.03);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.92);
  }
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.stroke();

  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-bodyWidth * 0.8, head * 0.4);
  ctx.lineTo(-bodyWidth * 0.1, head * 0.4 - 6);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
};

const drawBomb = (item) => {
  const radius = item.r + 2;
  const flicker = (Math.sin(performance.now() / 90 + item.x * 0.15) + 1) / 2;
  const rotation = item.angle || 0;

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(rotation);

  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.3,
    -radius * 0.35,
    radius * 0.2,
    0,
    0,
    radius
  );
  bodyGradient.addColorStop(0, "#70747f");
  bodyGradient.addColorStop(0.55, "#3c3f47");
  bodyGradient.addColorStop(1, "#191b1f");

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.75, Math.PI * 0.2, Math.PI * 0.48);
  ctx.stroke();

  ctx.restore();

  const fuseStartY = item.y - radius + 1;
  const fuseEndY = fuseStartY - 10;
  ctx.strokeStyle = "#d8c7a5";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(item.x, fuseStartY);
  ctx.lineTo(item.x, fuseEndY);
  ctx.stroke();

  const sparkX = item.x;
  const sparkY = fuseEndY;
  const sparkPhase = performance.now() * 0.012 + item.x * 0.3;
  const sparkRadius = 3 + flicker * 2;
  const starPoints = 6;
  const jitter = () => (Math.random() - 0.5) * 0.8;
  const baseColor = [255, 190, 90];
  const sparkColor = `rgba(${baseColor[0]}, ${baseColor[1] + flicker * 40}, ${
    baseColor[2] + flicker * 30
  }, ${0.7 + flicker * 0.25})`;

  ctx.fillStyle = sparkColor;
  ctx.beginPath();
  for (let i = 0; i < starPoints * 2; i++) {
    const angle = (Math.PI / starPoints) * i + sparkPhase * 0.2;
    const radius = i % 2 === 0 ? sparkRadius : sparkRadius * 0.45;
    const x = sparkX + Math.cos(angle) * (radius + jitter());
    const y = sparkY + Math.sin(angle) * (radius + jitter());
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = sparkColor;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i + sparkPhase * 0.5 + jitter();
    const inner = sparkRadius * 0.6 + jitter();
    const outer = sparkRadius * (1.4 + 0.4 * Math.sin(sparkPhase + i)) + jitter();
    ctx.beginPath();
    ctx.moveTo(sparkX + Math.cos(angle) * inner, sparkY + Math.sin(angle) * inner);
    ctx.lineTo(sparkX + Math.cos(angle) * outer, sparkY + Math.sin(angle) * outer);
    ctx.stroke();
  }
};

const draw = () => {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake;
    const shakeY = (Math.random() - 0.5) * screenShake;
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.9;
  }
  drawGrid();

  ctx.fillStyle = "rgba(80,227,194,0.9)";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  items.forEach((item) => {
    if (item.type === "bomb") {
      drawBomb(item);
    } else {
      drawBolt(item);
    }
  });
  ctx.restore();

  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,80,80,${flashTimer})`;
    ctx.fillRect(0, 0, width, height);
    flashTimer *= 0.88;
  }

  if (!running) {
    ctx.fillStyle = "rgba(2, 3, 8, 0.75)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("GAME OVER", width / 2, height / 2 - 10);
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("нажми Рестарт", width / 2, height / 2 + 20);
  }
};

let lastTime = performance.now();
const loop = (time) => {
  const delta = time - lastTime;
  lastTime = time;

  if (running) {
    if (time - lastSpawn > Math.max(400, 900 - score * 6)) {
      spawnItem();
      lastSpawn = time;
    }
    if (keys.left) player.x = Math.max(0, player.x - player.speed);
    if (keys.right) player.x = Math.min(width - player.w, player.x + player.speed);
    updateItems(delta);
  }

  draw();
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  player.x = Math.min(Math.max(x - player.w / 2, 0), width - player.w);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = true;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = true;
  if (e.key === " " && !running) resetGame();
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keys.left = false;
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keys.right = false;
});

restartBtn.addEventListener("click", () => {
  bestScore = Math.max(bestScore, score);
  bestEl.textContent = bestScore;
  resetGame();
});

shareBtn.addEventListener("click", () => {
  if (typeof window.shareGame === 'function') {
    window.shareGame();
  }
});

triggerMilestone(0);
updateSpeedMultiplier();



