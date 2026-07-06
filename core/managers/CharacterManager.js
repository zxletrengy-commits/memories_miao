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
    clean: { qiyu: 'clean', lishen: 'idle' },
    relax: { qiyu: 'relax', lishen: 'idle' },
    lobby: { qiyu: 'lobby', lishen: 'coffee' }
  },

  async init(selectedKeys) {
    if (!this._data) {
      try {
        const res = await fetch('data/characters.json');
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
    const defaultState = charKey === 'qiyu' ? 'lobby' : 'coffee';
    const stateData = charData.availableStates[defaultState];
    if (!stateData) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'chibi-sprite';
    wrapper.dataset.charId = charKey;
    wrapper.dataset.state = defaultState;
    const widthPct = stateData.widthPct || 15;
    wrapper.style.cssText = `position:absolute;z-index:10;cursor:grab;touch-action:none;user-select:none;transform:translate(-50%,-50%);width:${widthPct}%`;
    wrapper.style.left = stateData.pos.x + '%';
    wrapper.style.top = stateData.pos.y + '%';

    if (charData.spriteType === 'gif') {
      const img = document.createElement('img');
      img.className = 'chibi-img';
      const imgName = Array.isArray(stateData.img) 
        ? stateData.img[Math.floor(Math.random() * stateData.img.length)] 
        : stateData.img;
      img.src = charData.assetPath + imgName;
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
    label.textContent = stateData.label || '';
    wrapper.appendChild(label);

    const icons = UIManager.createActionIcons(charKey);
    wrapper.appendChild(icons);

    wrapper.addEventListener('click', (e) => {
      if (wrapper.dataset.justDragged === 'true') { wrapper.dataset.justDragged = ''; return; }
      e.stopPropagation();
      UIManager.toggleIcons(charKey, wrapper);
      UIManager.showBubble(charKey, wrapper, charData.dialoguePool);
    });

    const startDrag = (e) => { e.preventDefault(); this._startDrag(e, charKey, wrapper); };
    wrapper.addEventListener('mousedown', startDrag);
    wrapper.addEventListener('touchstart', startDrag, { passive: false });

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
    const widthPct = stateData.widthPct || 15;
    wrapper.style.width = widthPct + '%';
    wrapper.style.left = stateData.pos.x + '%';
    wrapper.style.top = stateData.pos.y + '%';
    const label = wrapper.querySelector('.char-state-label');
    if (label) label.textContent = stateData.label || '';

    if (charData.spriteType === 'gif') {
      const img = wrapper.querySelector('.chibi-img');
      if (img && stateData.img) {
        const imgName = Array.isArray(stateData.img) 
          ? stateData.img[Math.floor(Math.random() * stateData.img.length)] 
          : stateData.img;
        img.src = charData.assetPath + imgName;
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
      const others = states.filter(s => s !== current);
      if (others.length === 0) return;
      const next = others[Math.floor(Math.random() * others.length)];
      this.changeCharacterState(charKey, wrapper, next);
      UIManager.showBubble(charKey, wrapper, charData.dialoguePool);
    }, delay);
  },

  // --- DRAG START ---
  _startDrag(e, charKey, wrapper) {
    const touch = e.touches ? e.touches[0] : e;
    const rect = wrapper.getBoundingClientRect();
    this._dragState = {
      charKey: charKey,
      wrapper: wrapper,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
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
    let x = touch.clientX - sceneRect.left - this._dragState.offsetX;
    let y = touch.clientY - sceneRect.top - this._dragState.offsetY;
    wrapper.style.transform = 'none';
    wrapper.style.left = Math.max(0, x) + 'px';
    wrapper.style.top = Math.max(0, y) + 'px';

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
      if (img && !img.src.endsWith(gif)) {
        img.src = data.assetPath + gif;
      }
      // 拖拽时应用 dragGifs 的百分比宽度
      const dragWidthPct = data.dragGifs.widthPct || 15;
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
      return;
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const centerX = wrapperRect.left + wrapperRect.width / 2 - sceneRect.left;
    const centerY = wrapperRect.top + wrapperRect.height / 2 - sceneRect.top;
    const xPct = (centerX / sceneRect.width) * 100;
    const yPct = (centerY / sceneRect.height) * 100;

    requestAnimationFrame(() => {
      wrapper.style.transform = 'translate(-50%,-50%)';
      wrapper.style.left = xPct + '%';
      wrapper.style.top = yPct + '%';

      if (droppedZone && this._ZONE_STATE_MAP[droppedZone]) {
        const targetState = this._ZONE_STATE_MAP[droppedZone][charKey];
        if (targetState && this._data[charKey].availableStates[targetState]) {
          this.changeCharacterState(charKey, wrapper, targetState);
        }
      } else {
        const cur = wrapper.dataset.state;
        const sd = this._data[charKey].availableStates[cur];
        if (sd) { wrapper.style.left = sd.pos.x + '%'; wrapper.style.top = sd.pos.y + '%'; }
      }
    });

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
  }
};
