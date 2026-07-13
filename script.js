// ============================================================
// script.js — 通用函数层
// 只包含各页面共用的功能：星空、页面跳转、加载条、音乐、回忆碎片弹窗
// 咖啡馆场景逻辑已移至 core/managers/
// ============================================================

// 全局曲目列表（所有页面共享）
window._musicTracks = ["AKSO医院","Flux画廊","Instrumental","爱，触手可及","白桃汽水","伴星","潮汐","成瘾之痛","春风有信","春日","春天对花所做的事","春游","纯白色救赎","当海湮没于海","第一缕光","雕刻时光","冬日","篝火","光年外絮语","归乡","海的最深处","海灯祝福","海神祭典","海下的月光","画中梦(人鱼的歌声)","集市","霁雪和弦","家人","金沙之海","鲸歌载梦","鲸落城","咖啡时光","冷调交熔","黎明深雪","黎明未至","涟漪","恋与光年","零时午夜","落日","梦境","迷宫","迷途","觅旅","眸色深处","暮色下","你掌心的鱼","暖冬心愿","破影_恋与深空的变奏","奇遇","绮境幻想","晴空广场","燃情漫想","热力心跳","人间缱绻意","人鱼","日落银河","山花寻树","珊瑚石的共鸣","深海的祷歌","深空猎人","深空序曲","深夜偶遇","声浪复燃","盛夏与你与海风","时空引力","拾忆","双影交叠时","霜天雪霁","特别假期","特殊的向导","晚风与诗","万象遇你","危机暗涌","微醺之夜","无尽之夜","无人知晓时","午后","物归原主","昔愿遂心","暇日时光","夏日晴天","相遇","小步调欢喜","心动瞬间","心间雀跃","心灵实验","心祈深处","心晴邂逅","心弦轻跳","星辰指路","雪落之时","雪山的深处","焰色之礼","夜半三分","夜色","夜色晚钟","一幕一生","呓语","萦香入梦","永恒封尘","又见小猫","于深空见证的","欲揽旖旎色","愿景","月眠之夜","云门拥雪","云上轻俏","长恒极光","爪爪乐园","重要的事","祝导","遵命饲养官"];

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
      twinkle = 0.10 + 0.65 * twinkle;
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

// ====== 全局音乐系统 ======
var _musicCurrentTrack = '';

function _musicPickRandom() {
  // 页面专属曲单优先，没有则用全局曲库
  var pool = (window._pageTracks && window._pageTracks.length) ? window._pageTracks : (window._musicTracks || ['白桃汽水']);
  return pool[Math.floor(Math.random() * pool.length)];
}

function _musicPlayTrack(name) {
  var audio = document.getElementById('bgm');
  if (!audio) return;
  _musicCurrentTrack = name;
  audio.src = 'assets/music/' + name + '.mp3';
  audio.play().catch(function(){});
  _musicUpdateNowPlaying();
}

function _musicPlayNext() {
  _musicPlayTrack(_musicPickRandom());
}

function _musicUpdateNowPlaying() {
  var audio = document.getElementById('bgm');
  var btn   = document.getElementById('musicBtn');
  // 音浪条动画暂停/播放
  document.body.classList.toggle('music-paused', audio && audio.paused);
  if (btn && audio) {
    var label = btn.querySelector('.label');
    if (audio.paused) { btn.classList.add('off'); if (label) label.textContent = 'OFF'; }
    else { btn.classList.remove('off'); if (label) label.textContent = 'ON'; }
  }
  // 歌单打开的且 UIManager 存在，就重建——让竖条跟上
  try {
    var overlay = document.getElementById('playlistOverlay');
    if (overlay && overlay.classList.contains('open') && typeof UIManager !== 'undefined' && UIManager._rebuildPlaylist) {
      UIManager._rebuildPlaylist();
    }
  } catch (_) {}
}

function toggleMusic() {
  var audio = document.getElementById('bgm');
  var btn   = document.getElementById('musicBtn');
  if (!audio || !btn) return;

  if (audio.paused) {
    var name = _musicCurrentTrack || _musicPickRandom();
    _musicPlayTrack(name);
    btn.classList.remove('off');
    btn.querySelector('.label').textContent = 'ON';
    try { localStorage.setItem('bgm-on', 'on'); } catch(_) {}
  } else {
    audio.pause();
    btn.classList.add('off');
    btn.querySelector('.label').textContent = 'OFF';
    try { localStorage.setItem('bgm-on', 'off'); } catch(_) {}
    document.body.classList.add('music-paused');
  }
}

function _musicInit() {
  var audio = document.getElementById('bgm');
  if (!audio || audio.dataset._musicInited) return;
  audio.dataset._musicInited = '1';

  audio.addEventListener('ended', _musicPlayNext);

  // 从 src 提取曲名
  audio.addEventListener('loadedmetadata', function() {
    var m = (audio.src || '').match(/\/music\/(.+)\.mp3/);
    if (m) { _musicCurrentTrack = decodeURIComponent(m[1]); _musicUpdateNowPlaying(); }
  });

  // 读取上次状态
  var btn = document.getElementById('musicBtn');
  try {
    if (localStorage.getItem('bgm-on') === 'off') {
      if (btn) { btn.classList.add('off'); btn.querySelector('.label').textContent = 'OFF'; }
      return;
    }
  } catch(_) {}

  // 自动播放
  _musicPlayTrack(_musicPickRandom());
  if (btn) { btn.classList.remove('off'); if (btn.querySelector('.label')) btn.querySelector('.label').textContent = 'ON'; }
}

// 页面加载时自动初始化音乐
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _musicInit);
  } else {
    _musicInit();
  }
})();

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
