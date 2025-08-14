function initTetris() {
  (function () {
    const Tetris = {};
    const COLS = 12,
      ROWS = 24,
      BLOCK = 24;
    const canvas = document.getElementById("tetris-game");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("tetris-overlay");
    const scoreEl = document.getElementById("tetris-score");
    const linesEl = document.getElementById("tetris-lines");
    const levelEl = document.getElementById("tetris-level");
    const holdCanvas = document.getElementById("tetris-hold");
    const holdCtx = holdCanvas.getContext("2d");
    const nextCanvas = document.getElementById("tetris-next");
    const nextCtx = nextCanvas.getContext("2d");
    canvas.width = COLS * BLOCK;
    canvas.height = ROWS * BLOCK;
    const COLORS = [
      null,
      "#e74c3c",
      "#3498db",
      "#2ecc71",
      "#f1c40f",
      "#9b59b6",
      "#34495e",
      "#1abc9c",
    ];
    const SHAPES = [
      null,
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0],
      ],
      [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ],
      [
        [4, 4],
        [4, 4],
      ],
      [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0],
      ],
      [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0],
      ],
      [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ],
    ];
    let board,
      current,
      nextPiece,
      score = 0,
      lines = 0,
      level = 1,
      dropInterval = 1000,
      dropCounter = 0,
      lastTime = 0,
      running = false,
      gameOver = false,
      raf = null;
    let holdPiece = null;
    let holdAllowed = true;
    function createEmptyBoard() {
      return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    function randomPiece() {
      const idx = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
      const shape = SHAPES[idx].map((r) => r.slice());
      const x = Math.floor((COLS - shape[0].length) / 2);
      return { shape, x, y: -getTopOffset(shape), id: idx };
    }
    function getTopOffset(shape) {
      for (let r = 0; r < shape.length; r++)
        if (shape[r].some((v) => v !== 0)) return r;
      return 0;
    }
    function collide(piece, board, ox = 0, oy = 0) {
      for (let y = 0; y < piece.shape.length; y++)
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const bx = piece.x + x + ox,
              by = piece.y + y + oy;
            if (bx < 0 || bx >= COLS || by >= ROWS) return true;
            if (by >= 0 && board[by][bx] !== 0) return true;
          }
        }
      return false;
    }
    function merge(piece) {
      for (let y = 0; y < piece.shape.length; y++)
        for (let x = 0; x < piece.shape[y].length; x++) {
          const v = piece.shape[y][x];
          if (v !== 0) {
            const by = piece.y + y;
            const bx = piece.x + x;
            if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) board[by][bx] = v;
          }
        }
    }
    function clearLines() {
      let cleared = 0;
      for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every((c) => c !== 0)) {
          board.splice(y, 1);
          board.unshift(Array(COLS).fill(0));
          cleared++;
          y++;
        }
      }
      if (cleared > 0) {
        const scores = [0, 40, 100, 300, 1200];
        score += (scores[cleared] || cleared * 100) * level;
        lines += cleared;
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel !== level) {
          level = newLevel;
          dropInterval = Math.max(100, 1000 - (level - 1) * 75);
        }
        updateInfo();
      }
    }
    function rotateMatrix(mat) {
      const N = mat.length;
      const out = Array.from({ length: N }, () => Array(N).fill(0));
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) out[x][N - 1 - y] = mat[y][x];
      return out;
    }
    function tryRotate(piece) {
      const original = piece.shape;
      const rotated = rotateMatrix(original);
      const tempPiece = { ...piece, shape: rotated };
      const kicks = [0, 1, -1, 2, -2];
      for (const k of kicks) {
        if (!collide(tempPiece, board, k, 0)) {
          piece.shape = rotated;
          piece.x += k;
          return true;
        }
      }
      return false;
    }
    function hardDrop() {
      while (!collide(current, board, 0, 1)) {
        current.y += 1;
        score += 2;
      }
      lockPiece();
    }
    function lockPiece() {
      merge(current);
      clearLines();
      current = nextPiece;
      current.y = -getTopOffset(current.shape);
      nextPiece = randomPiece();
      holdAllowed = true;
      if (collide(current, board)) {
        gameOver = true;
        running = false;
        showGameOver();
      }
      drawHoldAndNext();
    }
    function showGameOver() {
      overlay.style.display = "flex";
      overlay.innerHTML =
        '<div style="font-size:20px;font-weight:700">GAME OVER</div><div style="margin-top:10px">Skor akhir: ' +
        score +
        '</div><button id="tetris-restart" class="btn" style="margin-top:12px;">Mulai Ulang</button>';
      document
        .getElementById("tetris-restart")
        .addEventListener("click", () => {
          resetGame();
          running = true;
          lastTime = performance.now();
          raf = requestAnimationFrame(update);
          overlay.style.display = "none";
        });
    }
    function resetGame() {
      board = createEmptyBoard();
      score = 0;
      lines = 0;
      level = 1;
      dropInterval = 1000;
      current = randomPiece();
      nextPiece = randomPiece();
      holdPiece = null;
      holdAllowed = true;
      gameOver = false;
      running = false;
      updateInfo();
      overlay.style.display = "none";
      draw();
      drawHoldAndNext();
    }
    function updateInfo() {
      scoreEl.innerText = score;
      linesEl.innerText = lines;
      levelEl.innerText = level;
    }
    function drawBlock(x, y, color, ctxLocal = ctx) {
      ctxLocal.fillStyle = color;
      ctxLocal.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
      ctxLocal.strokeStyle = "rgba(0,0,0,0.35)";
      ctxLocal.strokeRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
    }
    function drawBoard() {
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
          const v = board[y][x];
          if (v !== 0) drawBlock(x, y, COLORS[v]);
          else {
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
          }
        }
    }
    function drawPieceOnCtx(
      piece,
      context = ctx,
      xOffset = 0,
      yOffset = 0,
      cellSize = BLOCK
    ) {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          const v = piece.shape[y][x];
          if (v !== 0) {
            const bx = piece.x + x + xOffset;
            const by = piece.y + y + yOffset;
            if (by >= 0) {
              context.fillStyle = COLORS[v];
              context.fillRect(
                bx * cellSize + 1,
                by * cellSize + 1,
                cellSize - 2,
                cellSize - 2
              );
            }
          }
        }
      }
    }
    function draw() {
      drawBoard();
      if (current) {
        const ghost = {
          ...current,
          shape: current.shape.map((r) => r.slice()),
        };
        while (!collide(ghost, board, 0, 1)) {
          ghost.y += 1;
        }
        for (let y = 0; y < ghost.shape.length; y++)
          for (let x = 0; x < ghost.shape[y].length; x++) {
            const v = ghost.shape[y][x];
            if (v !== 0) {
              const gx = ghost.x + x,
                gy = ghost.y + y;
              if (gy >= 0 && gy < ROWS) {
                ctx.fillStyle = "rgba(255,255,255,0.05)";
                ctx.fillRect(
                  gx * BLOCK + 1,
                  gy * BLOCK + 1,
                  BLOCK - 2,
                  BLOCK - 2
                );
              }
            }
          }
        drawPieceOnCtx(current);
      }
    }
    function drawHoldAndNext() {
      holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
      if (holdPiece) {
        const shape = SHAPES[holdPiece.id];
        const boxSize = holdCanvas.width / 4;
        const xOffset = (holdCanvas.width - shape[0].length * boxSize) / 2;
        const yOffset = (holdCanvas.height - shape.length * boxSize) / 2;
        const dummyPiece = { shape: shape, x: 0, y: 0 };
        drawPieceOnCtx(
          dummyPiece,
          holdCtx,
          xOffset / boxSize,
          yOffset / boxSize,
          boxSize
        );
      }
      nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      if (nextPiece) {
        const shape = SHAPES[nextPiece.id];
        const boxSize = nextCanvas.width / 4;
        const xOffset = (nextCanvas.width - shape[0].length * boxSize) / 2;
        const yOffset = (nextCanvas.height - shape.length * boxSize) / 2;
        const dummyPiece = { shape: shape, x: 0, y: 0 };
        drawPieceOnCtx(
          dummyPiece,
          nextCtx,
          xOffset / boxSize,
          yOffset / boxSize,
          boxSize
        );
      }
    }
    function update(time = 0) {
      if (!running) {
        lastTime = time;
        return;
      }
      const delta = time - lastTime;
      lastTime = time;
      dropCounter += delta;
      if (dropCounter > dropInterval) {
        dropCounter = 0;
        if (!collide(current, board, 0, 1)) current.y += 1;
        else lockPiece();
        updateInfo();
      }
      draw();
      if (!gameOver) raf = requestAnimationFrame(update);
    }
    window.addEventListener("keydown", (e) => {
      if (!document.getElementById("game-tetris").classList.contains("active"))
        return;
      if (gameOver || !running) return;
      const targetElement = e.target.tagName;
      if (targetElement === "INPUT" || targetElement === "TEXTAREA") return;
      e.preventDefault();
      switch (e.key) {
        case "ArrowLeft":
          current.x -= 1;
          if (collide(current, board)) current.x += 1;
          draw();
          break;
        case "ArrowRight":
          current.x += 1;
          if (collide(current, board)) current.x -= 1;
          draw();
          break;
        case "ArrowDown":
          if (!collide(current, board, 0, 1)) {
            current.y += 1;
            score += 1;
            updateInfo();
          }
          draw();
          break;
        case "ArrowUp":
          tryRotate(current);
          draw();
          break;
        case " ":
          hardDrop();
          updateInfo();
          draw();
          break;
        case "c":
        case "C":
          if (holdAllowed) {
            let tempPiece = { id: current.id };
            if (holdPiece) {
              const heldId = holdPiece.id;
              holdPiece = tempPiece;
              current = {
                shape: SHAPES[heldId].map((r) => r.slice()),
                x: Math.floor((COLS - SHAPES[heldId][0].length) / 2),
                y: -getTopOffset(SHAPES[heldId]),
                id: heldId,
              };
            } else {
              holdPiece = tempPiece;
              current = nextPiece;
              current.y = -getTopOffset(current.shape);
              nextPiece = randomPiece();
            }
            holdAllowed = false;
            drawHoldAndNext();
            draw();
            break;
          }
      }
    });
    document.getElementById("tetris-start").addEventListener("click", () => {
      if (gameOver) resetGame();
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(update);
    });
    document.getElementById("tetris-pause").addEventListener("click", () => {
      running = !running;
      if (running) {
        lastTime = performance.now();
        raf = requestAnimationFrame(update);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
    Tetris.pause = function () {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };
    Tetris.reset = resetGame;
    window.Tetris = Tetris;
    resetGame();
  })();
}
