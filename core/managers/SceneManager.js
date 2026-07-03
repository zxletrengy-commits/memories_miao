/**
 * SceneManager.js
 * 职责：管理场景背景、时间/天气切换、环境特效（浮尘、光晕、雨）
 * 不知道任何角色细节。
 */

const SceneManager = {
  _bgImageCache: {},

  // ---------- 初始化 ----------
  init() {
    const tod = this._getTimeOfDay();
    World.setCurrentTime(tod);

    this._applyBackground(tod);
    this._generateDustParticles();
    this._generateSunGlow();
    this._updateTimeDisplay();

    // 每30分钟刷新一次时段
    setInterval(() => {
      const newTod = this._getTimeOfDay();
      if (newTod !== World.currentTime) {
        World.setCurrentTime(newTod);
        this._applyBackground(newTod);
      }
    }, 1800000);

    // 窗口 resize 时重新适配背景
    window.addEventListener('resize', () => {
      this._applyBackground(World.currentTime);
    });
  },

  // ---------- 时段判断 ----------
  _getTimeOfDay() {
    const h = new Date().getHours();
    if (h >= 6 && h < 16) return 'day';
    if (h >= 16 && h < 19) return 'dusk';
    return 'night';
  },

  // ---------- 背景切换 ----------
  _applyBackground(tod) {
    const bgLayer = document.getElementById('bgImageLayer');
    const bgVideo = document.getElementById('bgVideoLayer');
    const rain    = document.getElementById('rainOverlay');
    const sunGlow = document.getElementById('sunGlow');

    if (!bgLayer || !bgVideo) return;

    if (tod === 'day') {
      bgLayer.style.display = 'none';
      bgVideo.style.display = 'block';
      if (bgVideo.paused) bgVideo.play().catch(() => {});
      if (rain)    rain.style.display    = 'none';
      if (sunGlow) sunGlow.style.display = 'block';
    } else {
      bgLayer.style.display = 'block';
      bgVideo.style.display = 'none';
      if (!bgVideo.paused) bgVideo.pause();

      const bgMap = {
        dusk:  'assets/cafe_alot/background/lobby_dusk.png',
        night: 'assets/cafe_alot/background/lobby_night.png'
      };
      const bgColors = {
        dusk:  '#c4a88a',
        night: '#1a1824'
      };

      const src = bgMap[tod];
      bgLayer.style.backgroundImage   = `url('${src}')`;
      bgLayer.style.backgroundColor   = bgColors[tod];
      bgLayer.style.backgroundPosition = 'center';

      this._fitBgImage(bgLayer, src);

      if (rain)    rain.style.display    = 'block';
      if (sunGlow) sunGlow.style.display = 'none';
    }
  },

  // ---------- 背景图适配 ----------
  _fitBgImage(bgLayer, src) {
    const applyFit = (imgW, imgH) => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const isMobile = screenW < 600;
      if (isMobile) {
        const imgRatio    = imgW / imgH;
        const screenRatio = screenW / screenH;
        bgLayer.style.backgroundSize = imgRatio > screenRatio ? 'auto 100%' : '100% auto';
      } else {
        bgLayer.style.backgroundSize = 'contain';
      }
    };

    if (this._bgImageCache[src]) {
      const c = this._bgImageCache[src];
      applyFit(c.w, c.h);
    } else {
      const img   = new Image();
      img.onload  = () => {
        this._bgImageCache[src] = { w: img.width, h: img.height };
        applyFit(img.width, img.height);
      };
      img.src = src;
    }
  },

  // ---------- 时间显示 ----------
  _updateTimeDisplay() {
    const timeEl = document.getElementById('cafeTime');
    if (!timeEl) return;
    const now = new Date();
    const h   = now.getHours().toString().padStart(2, '0');
    const m   = now.getMinutes().toString().padStart(2, '0');
    timeEl.textContent = `${h}:${m}`;
  },

  // ---------- 浮尘粒子 ----------
  _generateDustParticles() {
    const container = document.getElementById('dustParticles');
    if (!container) return;
    container.innerHTML = '';

    const count = 20 + Math.floor(Math.random() * 15);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className     = 'dust-particle';
      dot.style.left    = Math.random() * 100 + '%';
      dot.style.top     = Math.random() * 100 + '%';

      const size = 2 + Math.random() * 3;
      dot.style.width  = size + 'px';
      dot.style.height = size + 'px';

      const dur   = 20 + Math.random() * 30;
      const delay = Math.random() * 40;
      dot.style.animationDuration = dur + 's';
      dot.style.animationDelay   = delay + 's';
      dot.style.setProperty('--drift-x', (20 + Math.random() * 60) + 'px');

      container.appendChild(dot);
    }
  },

  // ---------- 太阳光晕 ----------
  _generateSunGlow() {
    const container = document.getElementById('sunGlow');
    if (!container) return;
    container.innerHTML = '';

    const warmColors = [
      'radial-gradient(circle, rgba(255,230,180,0.6), rgba(255,210,150,0.2))',
      'radial-gradient(circle, rgba(255,245,220,0.5), rgba(255,220,170,0.15))',
      'radial-gradient(circle, rgba(255,220,160,0.5), rgba(255,200,130,0.2))',
      'radial-gradient(circle, rgba(255,250,235,0.4), rgba(255,230,190,0.1))'
    ];

    const count = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      const beam        = document.createElement('div');
      beam.className    = 'sun-beam';
      beam.style.left   = (5 + Math.random() * 70) + '%';
      beam.style.top    = (5 + Math.random() * 45) + '%';

      const size        = 80 + Math.random() * 120;
      beam.style.width  = size + 'px';
      beam.style.height = size + 'px';
      beam.style.background = warmColors[Math.floor(Math.random() * warmColors.length)];

      const dur   = 8 + Math.random() * 10;
      const drift  = 10 + Math.random() * 30;
      const drift2 = drift + 10 + Math.random() * 20;
      const peak   = 0.12 + Math.random() * 0.13;

      beam.style.animationDuration = dur + 's';
      beam.style.animationDelay   = (Math.random() * 10) + 's';
      beam.style.setProperty('--drift',  `-${drift}px`);
      beam.style.setProperty('--drift2', `-${drift2}px`);
      beam.style.setProperty('--peak',   peak);

      container.appendChild(beam);
    }
  }
};
