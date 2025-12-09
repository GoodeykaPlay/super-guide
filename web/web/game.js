// Проверяем, что DOM загружен
const canvas = document.getElementById("bolt-catcher");
if (!canvas) {
  console.error("Canvas not found!");
}
const ctx = canvas ? canvas.getContext("2d") : null;
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best-score");
const speedEl = document.getElementById("speed-mult");
const milestoneBanner = document.getElementById("milestone-banner");
const restartBtn = document.getElementById("restart-game");
const shareBtn = document.getElementById("share-game");

if (!canvas || !ctx) {
  console.error("Canvas or context not available!");
}

// Игровые состояния и ввод
let player = null;
const keys = { left: false, right: false };
let touchX = null; // Позиция касания для мобильных
let isTouching = false; // Флаг активного касания

// Инициализация игрока
function initPlayer() {
  if (!player) {
    player = { x: width / 2 - 40, y: height - 42, w: 80, h: 16, speed: 6 };
  } else {
    player.x = width / 2 - 40;
    player.y = height - 42;
  }
}

// Адаптивный размер canvas для мобильных
const BASE_WIDTH = 640;
const BASE_HEIGHT = 360;
let width = BASE_WIDTH;
let height = BASE_HEIGHT;
let scale = 1;

// Кэш сетки для оптимизации
let gridCache = null;
let gridCacheWidth = 0;
let gridCacheHeight = 0;

const resizeCanvas = () => {
  if (!canvas || !ctx) return;
  const container = canvas.parentElement;
  if (!container) return;
  // Компактный режим для Telegram
  const isTelegram = window.Telegram && window.Telegram.WebApp;
  const padding = isTelegram ? 16 : 24;
  const containerWidth = container.clientWidth - padding;
  const maxHeight = isTelegram ? window.innerHeight * 0.6 : Math.min(window.innerHeight * 0.5, 400);
  const containerHeight = maxHeight;
  
  // Сохраняем соотношение сторон 16:9
  const aspectRatio = BASE_WIDTH / BASE_HEIGHT;
  let displayWidth = containerWidth;
  let displayHeight = displayWidth / aspectRatio;
  
  // Если высота слишком большая, ограничиваем по высоте
  if (displayHeight > containerHeight) {
    displayHeight = containerHeight;
    displayWidth = displayHeight * aspectRatio;
  }
  
  // Устанавливаем CSS размер (отображаемый размер)
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';
  
  // Внутренние размеры canvas остаются фиксированными для правильной отрисовки
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;
  
  // Вычисляем масштаб для преобразования координат
  scale = displayWidth / BASE_WIDTH;
  width = BASE_WIDTH;
  height = BASE_HEIGHT;
  
  // Обновляем позицию игрока при изменении размера
  if (player) {
    player.x = Math.min(player.x, width - player.w);
  }
  // Пересоздаём кэш сетки при изменении размера
  gridCache = null;
  gridCacheWidth = 0;
  gridCacheHeight = 0;
};

// Инициализация после загрузки DOM
const init = () => {
  if (!canvas || !ctx) {
    console.error("Canvas not ready, retrying...");
    setTimeout(init, 100);
    return;
  }
  
  resizeCanvas();
  initPlayer();
  
  // Инициализация игры
  resetGame();
  gameInitialized = true;
  
  // Запуск игрового цикла
  requestAnimationFrame(loop);
};

