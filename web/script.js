const canvas = document.getElementById("orbital-bg");
const ctx = canvas.getContext("2d");
let particles = [];
let prefersDark = true;

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener("resize", resize);
resize();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.alpha = Math.random() * 0.6 + 0.2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(80, 227, 194, ${this.alpha})`;
    ctx.fill();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
    this.draw();
  }
}

const initParticles = () => {
  particles = Array.from({ length: 120 }, () => new Particle());
};

const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle) => particle.update());
  requestAnimationFrame(animate);
};

initParticles();
animate();

const body = document.body;
const toggle = document.getElementById("theme-toggle");

const switchTheme = () => {
  prefersDark = !prefersDark;
  body.dataset.theme = prefersDark ? "dark" : "light";
};

toggle.addEventListener("click", switchTheme);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".panel, .project-card").forEach((el) => observer.observe(el));

// Mini game: Bolt catcher
const gameCanvas = document.getElementById("bolt-catcher");
if (gameCanvas) {
  const gctx = gameCanvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best-score");
  const restartBtn = document.getElementById("restart-game");
  const width = gameCanvas.width;
  const height = gameCanvas.height;

  const player = {
    x: width / 2 - 40,
    y: height - 40,
    w: 80,
    h: 16,
    speed: 6,
  };

  let items = [];
  let lastSpawn = 0;
  let score = 0;
  let bestScore = 0;
  let running = true;
  let keys = { arrowleft: false, arrowright: false };

  const spawnItem = () => {
    const isBomb = Math.random() < 0.2;
    items.push({
      x: Math.random() * (width - 20) + 10,
      y: -20,
      r: 12,
      speed: isBomb ? 3.5 : 2.5 + Math.random() * 1.5,
      type: isBomb ? "bomb" : "bolt",
    });
  };

  const resetGame = () => {
    items = [];
    score = 0;
    running = true;
    player.x = width / 2 - player.w / 2;
    scoreEl.textContent = score;
  };

  const handleCatch = (item) => {
    if (item.type === "bomb") {
      bestScore = Math.max(bestScore, score);
      bestEl.textContent = bestScore;
      running = false;
      setTimeout(resetGame, 800);
    } else {
      score += 1;
      scoreEl.textContent = score;
    }
  };

  const updateItems = (delta) => {
    items.forEach((item) => {
      item.y += item.speed * delta * 0.06;
      // collision
      if (
        item.y + item.r > player.y &&
        item.y - item.r < player.y + player.h &&
        item.x + item.r > player.x &&
        item.x - item.r < player.x + player.w
      ) {
        handleCatch(item);
        item.y = height + 50; // remove later
      }
    });
    items = items.filter((item) => item.y < height + 30);
  };

  const drawGame = () => {
    gctx.clearRect(0, 0, width, height);
    // background grid
    gctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < width; x += 40) {
      gctx.fillRect(x, 0, 1, height);
    }
    for (let y = 0; y < height; y += 40) {
      gctx.fillRect(0, y, width, 1);
    }

    // player
    gctx.fillStyle = "rgba(80,227,194,0.9)";
    gctx.fillRect(player.x, player.y, player.w, player.h);

    // items
    items.forEach((item) => {
      if (item.type === "bomb") {
        gctx.fillStyle = "rgba(255,99,132,0.9)";
        gctx.beginPath();
        gctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        gctx.fill();
        gctx.fillRect(item.x - 2, item.y - item.r - 8, 4, 8);
      } else {
        gctx.fillStyle = "rgba(255,215,0,0.9)";
        gctx.beginPath();
        gctx.moveTo(item.x, item.y - item.r);
        for (let i = 1; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          gctx.lineTo(item.x + Math.cos(angle) * item.r, item.y + Math.sin(angle) * item.r);
        }
        gctx.closePath();
        gctx.fill();
      }
    });

    if (!running) {
      gctx.fillStyle = "rgba(5,6,10,0.65)";
      gctx.fillRect(0, 0, width, height);
      gctx.fillStyle = "#fff";
      gctx.font = "24px Space Grotesk";
      gctx.textAlign = "center";
      gctx.fillText("Бомба! Попробуй снова", width / 2, height / 2);
    }
  };

  let lastTime = performance.now();
  const loop = (time) => {
    const delta = time - lastTime;
    lastTime = time;

    if (running) {
      if (time - lastSpawn > 800) {
        spawnItem();
        lastSpawn = time;
      }
      if (keys.arrowleft) player.x = Math.max(0, player.x - player.speed);
      if (keys.arrowright) player.x = Math.min(width - player.w, player.x + player.speed);
      updateItems(delta);
    }

    drawGame();
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  gameCanvas.addEventListener("mousemove", (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    player.x = Math.min(Math.max(relativeX - player.w / 2, 0), width - player.w);
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keys.arrowleft = true;
    if (key === "arrowright" || key === "d") keys.arrowright = true;
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") keys.arrowleft = false;
    if (key === "arrowright" || key === "d") keys.arrowright = false;
  });

  restartBtn.addEventListener("click", () => {
    bestScore = Math.max(bestScore, score);
    bestEl.textContent = bestScore;
    resetGame();
  });
}

