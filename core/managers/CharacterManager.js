/**
 * CharacterManager.js
 * 职责：角色生成、状态切换、拖拽逻辑
 */

const CharacterManager = {
  _data: null,
  _activeChars: [],
  _dragState: null,
  _autoSwitchTimers: {},
  _boundOnDrag: null,
  _boundEndDrag: null,

  _ZONE_STATE_MAP: {
    sleep: { qiyu: 'sleep', lishen: 'sleep' },
    plant: { qiyu: 'plant', lishen: 'plant' },
    clean: { qiyu: 'clean', lishen: 'clean' },
    relax: { qiyu: 'relax', lishen: 'relax' },
    lobby: { qiyu: 'lobby', lishen: 'lobby' }
  },

  async init(selectedKeys) {
    if (!this._data) {
      try {
        const res = await fetch('data/characters.json?v=' + Date.now());
        this._data = await res.json();
      } catch (e) {
        // Fallback for file:// protocol where fetch fails
        this._data = (typeof CHARACTER_DATA !== 'undefined') ? CHARACTER_DATA : {};
      }
    }
    World.setSelectedCharacters(selectedKeys);
    const charLayer = document.getElementById('charLayer');
    if (charLayer) charLayer.innerHTML = '';
    this._activeChars = [];
    this._autoSwitchTimers = {};
    this._boundOnDrag = this._onDrag.bind(this);
    this._boundEndDrag = this._endDrag.bind(this);
    selectedKeys.forEach(key => this._spawnCharacter(key));
  },

  _spawnCharacter(charKey) {
    const charLayer = document.getElementById('charLayer');
    if (!charLayer) return;
    const charData = this._data[charKey];
    if (!charData) return;
    const defaultState = charKey === 'qiyu' ? 'lobby' : 'lobby';
    const stateData = charData.availableStates[defaultState];
    if (!stateData) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'chibi-sprite';
    wrapper.dataset.charId = charKey;
    wrapper.dataset.state = defaultState;
    const picked = this._pickStateOption(stateData);
    const zIndex = (charKey === 'lishen' && (defaultState === 'sleep' || defaultState === 'relax')) ? 8 : 10;
    wrapper.style.cssText = `position:absolute;z-index:${zIndex};cursor:grab;touch-action:none;user-select:none;transform:translate(-50%,-50%);width:${picked.widthPct}%;height:auto`;
    wrapper.style.left = picked.pos.x + '%';
    wrapper.style.top = picked.pos.y + '%';

    if (charData.spriteType === 'gif') {
      const img = document.createElement('img');
      img.className = 'chibi-img';
      img.src = charData.assetPath + encodeURIComponent(picked.img);
      img.style.cssText = 'width:100%;height:auto;pointer-events:none';
      img.draggable = false;
      wrapper.appendChild(img);
    } else {
      const cvs = CharacterPixel.generate(charKey, defaultState);
      cvs.className = 'chibi-canvas';
      cvs.style.pointerEvents = 'none';
      wrapper.appendChild(cvs);
    }

    const label = document.createElement('div');
    label.className = 'char-state-label';
    wrapper.appendChild(label);

    const icons = UIManager.createActionIcons(charKey);
    wrapper.appendChild(icons);

    wrapper.addEventListener('click', (e) => {
      if (wrapper.dataset.justDragged === 'true') { wrapper.dataset.justDragged = ''; return; }
      e.stopPropagation();
      UIManager.toggleIcons(charKey, wrapper);
      UIManager.showBubble(charKey, wrapper, charData.dialoguePool);
    });

    this._bindDragEvents(charKey, wrapper);

    charLayer.appendChild(wrapper);
    this._activeChars.push({ key: charKey, wrapper: wrapper });
    this._startAutoSwitch(charKey, wrapper);
    setTimeout(() => {
      UIManager.showBubble(charKey, wrapper, charData.dialoguePool);
    }, 2000 + Math.random() * 3000);
  },

  changeCharacterState(charKey, wrapper, newState) {
    const charData = this._data[charKey];
    const stateData = charData.availableStates[newState];
    if (!stateData) return;
    wrapper.dataset.state = newState;
    const picked = this._pickStateOption(stateData);
    wrapper.style.width = picked.widthPct + '%';
    wrapper.style.height = 'auto';
    wrapper.style.left = picked.pos.x + '%';
    wrapper.style.top = picked.pos.y + '%';
    // 黎深在 sleep/relax 热区时层级低于祁煜
    if (charKey === 'lishen') {
      wrapper.style.zIndex = (newState === 'sleep' || newState === 'relax') ? '8' : '10';
    }
    const label = wrapper.querySelector('.char-state-label');
    if (label) label.textContent = '';

    if (charData.spriteType === 'gif') {
      const img = wrapper.querySelector('.chibi-img');
      if (img && picked.img) {
        img.src = charData.assetPath + encodeURIComponent(picked.img);
      }
    } else {
      const oldCvs = wrapper.querySelector('.chibi-canvas');
      if (oldCvs) oldCvs.remove();
      const newCvs = CharacterPixel.generate(charKey, newState);
      newCvs.className = 'chibi-canvas';
      newCvs.style.pointerEvents = 'none';
      wrapper.insertBefore(newCvs, wrapper.firstChild);
    }
    this._startAutoSwitch(charKey, wrapper);
  },

  _startAutoSwitch(charKey, wrapper) {
    if (this._autoSwitchTimers[charKey]) clearTimeout(this._autoSwitchTimers[charKey]);
    const charData = this._data[charKey];
    const states = Object.keys(charData.availableStates);
    const delay = 30000 + Math.random() * 60000;
    this._autoSwitchTimers[charKey] = setTimeout(() => {
      const current = wrapper.dataset.state;
      let others = states.filter(s => s !== current);
      // 双人模式下，clean 热区同一时间只允许一个角色（手动拖拽不受限）
      if (this._activeChars.length > 1) {
        const otherChar = this._activeChars.find(c => c.key !== charKey);
        if (otherChar && otherChar.wrapper.dataset.state === 'clean') {
          others = others.filter(s => s !== 'clean');
        }
      }
      if (others.length === 0) return;
      const next = others[Math.floor(Math.random() * others.length)];
      this.changeCharacterState(charKey, wrapper, next);
      UIManager.showBubble(charKey, wrapper, charData.dialoguePool);
    }, delay);
  },

  // --- DRAG START ---
  _startDrag(e, charKey, wrapper) {
    const touch = e.touches ? e.touches[0] : e;
    const scene = document.getElementById('cafeScene');
    const sceneRect = scene.getBoundingClientRect();

    // 记录鼠标在场景内的百分比坐标
    const mousePctX = (touch.clientX - sceneRect.left) / sceneRect.width * 100;
    const mousePctY = (touch.clientY - sceneRect.top) / sceneRect.height * 100;

    // 元素当前的 left/top 百分比（就是中心点坐标）
    const curLeft = parseFloat(wrapper.style.left) || 0;
    const curTop = parseFloat(wrapper.style.top) || 0;

    // 偏移 = 鼠标百分比 - 元素中心百分比
    this._dragState = {
      charKey,
      wrapper,
      offsetX: mousePctX - curLeft,
      offsetY: mousePctY - curTop,
      startX: touch.clientX,
      startY: touch.clientY,
      didMove: false,
      holdTimer: null
    };
    wrapper.classList.add('dragging');
    World.setUIState({ isDragging: true });
    document.getElementById('dropZones').classList.add('drop-zones-active');
    document.addEventListener('mousemove', this._boundOnDrag);
    document.addEventListener('mouseup', this._boundEndDrag);
    document.addEventListener('touchmove', this._boundOnDrag, { passive: false });
    document.addEventListener('touchend', this._boundEndDrag);
    document.addEventListener('touchcancel', this._boundEndDrag);
  },

  // --- DRAG MOVE ---
  _onDrag(e) {
    if (!this._dragState) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - this._dragState.startX;
    const dy = touch.clientY - this._dragState.startY;
    if (!this._dragState.didMove && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this._dragState.didMove = true;
    }
    if (!this._dragState.didMove) return;

    const wrapper = this._dragState.wrapper;
    const scene = document.getElementById('cafeScene');
    const sceneRect = scene.getBoundingClientRect();
    // 鼠标百分比 - 初始偏移 = 元素中心点应在的百分比坐标
    const centerX = (touch.clientX - sceneRect.left) / sceneRect.width * 100 - this._dragState.offsetX;
    const centerY = (touch.clientY - sceneRect.top) / sceneRect.height * 100 - this._dragState.offsetY;
    wrapper.style.left = centerX + '%';
    wrapper.style.top = centerY + '%';

    // GIF拖拽动画（祁煜专用）
    const charKey = this._dragState.charKey;
    const data = this._data[charKey];
    if (data && data.dragGifs) {
      const xPct = ((touch.clientX - sceneRect.left) / sceneRect.width) * 100;
      let gif;
      if (xPct < 33) gif = data.dragGifs.left;
      else if (xPct > 66) gif = data.dragGifs.right;
      else gif = data.dragGifs.center;
      const img = wrapper.querySelector('.chibi-img');
      if (img && !img.src.endsWith(encodeURIComponent(gif))) {
        img.src = data.assetPath + encodeURIComponent(gif);
      }
      // 拖拽时应用 dragGifs 的百分比宽度（左右用 sideWidthPct，中间用 widthPct）
      const dragWidthPct = (gif === data.dragGifs.center)
        ? (data.dragGifs.widthPct || 23)
        : (data.dragGifs.sideWidthPct || 18);
      wrapper.style.width = dragWidthPct + '%';
    }

    // 高亮热区
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const zR = zone.getBoundingClientRect();
      const over = touch.clientX >= zR.left && touch.clientX <= zR.right &&
                   touch.clientY >= zR.top && touch.clientY <= zR.bottom;
      zone.classList.toggle('highlight-valid', over);
    });
  },

  // --- DRAG END ---
  _endDrag(e) {
    if (!this._dragState) return;
    const wrapper = this._dragState.wrapper;
    const charKey = this._dragState.charKey;
    const scene = document.getElementById('cafeScene');
    const sceneRect = scene.getBoundingClientRect();
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const wasDrag = this._dragState.didMove;

    // 检查落在哪个热区
    let droppedZone = null;
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const zR = zone.getBoundingClientRect();
      if (touch.clientX >= zR.left && touch.clientX <= zR.right &&
          touch.clientY >= zR.top && touch.clientY <= zR.bottom) {
        droppedZone = zone.dataset.zone;
      }
    });

    if (wasDrag) wrapper.dataset.justDragged = 'true';
    wrapper.classList.remove('dragging');
    document.getElementById('dropZones').classList.remove('drop-zones-active');
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('highlight-valid'));

    if (!wasDrag) {
      this._cleanup();
      // touchend 时没有移动，手动触发点击逻辑（因为 preventDefault 阻止了 click 事件）
      if (e.changedTouches) {
        const charData = this._data[charKey];
        UIManager.toggleIcons(charKey, wrapper);
        UIManager.showBubble(charKey, wrapper, charData.dialoguePool);
      }
      return;
    }

    // 落到热区 → 切换状态；没落到 → 回到当前状态的原始坐标
    if (droppedZone && this._ZONE_STATE_MAP[droppedZone]) {
      const targetState = this._ZONE_STATE_MAP[droppedZone][charKey];
      if (targetState && this._data[charKey].availableStates[targetState]) {
        this.changeCharacterState(charKey, wrapper, targetState);
      }
    } else {
      // 没落到热区，恢复原始位置、尺寸和 gif
      const cur = wrapper.dataset.state;
      const sd = this._data[charKey].availableStates[cur];
      if (sd) {
        const restored = this._pickStateOption(sd);
        wrapper.style.left = restored.pos.x + '%';
        wrapper.style.top = restored.pos.y + '%';
        wrapper.style.width = restored.widthPct + '%';
        const charData = this._data[charKey];
        if (charData.spriteType === 'gif') {
          const img = wrapper.querySelector('.chibi-img');
          if (img && restored.img) {
            img.src = charData.assetPath + encodeURIComponent(restored.img);
          }
        }
      }
    }

    this._cleanup();
  },

  _cleanup() {
    this._dragState = null;
    World.setUIState({ isDragging: false });
    document.removeEventListener('mousemove', this._boundOnDrag);
    document.removeEventListener('mouseup', this._boundEndDrag);
    document.removeEventListener('touchmove', this._boundOnDrag);
    document.removeEventListener('touchend', this._boundEndDrag);
    document.removeEventListener('touchcancel', this._boundEndDrag);
  },

  // 从 stateData 中随机选一个 gif + 坐标 + 宽度
  _pickStateOption(stateData) {
    if (stateData.options && stateData.options.length > 0) {
      const opt = stateData.options[Math.floor(Math.random() * stateData.options.length)];
      return { img: opt.img, widthPct: opt.widthPct || 15, pos: opt.pos };
    }
    return {
      img: Array.isArray(stateData.img)
        ? stateData.img[Math.floor(Math.random() * stateData.img.length)]
        : stateData.img,
      widthPct: stateData.widthPct || 15,
      pos: stateData.pos
    };
  },

  // 独立的拖拽绑定方法，供编辑器关闭后重新绑定
  _bindDragEvents(charKey, wrapper) {
    // 移除旧的监听器（如果有），避免重复绑定
    if (wrapper._startDragHandler) {
      wrapper.removeEventListener('mousedown', wrapper._startDragHandler);
      wrapper.removeEventListener('touchstart', wrapper._startDragHandler);
    }
    const startDrag = (e) => {
      // 图标按钮区域不拦截，让浏览器正常合成 click 事件
      if (e.target.closest('.action-icons')) return;
      e.preventDefault();
      this._startDrag(e, charKey, wrapper);
    };
    wrapper._startDragHandler = startDrag;
    wrapper.addEventListener('mousedown', startDrag);
    wrapper.addEventListener('touchstart', startDrag, { passive: false });
  }
};

// 挂到 window，供 editor-mode.js 关闭编辑器时重新绑定拖拽
window.characterManager = CharacterManager;
