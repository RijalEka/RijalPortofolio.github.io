function initFlappy() {
  (function () {
    const Flappy = {};
    const canvas = document.getElementById("flappy-canvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const GRAVITY = 0.18,
      LIFT = -4.6;
    const PIPE_W = 70,
      GAP = 200;
    const SPEED = 1.6;
    let birdY,
      birdV,
      pipes,
      score,
      running = false,
      anim = null;
    function reset() {
      birdY = H / 2;
      birdV = 0;
      score = 0;
      pipes = [
        { x: W, gapY: 120 + Math.random() * (H - 240), scored: false },
        {
          x: W + 300,
          gapY: 120 + Math.random() * (H - 240),
          scored: false,
        },
        {
          x: W + 600,
          gapY: 120 + Math.random() * (H - 240),
          scored: false,
        },
      ];
      running = false;
      draw();
    }
    function drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#ADD8E6");
      gradient.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }
    function draw() {
      drawBackground();
      ctx.fillStyle = "#228b22";
      pipes.forEach((p) => {
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY - GAP / 2);
        ctx.fillRect(p.x, p.gapY + GAP / 2, PIPE_W, H - (p.gapY + GAP / 2));
      });
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.arc(96, birdY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.font = "18px Arial";
      ctx.fillText("Score: " + score, 12, 24);
    }
    function step() {
      birdV += GRAVITY;
      birdY += birdV;
      for (const p of pipes) {
        p.x -= SPEED;
        if (p.x + PIPE_W < 0) {
          p.x = Math.max(...pipes.map((pp) => pp.x)) + 300;
          p.gapY = 120 + Math.random() * (H - 240);
          p.scored = false;
        }
        if (!p.scored && p.x + PIPE_W < 96 - 12) {
          p.scored = true;
          score++;
        }
      }
      if (birdY > H - 12 || birdY < 12) {
        stop();
        alert("Game Over — Score: " + score);
        reset();
        return;
      }
      for (const p of pipes) {
        if (96 + 12 > p.x && 96 - 12 < p.x + PIPE_W) {
          if (birdY - 12 < p.gapY - GAP / 2 || birdY + 12 > p.gapY + GAP / 2) {
            stop();
            alert("Game Over — Score: " + score);
            reset();
            return;
          }
        }
      }
      draw();
      if (running) anim = requestAnimationFrame(step);
    }
    function start() {
      if (!running) {
        running = true;
        anim = requestAnimationFrame(step);
      }
    }
    function stop() {
      running = false;
      if (anim) cancelAnimationFrame(anim);
      anim = null;
    }
    function pause() {
      stop();
    }
    function flap() {
      if (running) birdV = LIFT;
    }
    canvas.addEventListener("click", () => {
      if (!running) {
        reset();
        start();
      }
      flap();
    });
    window.addEventListener("keydown", (e) => {
      const targetElement = e.target.tagName;
      if (targetElement === "INPUT" || targetElement === "TEXTAREA") return;
      if (document.getElementById("game-flappy").classList.contains("active")) {
        if (e.key === " ") {
          e.preventDefault();
          if (!running) {
            reset();
            start();
          }
          flap();
        }
      }
    });
    document.getElementById("flappy-start").addEventListener("click", () => {
      reset();
      start();
    });
    document.getElementById("flappy-pause").addEventListener("click", () => {
      if (running) stop();
      else start();
    });
    document.getElementById("flappy-reset").addEventListener("click", () => {
      reset();
    });
    Flappy.start = start;
    Flappy.pause = pause;
    Flappy.stop = stop;
    Flappy.reset = reset;
    window.Flappy = Flappy;
    reset();
  })();
}
