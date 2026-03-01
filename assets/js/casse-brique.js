(function () {
  var logo = document.querySelector('.contrib-icon');
  if (!logo) return;

  logo.style.cursor = 'pointer';
  logo.addEventListener('click', launchGame);

  function launchGame() {
    var overlay = document.createElement('div');
    overlay.id = 'casse-brique-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', padding: '16px', boxSizing: 'border-box'
    });

    var container = document.createElement('div');
    Object.assign(container.style, {
      position: 'relative', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: '640px', maxHeight: '80vh',
      width: '100%', aspectRatio: '4/3'
    });

    var canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00D7';
    closeBtn.setAttribute('aria-label', 'Fermer le jeu');
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '8px', right: '12px', background: 'none',
      border: 'none', fontSize: '28px', cursor: 'pointer', color: '#fff',
      lineHeight: '1', padding: '4px 8px', zIndex: '1'
    });

    container.appendChild(canvas);
    container.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function close() {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', onEsc);
      }
    });

    // --- Game ---
    var styles = getComputedStyle(document.documentElement);
    var colorBg = styles.getPropertyValue('--color-bg').trim() || '#f5f5f0';
    var colorCard = styles.getPropertyValue('--color-card').trim() || '#fff';
    var colorText = styles.getPropertyValue('--color-text').trim() || '#333';
    var colorPrimary = styles.getPropertyValue('--color-primary').trim() || '#3b7dd8';
    var fontFamily = styles.fontFamily || 'sans-serif';

    var COLS = 8;
    var ROWS = 7;
    var LIVES_TOTAL = 3;
    var BRICK_RADIUS = 4;
    var BRICK_GAP = 2;

    var BRICK_TYPES = [
      { grad: ['#e09f3e', '#e8b960'], points: 30 }, // orange
      { grad: ['#2a9d8f', '#3dbdad'], points: 20 }, // teal
      { grad: ['#3b7dd8', '#5a9be6'], points: 10 }  // blue
    ];

    var W, H, scale;
    var paddleW, paddleH, paddleX;
    var ballR, ballX, ballY, ballDX, ballDY, baseBallSpeed;
    var bricks, score, lives, state; // state: 'start' | 'play' | 'over' | 'win' | 'next'
    var bricksTotal, bricksDestroyed;
    var level;
    var ctx = canvas.getContext('2d');

    function resize() {
      var rect = container.getBoundingClientRect();
      scale = window.devicePixelRatio || 1;
      W = rect.width;
      H = rect.height;
      canvas.width = W * scale;
      canvas.height = H * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    // Simple seeded RNG for reproducible patterns per level
    function mulberry32(seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }

    function generateBricks(lvl) {
      var rng = mulberry32(lvl * 7 + 31);
      var brickW = (W - BRICK_GAP * (COLS + 1)) / COLS;
      var brickH = H * 0.035;
      var topOffset = H * 0.06;
      var rows = Math.min(ROWS, 4 + Math.floor(lvl / 2)); // more rows at higher levels
      var result = [];
      var total = 0;

      // Pick a pattern based on level
      var pattern = lvl % 6;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < COLS; c++) {
          var include = true;

          if (pattern === 0) {
            // Checkerboard
            include = (r + c) % 2 === 0;
          } else if (pattern === 1) {
            // Full grid (classic)
            include = true;
          } else if (pattern === 2) {
            // Diamond shape
            var cr = rows / 2 - 0.5;
            var cc = COLS / 2 - 0.5;
            include = Math.abs(r - cr) / rows + Math.abs(c - cc) / COLS < 0.55;
          } else if (pattern === 3) {
            // Random gaps (~25% holes, more at higher levels)
            include = rng() > 0.2 + Math.min(lvl * 0.02, 0.15);
          } else if (pattern === 4) {
            // Stripes with gaps
            include = c % 3 !== Math.floor(rng() * 3);
          } else {
            // Inverted triangle
            var half = Math.floor((rows - r) * COLS / (2 * rows));
            include = c >= half && c < COLS - half;
          }

          if (!include) continue;

          // Color assignment: mix based on row position + random variation
          var colorIdx;
          var rowRatio = r / Math.max(rows - 1, 1);
          var nudge = rng() * 0.3 - 0.15;
          var val = rowRatio + nudge;
          if (val < 0.35) colorIdx = 0; // orange (top)
          else if (val < 0.7) colorIdx = 1; // teal (middle)
          else colorIdx = 2; // blue (bottom)

          result.push({
            x: BRICK_GAP + c * (brickW + BRICK_GAP),
            y: topOffset + r * (brickH + BRICK_GAP),
            w: brickW,
            h: brickH,
            colorIdx: colorIdx,
            alive: true
          });
          total++;
        }
      }

      return { bricks: result, total: total };
    }

    function initGame() {
      resize();
      level = 1;
      score = 0;
      lives = LIVES_TOTAL;
      initLevel();
      state = 'start';
    }

    function initLevel() {
      resize();
      paddleW = Math.max(W * (0.16 - level * 0.008), W * 0.08); // paddle shrinks
      paddleH = 12;
      paddleX = (W - paddleW) / 2;
      ballR = 6;
      baseBallSpeed = H * (0.005 + level * 0.0008); // faster each level
      resetBall();
      bricksDestroyed = 0;
      var gen = generateBricks(level);
      bricks = gen.bricks;
      bricksTotal = gen.total;
    }

    function resetBall() {
      ballX = W / 2;
      ballY = H * 0.7;
      var angle = -Math.PI / 4 + Math.random() * (Math.PI / 2) - Math.PI / 4;
      var speed = baseBallSpeed || H * 0.006;
      ballDX = speed * Math.sin(angle);
      ballDY = -speed * Math.cos(angle);
    }

    // Input
    function getX(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return clientX - rect.left;
    }

    canvas.addEventListener('mousemove', function (e) {
      if (state === 'play') {
        paddleX = Math.max(0, Math.min(W - paddleW, getX(e) - paddleW / 2));
      }
    });
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      if (state === 'play') {
        paddleX = Math.max(0, Math.min(W - paddleW, getX(e) - paddleW / 2));
      }
    }, { passive: false });

    function handleAction() {
      if (state === 'start') { state = 'play'; }
      else if (state === 'next') { level++; initLevel(); state = 'play'; }
      else if (state === 'over') { initGame(); state = 'play'; }
    }

    canvas.addEventListener('click', handleAction);
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      handleAction();
    }, { passive: false });

    // Draw helpers
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    function drawBrick(b) {
      var bt = BRICK_TYPES[b.colorIdx];
      var g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
      g.addColorStop(0, bt.grad[0]);
      g.addColorStop(1, bt.grad[1]);
      ctx.fillStyle = g;
      roundRect(b.x, b.y, b.w, b.h, BRICK_RADIUS);
      ctx.fill();
    }

    function drawPaddle() {
      ctx.fillStyle = colorPrimary;
      roundRect(paddleX, H - 50, paddleW, paddleH, 6);
      ctx.fill();
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      ctx.fillStyle = colorText;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    function drawHUD() {
      // Background bar for readability
      ctx.fillStyle = colorBg;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(0, H - 32, W, 32);
      ctx.globalAlpha = 1;

      ctx.fillStyle = colorText;
      ctx.font = 'bold 14px ' + fontFamily;
      ctx.textAlign = 'left';
      ctx.fillText('Score: ' + score, 16, H - 12);
      ctx.textAlign = 'center';
      ctx.fillText('Niveau ' + level, W / 2, H - 12);
      // Lives as small brick icons — inset to avoid border-radius clipping
      for (var i = 0; i < lives; i++) {
        ctx.fillStyle = '#e09f3e';
        roundRect(W - 28 - i * 22, H - 22, 18, 10, 2);
        ctx.fill();
      }
    }

    function drawScreen(title, subtitle) {
      ctx.fillStyle = colorBg;
      ctx.fillRect(0, 0, W, H);

      // Draw faded bricks as decoration
      for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].alive) {
          ctx.globalAlpha = 0.15;
          drawBrick(bricks[i]);
          ctx.globalAlpha = 1;
        }
      }

      // Text backdrop for readability
      var boxW = Math.min(W * 0.7, 320);
      var boxH = 90;
      ctx.fillStyle = colorCard;
      ctx.globalAlpha = 0.85;
      roundRect((W - boxW) / 2, H / 2 - 50, boxW, boxH, 12);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = colorText;
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px ' + fontFamily;
      ctx.fillText(title, W / 2, H / 2 - 14);
      ctx.font = '14px ' + fontFamily;
      ctx.fillText(subtitle, W / 2, H / 2 + 16);
    }

    function update() {
      if (state !== 'play') return;

      ballX += ballDX;
      ballY += ballDY;

      // Wall collisions
      if (ballX - ballR <= 0 || ballX + ballR >= W) ballDX = -ballDX;
      if (ballY - ballR <= 0) ballDY = -ballDY;

      // Paddle collision
      if (
        ballDY > 0 &&
        ballY + ballR >= H - 50 &&
        ballY + ballR <= H - 50 + paddleH + 4 &&
        ballX >= paddleX &&
        ballX <= paddleX + paddleW
      ) {
        ballDY = -Math.abs(ballDY);
        // Angle based on where ball hits paddle
        var hit = (ballX - paddleX) / paddleW - 0.5; // -0.5 to 0.5
        ballDX = hit * baseBallSpeed * 2;
      }

      // Bottom - lose life
      if (ballY - ballR > H) {
        lives--;
        if (lives <= 0) {
          state = 'over';
        } else {
          resetBall();
        }
        return;
      }

      // Brick collisions
      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.alive) continue;
        if (
          ballX + ballR > b.x &&
          ballX - ballR < b.x + b.w &&
          ballY + ballR > b.y &&
          ballY - ballR < b.y + b.h
        ) {
          b.alive = false;
          bricksDestroyed++;
          score += BRICK_TYPES[b.colorIdx].points;
          ballDY = -ballDY;

          // Speed up slightly
          var speedMult = 1 + bricksDestroyed * 0.005;
          var currentSpeed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
          var targetSpeed = baseBallSpeed * speedMult;
          if (currentSpeed > 0) {
            ballDX = (ballDX / currentSpeed) * targetSpeed;
            ballDY = (ballDY / currentSpeed) * targetSpeed;
          }

          if (bricksDestroyed >= bricksTotal) {
            state = 'next';
          }
          break;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      if (state === 'start') {
        drawScreen('Casse-Brique', 'Cliquez pour jouer');
        return;
      }
      if (state === 'over') {
        drawScreen('Game Over', 'Score: ' + score + ' \u2014 Cliquez pour rejouer');
        return;
      }
      if (state === 'next') {
        drawScreen('Niveau ' + level + ' termin\u00e9 !', 'Score: ' + score + ' \u2014 Cliquez pour continuer');
        return;
      }

      // Background
      ctx.fillStyle = colorBg;
      ctx.fillRect(0, 0, W, H);

      // Bricks
      for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].alive) drawBrick(bricks[i]);
      }

      drawPaddle();
      drawBall();
      drawHUD();
    }

    var running = true;
    var origClose = close;
    close = function () {
      running = false;
      origClose();
    };

    function loop() {
      if (!running) return;
      update();
      draw();
      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', function () {
      if (running) resize();
    });

    initGame();
    loop();
  }
})();
