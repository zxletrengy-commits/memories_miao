/**
 * UIManager.js
 * 职责：对话气泡、功能图标、全局UI交互
 * 不知道角色数据结构，不知道场景背景逻辑。
 * 接收来自 CharacterManager 的调用，操作 DOM。
 */

const UIManager = {
  _bubbleTimers: {},

  // ---------- 创建功能图标容器 ----------
  createActionIcons(charKey) {
    const icons = document.createElement('div');
    icons.className = 'action-icons';
    icons.id        = 'icons-' + charKey;

    // 回忆入口
    const memoryIcon = document.createElement('button');
    memoryIcon.className = 'action-icon memory-icon';
    memoryIcon.title     = '进入回忆';
    memoryIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor" fill="none" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    memoryIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo('memory-' + charKey + '.html');
    });

    // 相册（预留）
    const galleryIcon = document.createElement('button');
    galleryIcon.className = 'action-icon gallery-icon';
    galleryIcon.title     = '相册（即将开放）';
    galleryIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <path d="M21 15l-5-5-5 5-4-4-4 4"
        stroke="currentColor" fill="none" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    // 日记（预留）
    const diaryIcon = document.createElement('button');
    diaryIcon.className = 'action-icon diary-icon';
    diaryIcon.title     = '日记（即将开放）';
    diaryIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M4 4h16v16H4z" stroke="currentColor" fill="none" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="8" y1="8"  x2="16" y2="8"  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

    icons.appendChild(memoryIcon);
    icons.appendChild(galleryIcon);
    icons.appendChild(diaryIcon);
    return icons;
  },

  // ---------- 对话气泡 ----------
  showBubble(charKey, wrapper, dialoguePool) {
    const bubbleLayer = document.getElementById('bubbleLayer');
    if (!bubbleLayer) return;

    // 清除旧气泡
    if (this._bubbleTimers[charKey]) clearTimeout(this._bubbleTimers[charKey]);
    const oldBubble = bubbleLayer.querySelector('.bubble-' + charKey);
    if (oldBubble) oldBubble.remove();

    const text   = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
    const bubble = document.createElement('div');
    bubble.className   = `dialogue-bubble bubble-${charKey}`;
    bubble.textContent = text;

    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const scene = document.getElementById('cafeScene');
      const sceneRect = scene ? scene.getBoundingClientRect() : { left: 0, top: 0 };
      bubble.style.left = (rect.left + rect.width / 2 - sceneRect.left) + 'px';
      bubble.style.top  = (rect.top - 10 - sceneRect.top) + 'px';
    } else {
      bubble.style.left = '50%';
      bubble.style.top  = '30%';
    }

    bubbleLayer.appendChild(bubble);
    requestAnimationFrame(() => bubble.classList.add('bubble-show'));

    this._bubbleTimers[charKey] = setTimeout(() => {
      bubble.classList.remove('bubble-show');
      bubble.classList.add('bubble-hide');
      setTimeout(() => bubble.remove(), 500);
    }, 4000);
  },

  // ---------- 功能图标 ----------
  toggleIcons(charKey, wrapper) {
    const icons = wrapper.querySelector('.action-icons');
    if (!icons) return;

    // 关闭其他角色的图标
    document.querySelectorAll('.action-icons.show').forEach(el => {
      if (el.id !== 'icons-' + charKey) el.classList.remove('show');
    });

    icons.classList.toggle('show');
    World.setUIState({ activeCharKey: icons.classList.contains('show') ? charKey : null });
  },

  closeAllIcons() {
    document.querySelectorAll('.action-icons.show').forEach(el => el.classList.remove('show'));
    World.setUIState({ activeCharKey: null });
  },

  // ---------- 音乐 ----------
  initMusic() {
    const audio      = document.getElementById('bgm');
    const btn        = document.getElementById('musicBtn');
    if (!audio || !btn) return;

    const savedState = localStorage.getItem('bgm-on');
    if (savedState === 'off') {
      btn.classList.add('off');
      btn.querySelector('.label').textContent = 'OFF';
      World.setUIState({ musicOn: false });
    } else {
      audio.play().catch(() => {});
      World.setUIState({ musicOn: true });
    }
  },

  toggleMusic() {
    const audio = document.getElementById('bgm');
    const btn   = document.getElementById('musicBtn');
    if (!audio || !btn) return;

    if (audio.paused) {
      audio.play();
      btn.classList.remove('off');
      btn.querySelector('.label').textContent = 'ON';
      localStorage.setItem('bgm-on', 'on');
      World.setUIState({ musicOn: true });
    } else {
      audio.pause();
      btn.classList.add('off');
      btn.querySelector('.label').textContent = 'OFF';
      localStorage.setItem('bgm-on', 'off');
      World.setUIState({ musicOn: false });
    }
  }
};
