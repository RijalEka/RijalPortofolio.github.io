document.addEventListener("DOMContentLoaded", function () {
  const Snake = {};
  const width = 15;
  const height = 15;
  const gridEl = document.getElementById("snake-grid");
  const scoreEl = document.getElementById("snake-score");
  const startBtn = document.getElementById("snake-start");
  const pauseBtn = document.getElementById("snake-pause");
  const overlay = document.getElementById("gameOverOverlay");
  const overlayRestartBtn = document.getElementById("overlayRestartBtn");

  // Pemeriksaan elemen untuk memastikan semua ada
  if (
    !gridEl ||
    !scoreEl ||
    !startBtn ||
    !pauseBtn ||
    !overlay ||
    !overlayRestartBtn
  ) {
    console.error(
      "Satu atau lebih elemen HTML untuk game Snake tidak ditemukan."
    );
    return; // Hentikan skrip jika ada elemen yang hilang
  }

  // Buat papan permainan (tiles)
  gridEl.innerHTML = "";
  for (let i = 0; i < width * height; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    gridEl.appendChild(tile);
  }
  const tiles = Array.from(document.querySelectorAll("#snake-grid .tile"));

  // Variabel state game
  let snakePositions = [];
  let applePosition = 0;
  let inputs = [];
  let gameStarted = false;
  let isPaused = false;
  let score = 0;
  let stepInterval = 200;
  let gameLoopId;

  function drawGame() {
    tiles.forEach((tile) => tile.classList.remove("snake", "head", "apple"));
    snakePositions.forEach((pos, index) => {
      if (tiles[pos]) {
        tiles[pos].classList.add("snake");
        if (index === snakePositions.length - 1) {
          tiles[pos].classList.add("head");
        }
      }
    });
    if (tiles[applePosition]) {
      tiles[applePosition].classList.add("apple");
    }
  }

  function placeApple() {
    let pos;
    do {
      pos = Math.floor(Math.random() * width * height);
    } while (snakePositions.includes(pos));
    applePosition = pos;
  }

  function headDirection() {
    if (snakePositions.length < 2) return "right";
    const head = snakePositions[snakePositions.length - 1];
    const neck = snakePositions[snakePositions.length - 2];
    if (head - 1 === neck) return "right";
    if (head + 1 === neck) return "left";
    if (head - width === neck) return "down";
    if (head + width === neck) return "up";
    return "right";
  }

  function getNextPosition() {
    const head = snakePositions[snakePositions.length - 1];
    const dir = inputs.shift() || headDirection();
    let next;

    switch (dir) {
      case "right":
        next = head + 1;
        // Perbaikan bug: Dulu snake bisa tembus tembok kanan
        if (head % width === width - 1) throw new Error("Hit wall");
        break;
      case "left":
        next = head - 1;
        if (head % width === 0) throw new Error("Hit wall");
        break;
      case "down":
        next = head + width;
        if (next >= width * height) throw new Error("Hit wall");
        break;
      case "up":
        next = head - width;
        if (next < 0) throw new Error("Hit wall");
        break;
      default:
        throw new Error("Invalid direction");
    }
    // Perbaikan bug: Ular bisa menabrak dirinya sendiri
    if (snakePositions.includes(next)) {
      throw new Error("Hit self");
    }
    return next;
  }

  function step() {
    if (!gameStarted || isPaused) return;
    try {
      const newHead = getNextPosition();
      snakePositions.push(newHead);
      if (newHead === applePosition) {
        score++;
        scoreEl.textContent = score;
        placeApple();
      } else {
        snakePositions.shift();
      }
      drawGame();
    } catch (error) {
      endGame();
    }
  }

  function startGame() {
    resetGame(); // Selalu reset sebelum memulai game baru
    gameStarted = true;
    isPaused = false;
    overlay.style.display = "none";
    pauseBtn.innerText = "Pause";
    gameLoopId = setInterval(step, stepInterval);
  }

  function togglePause() {
    if (!gameStarted) return;
    isPaused = !isPaused;
    if (isPaused) {
      clearInterval(gameLoopId);
      pauseBtn.innerText = "Lanjutkan";
    } else {
      gameLoopId = setInterval(step, stepInterval);
      pauseBtn.innerText = "Pause";
    }
  }

  function endGame() {
    gameStarted = false;
    clearInterval(gameLoopId);
    overlay.style.display = "flex";
  }

  function resetGame() {
    clearInterval(gameLoopId);
    snakePositions = [108, 109, 110, 111]; // Posisi awal yang lebih aman di tengah
    inputs = [];
    score = 0;
    scoreEl.textContent = score;
    placeApple();
    drawGame(); // Gambar kondisi awal
    overlay.style.display = "none";
    gameStarted = false;
    isPaused = false;
  }

  window.addEventListener("keydown", (ev) => {
    if (!document.getElementById("game-snake").classList.contains("active"))
      return;
    const targetElement = ev.target.tagName;
    if (targetElement === "INPUT" || targetElement === "TEXTAREA") return;

    if (!gameStarted && (ev.key === " " || ev.key.startsWith("Arrow"))) {
      ev.preventDefault();
      startGame();
      return;
    }

    if (overlay.style.display === "flex" && ev.key === " ") {
      ev.preventDefault();
      startGame();
      return;
    }

    if (!gameStarted || isPaused) return;

    const dirMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const newDirection = dirMap[ev.key];
    if (newDirection) {
      ev.preventDefault();
      const lastInput =
        inputs.length > 0 ? inputs[inputs.length - 1] : headDirection();
      if (newDirection === "up" && lastInput !== "down") inputs.push("up");
      else if (newDirection === "down" && lastInput !== "up")
        inputs.push("down");
      else if (newDirection === "left" && lastInput !== "right")
        inputs.push("left");
      else if (newDirection === "right" && lastInput !== "left")
        inputs.push("right");
    }
  });

  startBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", togglePause);
  overlayRestartBtn.addEventListener("click", startGame);

  Snake.pause = () => {
    isPaused = true;
    clearInterval(gameLoopId);
  };
  window.Snake = Snake;

  // Inisialisasi tampilan game saat halaman dimuat
  resetGame();
});
