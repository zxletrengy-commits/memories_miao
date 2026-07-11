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
    const memorySvg = charKey === 'lishen'
      ? `<svg viewBox="0 0 1024 1024" width="22" height="22">
          <path d="M893.58 709.22l-83.45-48.18 53.06-35.03c9.22-6.09 11.76-18.49 5.67-27.71-6.09-9.22-18.5-11.76-27.71-5.67l-69.75 46.05-108.95-62.9-0.37-127.34 109.32-63.12 69.75 46.05c3.39 2.24 7.22 3.31 11 3.31 6.49 0 12.86-3.16 16.71-8.98 6.09-9.22 3.55-21.62-5.67-27.71l-53.06-35.03 83.45-48.18c9.57-5.52 12.84-17.75 7.32-27.32s-17.75-12.84-27.32-7.32l-83.45 48.18-3.81-63.47c-0.66-11.03-10.16-19.44-21.16-18.77-11.03 0.66-19.43 10.14-18.77 21.16l5.01 83.43-108.93 62.89L532 350.23V224l74.76-37.38c9.88-4.94 13.88-16.95 8.94-26.83-4.94-9.88-16.95-13.88-26.83-8.94L532 179.28V82.92c0-11.05-8.95-20-20-20s-20 8.95-20 20v96.36l-56.87-28.44c-9.88-4.94-21.89-0.93-26.83 8.94-4.94 9.88-0.94 21.89 8.94 26.83L492 224v125.8l-110.09 64-109.31-63.12 5.01-83.43c0.66-11.03-7.74-20.5-18.77-21.16-11.03-0.66-20.5 7.74-21.16 18.77l-3.81 63.47-83.45-48.18c-9.57-5.52-21.8-2.25-27.32 7.32s-2.25 21.8 7.32 27.32l83.45 48.18L160.81 398c-9.22 6.09-11.76 18.49-5.67 27.71 3.85 5.83 10.21 8.98 16.71 8.98 3.78 0 7.61-1.07 11-3.31l69.75-46.05 108.95 62.9 0.37 127.34-109.32 63.11-69.75-46.05c-9.22-6.08-21.62-3.55-27.71 5.67-6.09 9.22-3.55 21.62 5.67 27.71l53.06 35.03-83.45 48.18c-9.57 5.52-12.84 17.75-7.32 27.32 3.7 6.42 10.43 10 17.34 10 3.39 0 6.83-0.86 9.98-2.68l83.45-48.18 3.81 63.47c0.64 10.62 9.45 18.8 19.95 18.8 0.4 0 0.81-0.01 1.22-0.04 11.03-0.66 19.43-10.14 18.77-21.16l-5.01-83.43 108.93-62.89L492 673.77V800l-74.76 37.38c-9.88 4.94-13.88 16.95-8.94 26.83 3.5 7.01 10.57 11.06 17.9 11.06 3.01 0 6.06-0.68 8.93-2.12L492 844.72v96.36c0 11.05 8.95 20 20 20s20-8.95 20-20v-96.36l56.87 28.44c9.88 4.94 21.89 0.93 26.83-8.94 4.94-9.88 0.94-21.89-8.94-26.83L532 800V674.2l110.09-63.99 109.32 63.12-5.01 83.43c-0.66 11.03 7.74 20.5 18.77 21.16 0.41 0.02 0.81 0.04 1.22 0.04 10.5 0 19.31-8.19 19.95-18.8l3.81-63.47 83.45 48.18c3.15 1.82 6.59 2.68 9.98 2.68 6.91 0 13.63-3.59 17.34-10 5.51-9.58 2.23-21.81-7.34-27.33zM401.91 576.01l-0.37-127.36 110.08-63.99 110.46 63.33 0.37 127.36-110.08 63.99-110.46-63.33z" fill="currentColor"/>
        </svg>`
      : `<svg viewBox="0 0 1024 1024" width="22" height="22">
          <path d="M768.284444 476.359111C700.188444 367.388444 593.891556 312.888889 449.308444 312.888889 213.987556 312.888889 113.777778 445.212444 113.777778 505.457778c0 60.188444 84.394667 192.512 335.530666 192.512 154.794667 0 262.087111-54.840889 321.848889-164.579556l107.861334 113.635556a12.913778 12.913778 0 0 0 22.272-8.903111V349.212444a12.913778 12.913778 0 0 0-22.926223-8.163555l-110.08 135.310222z m43.889778-189.155555a98.247111 98.247111 0 0 1 174.449778 62.008888v288.910223a98.247111 98.247111 0 0 1-169.500444 67.640889l-38.599112-40.675556c-79.104 78.734222-190.748444 118.215111-329.216 118.215111C198.485333 783.303111 28.444444 651.776 28.444444 505.457778 28.444444 362.951111 210.033778 227.555556 449.308444 227.555556c129.422222 0 237.084444 38.456889 318.378667 114.346666l44.487111-54.698666zM430.705778 739.413333l-71.765334-46.165333c27.875556-43.320889 47.701333-122.680889 47.701334-187.818667 0-53.703111-27.448889-139.036444-58.88-189.866666l72.590222-44.885334c39.310222 63.601778 71.623111 164.067556 71.623111 234.752 0 80.497778-23.808 175.786667-61.269333 233.984zM241.777778 562.346667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z" fill="currentColor"/>
        </svg>`;
    memoryIcon.innerHTML = memorySvg;
    memoryIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo('memory-' + charKey + '.html');
    });

    // 相册（预留）
    const galleryIcon = document.createElement('button');
    galleryIcon.className = 'action-icon gallery-icon';
    galleryIcon.title     = '相册（即将开放）';
    galleryIcon.innerHTML = `<svg viewBox="0 0 1024 1024" width="22" height="22">
      <path d="M797.7472 910.336H227.6352A156.0576 156.0576 0 0 1 71.68 754.432V266.9056a156.0576 156.0576 0 0 1 155.9552-155.8528h570.112a156.0576 156.0576 0 0 1 155.904 155.8528v487.5264a156.0576 156.0576 0 0 1-155.904 155.904zM227.6352 172.4928A94.5152 94.5152 0 0 0 133.12 266.9056v487.5264a94.5664 94.5664 0 0 0 94.5152 94.464h570.112a94.6176 94.6176 0 0 0 94.464-94.464V266.9056a94.5664 94.5664 0 0 0-94.464-94.4128z" fill="currentColor"/>
      <path d="M318.1568 432.9984a88.6272 88.6272 0 1 1 88.6272-88.6272 88.7808 88.7808 0 0 1-88.6272 88.6272z m0-115.8144a27.1872 27.1872 0 1 0 27.1872 27.1872A27.1872 27.1872 0 0 0 318.1568 317.44zM210.944 732.672a30.72 30.72 0 0 1-18.688-55.0912L341.1968 563.2a30.72 30.72 0 0 1 40.96 3.1744l51.2 53.7088 184.7296-180.2752a30.72 30.72 0 0 1 43.0592 0l172.1344 170.496a30.72 30.72 0 0 1-43.2128 43.6736L639.488 505.0368 454.1952 686.08a30.72 30.72 0 0 1-22.016 8.704 30.72 30.72 0 0 1-21.6576-9.472l-53.8112-56.32-127.0784 97.28a30.4128 30.4128 0 0 1-18.688 6.4z" fill="currentColor"/>
    </svg>`;

    // 日记（预留）
    const diaryIcon = document.createElement('button');
    diaryIcon.className = 'action-icon diary-icon';
    diaryIcon.title     = '日记（即将开放）';
    diaryIcon.innerHTML = `<svg viewBox="0 0 1024 1024" width="22" height="22">
      <path d="M179.2512 423.8336h76.4928a34.7648 34.7648 0 0 0 0-69.5296H179.2512a34.7648 34.7648 0 0 0 0 69.5296z" fill="currentColor"/>
      <path d="M770.1504 127.0784H292.7616c-47.8208 0-86.5792 38.7584-86.5792 86.5792v99.328h49.6128c42.0352 0 76.0832 34.048 76.0832 76.0832 0 42.0352-34.048 76.0832-76.0832 76.0832h-49.6128v125.3376h49.6128c42.0352 0 76.0832 34.048 76.0832 76.0832s-34.048 76.0832-76.0832 76.0832h-49.6128v79.3088c0 47.8208 38.7584 86.5792 86.5792 86.5792h477.3888c47.8208 0 86.5792-38.7584 86.5792-86.5792V213.6576c0.0512-47.8208-38.7584-86.5792-86.5792-86.5792z m-102.0928 442.4192c-30.72 33.9456-67.7376 60.3136-104.4992 86.9376-12.6464 9.1648-27.2896 8.3968-40.8064-1.6384-21.5552-16.0768-42.9568-32.3584-63.8976-49.2032-20.3264-16.3328-38.8096-34.6624-54.0672-56.064-30.0032-42.0352-29.1328-100.8128 2.9184-140.032 18.2784-22.3232 42.6496-31.744 71.3728-30.6176 24.0128 0.9728 44.9024 9.0112 61.7984 26.5216 0.768 0.768 1.536 1.4848 2.3552 2.2016 0.3072 0.256 0.768 0.3584 1.8432 0.8192 13.0048-13.2608 27.5968-23.4496 46.08-27.1872 58.88-11.8784 100.3008 21.1968 111.9744 74.1376 9.728 44.4928-5.5296 81.5104-35.072 114.1248z" fill="currentColor"/>
      <path d="M290.56 666.624a34.7648 34.7648 0 0 0-34.7648-34.7648H179.2512a34.7648 34.7648 0 0 0 0 69.5296h76.4928c19.2512 0 34.816-15.5648 34.816-34.7648z" fill="currentColor"/>
      <path d="M856.7808 411.392V213.6576c0-47.8208-38.7584-86.5792-86.5792-86.5792H292.7616c-47.8208 0-86.5792 38.7584-86.5792 86.5792v99.328h49.6128c42.0352 0 76.0832 34.048 76.0832 76.0832 0 42.0352-34.048 76.0832-76.0832 76.0832h-49.6128v125.3376h49.6128c42.0352 0 76.0832 34.048 76.0832 76.0832 0 42.0352-34.048 76.0832-76.0832 76.0832h-49.6128v79.3088c0 22.0672 8.3456 42.1376 21.9136 57.4464 18.1248 1.6896 36.4544 2.6112 54.9888 2.6112 283.9552 0.0512 520.6016-202.2912 573.696-470.6304z m-449.024-1.8944c18.2784-22.3232 42.6496-31.744 71.3728-30.6176 24.0128 0.9728 44.9024 9.0112 61.7984 26.5216 0.768 0.768 1.536 1.4848 2.3552 2.2016 0.3072 0.256 0.768 0.3584 1.8432 0.8192 13.0048-13.2608 27.5968-23.4496 46.08-27.1872 58.88-11.8784 100.3008 21.1968 111.9744 74.1376 9.7792 44.4928-5.5296 81.5104-35.0208 114.0736-30.72 33.9456-67.7376 60.3136-104.4992 86.9376-12.6464 9.1648-27.2896 8.3968-40.8064-1.6384-21.5552-16.0768-42.9568-32.3584-63.8976-49.2032-20.3264-16.3328-38.8096-34.6624-54.0672-56.064-30.0544-41.9328-29.2352-100.7616 2.8672-139.9808z" fill="currentColor"/>
      <path d="M292.7616 127.0784c-47.8208 0-86.5792 38.7584-86.5792 86.5792v99.328h49.6128c42.0352 0 76.0832 34.048 76.0832 76.0832 0 42.0352-34.048 76.0832-76.0832 76.0832h-49.6128v125.3376h49.6128c31.9488 0 59.2384 19.712 70.5024 47.5648 38.2976-14.1824 74.7008-32.256 108.6976-53.76-10.9568-10.7008-21.1968-22.1696-30.208-34.7648-30.0032-42.0352-29.1328-100.8128 2.9184-140.032 18.2784-22.3232 42.6496-31.744 71.3728-30.6176 24.0128 0.9728 44.9024 9.0112 61.7984 26.5216 0.768 0.768 1.536 1.4848 2.3552 2.2016 0.3072 0.256 0.768 0.3584 1.8432 0.8192 13.0048-13.2608 27.5968-23.4496 46.08-27.1872 14.2848-2.8672 27.4944-3.072 39.5264-1.024 43.264-75.4176 70.1952-161.4336 76.032-253.184H292.7616z" fill="currentColor"/>
      <path d="M206.1824 213.6576v99.328h49.6128c29.1328 0 54.4256 16.384 67.1744 40.3968 79.0528-58.368 142.8992-136.1408 184.4224-226.304H292.7616c-47.8208 0-86.5792 38.7584-86.5792 86.5792zM255.7952 354.304H179.2512a34.7648 34.7648 0 0 0-34.7648 34.7648c0 8.96 3.4816 16.9984 9.0112 23.1424 60.8256-9.0112 105.2672-25.344 133.3248-38.5536-5.6832-11.4176-17.408-19.3536-31.0272-19.3536z" fill="currentColor"/>
      <path d="M255.7952 631.808H179.2512a34.7648 34.7648 0 0 0-34.7648 34.7648c0 3.328 0.6144 6.5024 1.4848 9.5232 60.5696-5.632 109.2096-16.64 140.5952-25.344-5.7344-11.1616-17.3056-18.944-30.7712-18.944z" fill="currentColor"/>
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
    const textSpan = document.createElement('span');
    textSpan.className = 'bubble-text';
    textSpan.textContent = text;
    bubble.appendChild(textSpan);

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

  // ---------- 功能图标（环形侧边，自动避边） ----------
  toggleIcons(charKey, wrapper) {
    const icons = wrapper.querySelector('.action-icons');
    if (!icons) return;

    // 关闭其他角色的图标
    document.querySelectorAll('.action-icons.show').forEach(el => {
      if (el.id !== 'icons-' + charKey) {
        el.classList.remove('show');
        const owner = el.closest('.chibi-sprite');
        if (owner && owner !== wrapper) {
          owner.style.zIndex = owner.dataset.origZ || '';
          delete owner.dataset.origZ;
        }
      }
    });

    // 判断是否正在显示
    const willShow = !icons.classList.contains('show');
    const charLayer = document.getElementById('charLayer');

    if (willShow) {
      // 自动判断显示在哪一侧
      const scene = document.getElementById('cafeScene');
      if (scene) {
        const sceneRect = scene.getBoundingClientRect();
        const chibiRect = wrapper.getBoundingClientRect();
        const chibiCenter = chibiRect.left + chibiRect.width / 2;
        const sceneCenter = sceneRect.left + sceneRect.width / 2;
        icons.setAttribute('data-side', chibiCenter < sceneCenter ? 'right' : 'left');
      }
      // 提升角色层 z-index 让图标浮在气泡上方
      if (charLayer) charLayer.style.zIndex = '55';
      // 保存原始 z-index 并提到最前
      wrapper.dataset.origZ = wrapper.style.zIndex;
      wrapper.style.zIndex = '100';
    } else {
      // 恢复角色层和 chibi 层级
      if (charLayer) charLayer.style.zIndex = '';
      wrapper.style.zIndex = wrapper.dataset.origZ || '';
    }

    icons.classList.toggle('show');
    World.setUIState({ activeCharKey: willShow ? charKey : null });
  },

  closeAllIcons() {
    document.querySelectorAll('.action-icons.show').forEach(el => {
      el.classList.remove('show');
      // 恢复 chibi 层级
      const owner = el.closest('.chibi-sprite');
      if (owner) {
        owner.style.zIndex = owner.dataset.origZ || '';
        delete owner.dataset.origZ;
      }
    });
    const charLayer = document.getElementById('charLayer');
    if (charLayer) charLayer.style.zIndex = '';
    World.setUIState({ activeCharKey: null });
  },

  // ---------- 音乐（多曲随机播放） ----------
  _pickRandomTrack() {
    const tracks = window._musicTracks || ['track1'];
    return 'assets/music/' + tracks[Math.floor(Math.random() * tracks.length)] + '.mp3';
  },

  _playNextTrack(audio) {
    audio.src = this._pickRandomTrack();
    audio.play().catch(() => {});
  },

  initMusic() {
    const audio      = document.getElementById('bgm');
    const btn        = document.getElementById('musicBtn');
    if (!audio || !btn) return;

    // 播完自动切下一首
    audio.addEventListener('ended', () => this._playNextTrack(audio));

    const savedState = localStorage.getItem('bgm-on');
    if (savedState === 'off') {
      btn.classList.add('off');
      btn.querySelector('.label').textContent = 'OFF';
      World.setUIState({ musicOn: false });
    } else {
      audio.src = this._pickRandomTrack();
      audio.play().catch(() => {});
      World.setUIState({ musicOn: true });
    }
  },

  toggleMusic() {
    const audio = document.getElementById('bgm');
    const btn   = document.getElementById('musicBtn');
    if (!audio || !btn) return;

    if (audio.paused) {
      audio.src = this._pickRandomTrack();
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