// Ждём загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM уже загружен
  init();
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (player) {
    player.x = Math.min(player.x, width - player.w);
  }
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    resizeCanvas();
    if (player) {
      player.x = Math.min(player.x, width - player.w);
    }
  }, 100);
});

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
  if (player) {
    player.x = width / 2 - player.w / 2;
    player.y = height - 42;
  }
  if (scoreEl) scoreEl.textContent = score;
  flashTimer = 0;
  screenShake = 0;
  triggerMilestone(0);
  updateSpeedMultiplier();
  // Сразу спавним первый предмет
  spawnItem();
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
  if (!ctx) return;
  // Пересоздаём кэш если размеры изменились
  if (!gridCache || gridCacheWidth !== width || gridCacheHeight !== height) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.strokeStyle = "rgba(255,255,255,0.05)";
    tempCtx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      tempCtx.beginPath();
      tempCtx.moveTo(x, 0);
      tempCtx.lineTo(x, height);
      tempCtx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      tempCtx.beginPath();
      tempCtx.moveTo(0, y);
      tempCtx.lineTo(width, y);
      tempCtx.stroke();
    }
    gridCache = tempCanvas;
    gridCacheWidth = width;
    gridCacheHeight = height;
  }
  // Рисуем кэшированную сетку
  if (gridCache) {
    ctx.drawImage(gridCache, 0, 0);
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
  if (!ctx) return;
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
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake;
    const shakeY = (Math.random() - 0.5) * screenShake;
    ctx.translate(shakeX, shakeY);
    screenShake *= 0.9;
  }
  drawGrid();

  // Рисуем игрока
  if (player) {
    ctx.fillStyle = "rgba(80,227,194,0.9)";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  // Рисуем предметы
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
let frameSkip = 0;
let gameInitialized = false;

const loop = (time) => {
  if (!ctx || !canvas || !gameInitialized) {
    requestAnimationFrame(loop);
    return;
  }
  
  const delta = time - lastTime;
  lastTime = time;
  
  // Оптимизация: пропускаем кадры на медленных устройствах
  frameSkip++;
  if (delta > 50 && frameSkip % 2 === 0) {
    requestAnimationFrame(loop);
    return;
  }
  
  // Ограничение delta для стабильности
  const cappedDelta = Math.min(delta, 50);

  if (running) {
    if (time - lastSpawn > Math.max(400, 900 - score * 6)) {
      spawnItem();
      lastSpawn = time;
    }
    // Управление клавиатурой (только если не касаемся экрана)
    if (!isTouching && player) {
      if (keys.left) player.x = Math.max(0, player.x - player.speed);
      if (keys.right) player.x = Math.min(width - player.w, player.x + player.speed);
    }
    // При касании позиция обновляется напрямую в обработчиках событий
    updateItems(cappedDelta);
  }

  draw();
  requestAnimationFrame(loop);
};

// Функция для обновления позиции игрока по координатам
const updatePlayerPosition = (clientX) => {
  if (!player) return;
  const rect = canvas.getBoundingClientRect();
  // Преобразуем координаты экрана в координаты canvas
  const canvasX = (clientX - rect.left) / scale;
  // Центрируем игрока на позиции касания
  const targetX = canvasX - player.w / 2;
  // Ограничиваем границами игрового поля (полное перемещение по всему полю)
  player.x = Math.max(0, Math.min(targetX, width - player.w));
};

// Управление мышью (для десктопа)
canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  updatePlayerPosition(e.clientX);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseUp);
});

const handleMouseMove = (e) => {
  e.preventDefault();
  updatePlayerPosition(e.clientX);
};

const handleMouseUp = (e) => {
  e.preventDefault();
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
  canvas.removeEventListener("mouseleave", handleMouseUp);
};

// Сенсорное управление (для мобильных) - улучшенная версия
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isTouching = true;
  const touch = e.touches[0];
  updatePlayerPosition(touch.clientX);
  touchX = touch.clientX;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    // Мгновенное обновление позиции для плавного движения
    updatePlayerPosition(touch.clientX);
    touchX = touch.clientX;
  }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isTouching = false;
  touchX = null;
}, { passive: false });

canvas.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isTouching = false;
  touchX = null;
}, { passive: false });

// Предотвращение скролла и масштабирования при касании canvas
document.addEventListener("touchmove", (e) => {
  if (e.target === canvas || canvas.contains(e.target)) {
    e.preventDefault();
  }
}, { passive: false });

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

// Инициализация игры будет вызвана в функции init()



