// ============================================================
// script.js — 通用函数层
// 只包含各页面共用的功能：星空、页面跳转、加载条、音乐、回忆碎片弹窗
// 咖啡馆场景逻辑已移至 core/managers/
// ============================================================

// ---------- 星空背景 ----------
function initStarfield() {
  const canvas = document.getElementById('stars');
  if (!canvas) return;

  if (!document.querySelector('.cosmic-bg')) {
    const bg = document.createElement('div');
    bg.className = 'cosmic-bg';
    canvas.parentNode.insertBefore(bg, canvas);
  }

  const ctx = canvas.getContext('2d');
  let stars = [], meteors = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor(canvas.width * canvas.height / 3500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.3,
        speed: Math.random() * 0.04 + 0.008,
        phase: Math.random() * Math.PI * 2,
        bright: Math.random() > 0.9,
        sparkle: Math.random() > 0.85,
        nextSparkle: Math.random() * 300
      });
    }
  }

  function spawnMeteor() {
    const scale = 0.6 + Math.random() * 1.4;
    meteors.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4 - 50,
      len: (60 + Math.random() * 140) * scale,
      speed: (7 + Math.random() * 6) * scale,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      width: 0.8 + Math.random() * 1.6,
      life: 1,
      decay: 0.015 + Math.random() * 0.015
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.phase += s.speed;
      let twinkle = Math.pow(Math.abs(Math.sin(s.phase)), 2);
      twinkle = 0.15 + 0.85 * twinkle;
      if (s.sparkle) {
        s.nextSparkle--;
        if (s.nextSparkle <= 0) { s.flashLife = 1; s.nextSparkle = 200 + Math.random() * 500; }
        if (s.flashLife > 0)    { twinkle = Math.min(1, twinkle + s.flashLife); s.flashLife -= 0.05; }
      }
      ctx.globalAlpha = s.bright ? twinkle : twinkle * 0.6;
      ctx.fillStyle   = s.bright ? '#eaf2ff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.sparkle && s.flashLife > 0.4) {
        ctx.globalAlpha  = (s.flashLife - 0.4) * 0.9;
        ctx.strokeStyle  = '#ffffff';
        ctx.lineWidth    = 0.6;
        const len        = s.r * 6 * s.flashLife;
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    meteors.forEach(m => {
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.life -= m.decay;
      const grad = ctx.createLinearGradient(
        m.x, m.y,
        m.x - Math.cos(m.angle) * m.len,
        m.y - Math.sin(m.angle) * m.len
      );
      grad.addColorStop(0, `rgba(255,255,255,${m.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth   = m.width;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - Math.cos(m.angle) * m.len, m.y - Math.sin(m.angle) * m.len);
      ctx.stroke();
    });
    meteors = meteors.filter(m => m.life > 0);
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

  setInterval(() => { if (Math.random() > 0.5) spawnMeteor(); }, 1800);

  // 暴露给外部（Enter 过渡用）
  window.spawnMeteorBurst = function() {
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      setTimeout(spawnMeteor, i * (80 + Math.random() * 150));
    }
  };

  function scheduleShower() {
    const delay = 8000 + Math.random() * 12000;
    setTimeout(() => {
      const count = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) setTimeout(spawnMeteor, i * (150 + Math.random() * 300));
      scheduleShower();
    }, delay);
  }
  scheduleShower();
}

// ---------- 页面跳转（带淡出） ----------
function goTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 350);
}

// ---------- memory 页 BACK 记忆 ----------
var cafeBackUrl = 'cafe.html?char=lishen';
(function() {
  var char = document.body.getAttribute('data-character');
  if (!char) return;

  var cafeChar = '';
  try {
    var ref = document.referrer;
    if (ref) {
      var m = ref.match(/[?&]char=([^&]*)/);
      if (m) cafeChar = decodeURIComponent(m[1]);
    }
  } catch (_) {}

  if (!cafeChar) {
    try { cafeChar = localStorage.getItem('cafe-last-char') || ''; } catch (_) {}
  }
  if (!cafeChar) cafeChar = char;
  if (!cafeChar) cafeChar = 'lishen';
  try { localStorage.setItem('cafe-last-char', cafeChar); } catch (_) {}

  cafeBackUrl = 'cafe.html?char=' + encodeURIComponent(cafeChar);
})();

// ---------- 入口页 Enter 过渡动画 ----------
function enterTransition() {
  const btn = document.querySelector('.enter-btn');
  if (!btn || btn._transitioning) return;
  btn._transitioning = true;

  // 第一步：按下放大（弹簧感）
  btn.classList.add('press');

  // 第二步：300ms 后去掉放大，停顿 150ms 给"松手"感
  setTimeout(() => {
    btn.classList.remove('press');

    setTimeout(() => {
      // 文字缓慢淡出
      ['.main-title', '.title-divider', '.sub'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('exit-fade');
      });

      // 按钮缓慢缩小消失
      btn.classList.add('exit-shrink');

      // 星空放大变暗
      const bg = document.querySelector('.cosmic-bg');
      if (bg) bg.classList.add('zoom');

      // 触发流星群
      if (typeof spawnMeteorBurst === 'function') spawnMeteorBurst();

      // 1.4s 后跳转（等变暗走完）
      setTimeout(() => {
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = 'loading.html'; }, 400);
      }, 1400);

    }, 150);
  }, 300);
}

// ---------- 3D 翻转卡片 ----------
const FLIP_IMAGES = [
  'assets/loading_pic/鱼.png',
  'assets/loading_pic/黎.png'
];

function initFlipCard() {
  const front = document.getElementById('flipFront');
  const back  = document.getElementById('flipBack');
  const card  = document.getElementById('flipCard');
  if (!front || !back || !card) return;

  const firstIndex = Math.floor(Math.random() * FLIP_IMAGES.length);
  front.style.backgroundImage = `url('${FLIP_IMAGES[firstIndex]}')`;
  back.style.backgroundImage  = `url('${FLIP_IMAGES[1 - firstIndex]}')`;

  setTimeout(() => card.classList.add('flipping'), 1000);
}

// ---------- 加载条动画 ----------
function initLoadingBar() {
  const fill = document.getElementById('loadingFill');
  const dot  = document.getElementById('loadingDot');
  if (!fill) return;

  const duration = 2000;
  const start    = performance.now();
  const barWidth = fill.parentElement ? fill.parentElement.offsetWidth : 260;

  function step(now) {
    const progress = Math.min(100, ((now - start) / duration) * 100);
    fill.style.width = progress + '%';
    if (dot) dot.style.left = (progress / 100) * barWidth + 'px';
    if (progress < 100) {
      requestAnimationFrame(step);
    } else {
      setTimeout(() => goTo('select.html'), 300);
    }
  }
  requestAnimationFrame(step);
}

// ---------- 背景音乐 ----------
function initMusic() {
  const audio = document.getElementById('bgm');
  const btn   = document.getElementById('musicBtn');
  if (!audio || !btn) return;

  if (localStorage.getItem('bgm-on') === 'off') {
    btn.classList.add('off');
    btn.querySelector('.label').textContent = 'OFF';
  } else {
    audio.play().catch(() => {});
  }
}

function toggleMusic() {
  const audio = document.getElementById('bgm');
  const btn   = document.getElementById('musicBtn');
  if (!audio || !btn) return;

  if (audio.paused) {
    audio.play();
    btn.classList.remove('off');
    btn.querySelector('.label').textContent = 'ON';
    localStorage.setItem('bgm-on', 'on');
  } else {
    audio.pause();
    btn.classList.add('off');
    btn.querySelector('.label').textContent = 'OFF';
    localStorage.setItem('bgm-on', 'off');
  }
}

// ---------- 全屏 ----------
function enterFullscreen() {
  const doc = document;
  const el  = document.documentElement;

  // 已在全屏中 → 退出
  if (doc.fullscreenElement || doc.webkitFullscreenElement) {
    if (doc.exitFullscreen) { doc.exitFullscreen().catch(function(){}); }
    else if (doc.webkitExitFullscreen) { doc.webkitExitFullscreen(); }
    return;
  }

  // 进入全屏
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(function(){});
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}

// 显示全屏按钮的函数
function showFullscreenBtn() {
  var btn = document.getElementById('fullscreenBtn');
  if (btn) btn.style.display = 'inline-flex';
}
// 记忆页：加一段初始化逻辑——如果是手机端，显示全屏按钮
(function() {
  var char = document.body.getAttribute('data-character');
  if (!char) return; // 不是 memory 页不处理
  if (/Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 768) {
    showFullscreenBtn();
  }
})();

// ---------- 回忆碎片弹窗 ----------
function openFragment(el) {
  const overlay = document.getElementById('fragOverlay');
  if (!overlay) return;
  overlay.querySelector('.modal-title').textContent = el.dataset.title || '';
  overlay.querySelector('.modal-text').textContent  = el.dataset.text  || '';
  overlay.classList.add('show');
}

function closeFragment() {
  const overlay = document.getElementById('fragOverlay');
  if (overlay) overlay.classList.remove('show');
}

// ---------- 启动（通用页面） ----------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stars')) initStarfield();
  initMusic();
  initFlipCard();
  initLoadingBar();
  // cafe.html 由 core/managers/ 自行初始化，不在这里处理
});
