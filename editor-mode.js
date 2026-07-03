// 喵喵屋场景编辑器 - 完整修复版
// 修复：transform冲突、游戏拖拽干扰、选择器错误、角色resize

(function() {
  let editorActive = false;
  let selectedElement = null;
  let isDragging = false;
  let isResizing = false;
  let startX, startY, startLeft, startTop, startWidth, startHeight;
  let resizeCorner = null;
  let originalTransform = null; // 保存元素的原始transform

  // 编辑器UI
  let editorPanel = null;
  let toggleBtn = null;

  // ========== 工具函数 ==========

  /** 判断元素是否有影响定位的CSS transform（translate）
   *  只对包含 translate 的变换做特殊处理，
   *  纯 scale 跳过（如 drop-zone 的 scale(0.92) 只是视觉缩放）
   */
  function hasCssTransform(el) {
    const tf = getComputedStyle(el).transform;
    if (!tf || tf === 'none') return false;
    // 只处理 char-instance 的 translate(-50%, -50%)，它影响 left/top 定位
    // drop-zone 的 scale(0.92) 和 lobby-decoration 的 translateX(-50%) 跳过
    return el.classList.contains('char-instance') && tf.includes('translate');
  }

  /** 获取元素在参照容器中的百分比位置
   *  使用 offsetParent（最近的定位祖先）而不是 parentElement，
   *  因为 drop-zone 的直接父级 #dropZones 宽高为0（子元素绝对定位），
   *  但其百分比定位实际相对于 .cafe-scene（position: relative）
   */
  function getPositionPct(el) {
    const parent = el.offsetParent;
    if (!parent) return { x: 0, y: 0 };

    // 临时去掉transform以获取真实left/top
    const savedTransform = el.style.transform;
    el.style.transform = 'none';
    
    const rect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    
    const x = ((rect.left - parentRect.left) / parentRect.width) * 100;
    const y = ((rect.top - parentRect.top) / parentRect.height) * 100;
    
    el.style.transform = savedTransform;
    return { x, y };
  }

  /** 获取元素视觉尺寸（px） */
  function getVisualSize(el) {
    const savedTransform = el.style.transform;
    el.style.transform = 'none';
    const rect = el.getBoundingClientRect();
    el.style.transform = savedTransform;
    return { width: rect.width, height: rect.height };
  }

  /** 临时移除transform并重新计算left/top百分比，保持视觉位置不变 */
  function removeTransformKeepPosition(el) {
    const pos = getPositionPct(el);
    el.style.transform = 'none';
    el.style.left = pos.x + '%';
    el.style.top = pos.y + '%';
  }

  /** 恢复transform并重新计算left/top百分比，保持视觉位置不变 */
  function restoreTransformKeepPosition(el, transformValue) {
    const rect = el.getBoundingClientRect();
    const parent = el.offsetParent;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const x = ((rect.left - parentRect.left) / parentRect.width) * 100;
    const y = ((rect.top - parentRect.top) / parentRect.height) * 100;
    el.style.transform = transformValue;
    el.style.left = x + '%';
    el.style.top = y + '%';
  }

  /** 获取实际可调整大小的目标元素（角色→修改sprite/img，其他→自身） */
  function getResizeTarget(el) {
    const type = el.dataset.editable;
    if (type === 'character') {
      // 角色：调整chibi-sprite的大小
      const sprite = el.querySelector('.chibi-sprite');
      const img = el.querySelector('.chibi-img');
      return { element: sprite || img || el, isCharacter: true, img: img };
    }
    return { element: el, isCharacter: false, img: null };
  }

  // ========== 初始化 ==========

  function init() {
    createToggleButton();
    createEditorPanel();
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E') {
        toggleEditor();
      }
      if (editorActive && e.key === 'Delete' && selectedElement) {
        if (confirm('确定删除这个元素吗？')) {
          selectedElement.remove();
          selectedElement = null;
          hideProperties();
        }
      }
    });
  }

  // ========== UI 创建 ==========

  function createToggleButton() {
    toggleBtn = document.createElement('button');
    toggleBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #38bdf8;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    `;
    toggleBtn.textContent = '✏️ 编辑';
    toggleBtn.onclick = toggleEditor;
    document.body.appendChild(toggleBtn);
  }

  function createEditorPanel() {
    editorPanel = document.createElement('div');
    editorPanel.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 320px;
      height: 100vh;
      background: #1e293b;
      border-right: 2px solid #38bdf8;
      z-index: 9999;
      display: none;
      overflow-y: auto;
      padding: 20px;
      box-shadow: 4px 0 16px rgba(0,0,0,0.3);
    `;
    
    editorPanel.innerHTML = `
      <h2 style="color: #38bdf8; margin-bottom: 20px; font-size: 18px;">🎨 场景编辑器</h2>
      
      <div style="margin-bottom: 20px; padding: 12px; background: #0f172a; border-radius: 6px; font-size: 12px; color: #94a3b8;">
        💡 点击元素选中，拖动移动，拖动角落调整大小<br>
        <span style="color: #fbbf24;">角色：拖动移动位置，调整大小改变GIF/像素图尺寸</span>
      </div>
      
      <div id="elementList" style="margin-bottom: 20px;"></div>
      
      <div id="propertiesPanel" style="display: none;">
        <h3 style="color: #f8fafc; font-size: 14px; margin-bottom: 12px;">⚙️ 属性</h3>
        <div id="propertyInputs"></div>
      </div>
      
      <button id="saveConfig" style="
        width: 100%;
        padding: 12px;
        background: #22d3ee;
        color: #0f172a;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
      ">💾 导出配置</button>
    `;
    
    document.body.appendChild(editorPanel);
    document.getElementById('saveConfig').onclick = saveConfig;
  }

  // ========== 编辑器开关 ==========

  function toggleEditor() {
    editorActive = !editorActive;
    
    if (editorActive) {
      editorPanel.style.display = 'block';
      toggleBtn.textContent = '❌ 关闭';
      toggleBtn.style.background = '#f97316';
      enableEditMode();
    } else {
      editorPanel.style.display = 'none';
      toggleBtn.textContent = '✏️ 编辑';
      toggleBtn.style.background = '#38bdf8';
      disableEditMode();
    }
  }

  // ========== 启用/禁用编辑模式 ==========

  function enableEditMode() {
    const elements = collectElements();
    renderElementList(elements);
    
    // 【修复】阻止游戏的拖拽系统干扰：让.chibi-sprite不接收鼠标事件
    document.querySelectorAll('.chibi-sprite').forEach(sprite => {
      sprite.style.pointerEvents = 'none';
    });
    // 也让action-icons不干扰（它们有独立点击）
    document.querySelectorAll('.action-icons').forEach(icons => {
      icons.style.pointerEvents = 'none';
    });
    
    elements.forEach(el => makeEditable(el.element, el.type));
    
    // 【关键修复】drop-zone 和 lobby-decoration 在CSS中有 pointer-events: none，
    // 编辑器需要覆盖它才能接收到鼠标事件
    document.querySelectorAll('.drop-zone, .lobby-decoration').forEach(el => {
      el.style.pointerEvents = 'auto';
    });
  }

  function disableEditMode() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.style.outline = 'none';
      el.style.cursor = 'default';
      el.style.transition = '';
      el.style.opacity = '';
      el.style.pointerEvents = ''; // 恢复CSS默认值
      el.querySelectorAll('.resize-handle').forEach(h => h.remove());
      // 移除编辑器添加的事件监听器
      el.removeEventListener('click', onClick);
      el.removeEventListener('mousedown', onMouseDown);
      // 清除行内样式残留
      el.style.transform = '';
      if (el.dataset.originalTransform) {
        // 如果浏览器有计算出的transform，保留它；否则留空
        delete el.dataset.originalTransform;
      }
      delete el.dataset.editable;
    });
    
    // 【修复】恢复游戏的拖拽系统
    document.querySelectorAll('.chibi-sprite').forEach(sprite => {
      sprite.style.pointerEvents = '';
    });
    document.querySelectorAll('.action-icons').forEach(icons => {
      icons.style.pointerEvents = '';
    });
    
    selectedElement = null;
  }

  // ========== 收集元素 ==========

  function collectElements() {
    const elements = [];
    let charIndex = 0;
    let zoneIndex = 0;
    
    // 【修复】角色选择器 .char → .char-instance
    document.querySelectorAll('.char-instance').forEach(el => {
      charIndex++;
      const charKey = el.dataset.char || 'unknown';
      elements.push({
        element: el,
        type: 'character',
        name: `角色 ${charIndex} (${charKey})`
      });
    });
    
    // 接待区PNG
    document.querySelectorAll('.lobby-decoration').forEach(el => {
      elements.push({
        element: el,
        type: 'decoration',
        name: `接待区装饰`
      });
    });
    
    // 热区
    document.querySelectorAll('.drop-zone').forEach(el => {
      zoneIndex++;
      const zoneName = el.dataset.zone || 'unknown';
      const label = el.querySelector('.zone-label')?.textContent || zoneName;
      elements.push({
        element: el,
        type: 'zone',
        name: `热区 ${zoneIndex}: ${label}`
      });
    });
    
    return elements;
  }

  // ========== 渲染列表 ==========

  function renderElementList(elements) {
    const list = document.getElementById('elementList');
    list.innerHTML = '<h3 style="color: #f8fafc; font-size: 14px; margin-bottom: 12px;">📋 元素列表</h3>';
    
    elements.forEach(item => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width: 100%;
        padding: 10px;
        background: #334155;
        color: #f8fafc;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
        margin-bottom: 8px;
        font-size: 13px;
        transition: background 0.2s;
      `;
      btn.textContent = (item.type === 'character' ? '🧑 ' : item.type === 'decoration' ? '🖼 ' : '📍 ') + item.name;
      btn.onmouseenter = () => { btn.style.background = '#475569'; };
      btn.onmouseleave = () => { btn.style.background = '#334155'; };
      btn.onclick = () => selectElement(item.element);
      list.appendChild(btn);
    });
  }

  // ========== 使元素可编辑 ==========

  function makeEditable(el, type) {
    el.dataset.editable = type;
    el.style.outline = '2px dashed #38bdf8';
    el.style.cursor = 'move';
    
    // 保存原始transform
    const cssTransform = getComputedStyle(el).transform;
    if (cssTransform && cssTransform !== 'none') {
      el.dataset.originalTransform = cssTransform;
    }
    
    // 用addEventListener替代onclick/onmousedown，便于stopPropagation
    el.addEventListener('click', onClick);
    el.addEventListener('mousedown', onMouseDown);
    
    // 添加调整大小手柄
    addResizeHandles(el);
  }

  function onClick(e) {
    // 如果点在resize-handle上，不触发放置
    if (e.target.classList.contains('resize-handle')) return;
    e.stopPropagation();
    selectElement(this);
  }

  function onMouseDown(e) {
    if (e.target.classList.contains('resize-handle')) {
      startResize(e, this);
    } else {
      startDrag(e, this);
    }
    e.stopPropagation(); // 【修复】阻止事件冒泡到游戏系统
  }

  // ========== 添加调整大小手柄 ==========

  function addResizeHandles(el) {
    el.querySelectorAll('.resize-handle').forEach(h => h.remove());
    
    const positions = ['nw', 'ne', 'sw', 'se'];
    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      handle.dataset.corner = pos;
      handle.style.cssText = `
        position: absolute;
        width: 14px;
        height: 14px;
        background: #22d3ee;
        border: 2px solid #0f172a;
        border-radius: 50%;
        cursor: ${pos.includes('n') ? 'n' : 's'}${pos.includes('w') ? 'w' : 'e'}-resize;
        z-index: 100;
        box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
      `;
      
      if (pos.includes('n')) handle.style.top = '-7px';
      if (pos.includes('s')) handle.style.bottom = '-7px';
      if (pos.includes('w')) handle.style.left = '-7px';
      if (pos.includes('e')) handle.style.right = '-7px';
      
      el.appendChild(handle);
    });
  }

  // ========== 选中元素 ==========

  function selectElement(el) {
    if (selectedElement && selectedElement !== el) {
      selectedElement.style.outline = '2px dashed #38bdf8';
    }
    
    selectedElement = el;
    el.style.outline = '3px solid #22d3ee';
    showProperties(el);
  }

  // ========== 属性面板 ==========

  function showProperties(el) {
    const panel = document.getElementById('propertiesPanel');
    const inputs = document.getElementById('propertyInputs');
    panel.style.display = 'block';
    
    // 【修复】使用消除transform的位置
    const pos = getPositionPct(el);
    const size = getVisualSize(el);
    
    const x = pos.x.toFixed(1);
    const y = pos.y.toFixed(1);
    const width = size.width.toFixed(0);
    const height = size.height.toFixed(0);
    
    const type = el.dataset.editable;
    const isCharacter = type === 'character';
    
    inputs.innerHTML = `
      <div style="margin-bottom: 12px;">
        <label style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 4px;">X (%)</label>
        <input type="number" step="0.1" id="propX" value="${x}" 
          style="width: 100%; padding: 8px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 4px;">Y (%)</label>
        <input type="number" step="0.1" id="propY" value="${y}" 
          style="width: 100%; padding: 8px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 4px;">
          ${isCharacter ? 'GIF/精灵 宽度 (px)' : '宽度 (px)'}
        </label>
        <input type="number" id="propWidth" value="${width}" 
          style="width: 100%; padding: 8px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="color: #94a3b8; font-size: 12px; display: block; margin-bottom: 4px;">
          ${isCharacter ? 'GIF/精灵 高度 (px)' : '高度 (px)'}
        </label>
        <input type="number" id="propHeight" value="${height}" 
          style="width: 100%; padding: 8px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 4px;">
      </div>
      ${isCharacter ? `
      <div style="margin-bottom: 12px; padding: 8px; background: #0f172a; border-radius: 4px; font-size: 11px; color: #94a3b8;">
        💡 调整宽度/高度会改变角色GIF或像素图的显示尺寸
      </div>` : ''}
      <button id="applyProps" style="width: 100%; padding: 10px; background: #22d3ee; color: #0f172a; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">✓ 应用</button>
    `;
    
    document.getElementById('applyProps').onclick = () => applyProperties(el);
  }

  function hideProperties() {
    document.getElementById('propertiesPanel').style.display = 'none';
  }

  // ========== 应用属性 ==========

  function applyProperties(el) {
    const x = parseFloat(document.getElementById('propX').value);
    const y = parseFloat(document.getElementById('propY').value);
    const width = parseFloat(document.getElementById('propWidth').value);
    const height = parseFloat(document.getElementById('propHeight').value);
    
    const type = el.dataset.editable;
    
    if (type === 'character') {
      // 【修复】角色：位置设在wrapper上，大小设在sprite/img上
      el.style.left = x + '%';
      el.style.top = y + '%';
      
      const sprite = el.querySelector('.chibi-sprite');
      const img = el.querySelector('.chibi-img');
      
      if (sprite) {
        sprite.style.width = width + 'px';
        sprite.style.height = height + 'px';
      }
      if (img) {
        img.style.width = width + 'px';
        img.style.height = height + 'px';
      }
    } else {
      el.style.left = x + '%';
      el.style.top = y + '%';
      el.style.width = width + 'px';
      if (type === 'zone' || type === 'decoration') {
        el.style.height = height + 'px';
      }
    }
    
    showProperties(el);
  }

  // ========== 拖拽系统（完全重写） ==========

  function startDrag(e, el) {
    if (isResizing) return;
    e.preventDefault();
    
    isDragging = true;
    selectedElement = el;
    
    const type = el.dataset.editable;
    
    // 【修复】对带transform的元素，临时去掉transform
    const hasTransform = hasCssTransform(el);
    if (hasTransform) {
      removeTransformKeepPosition(el);
    }
    
    const rect = el.getBoundingClientRect();
    const offsetParent = el.offsetParent;
    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left - parentRect.left;
    startTop = rect.top - parentRect.top;
    
    // 视觉反馈
    el.style.cursor = 'grabbing';
    el.style.transition = 'none';
    el.style.opacity = '0.85';
    
    const dragParent = el.offsetParent; // 在闭包中缓存，保证mousemove时一致
    const dragParentRect = dragParent.getBoundingClientRect();
    
    document.onmousemove = (moveEvent) => {
      if (!isDragging) return;
      
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const newLeft = ((startLeft + dx) / dragParentRect.width) * 100;
      const newTop = ((startTop + dy) / dragParentRect.height) * 100;
      
      el.style.left = Math.max(0, Math.min(100, newLeft)) + '%';
      el.style.top = Math.max(0, Math.min(100, newTop)) + '%';
    };
    
    document.onmouseup = () => {
      isDragging = false;
      el.style.cursor = 'move';
      el.style.transition = '';
      el.style.opacity = '1';
      
      // 【修复】恢复transform（所有类型，只要有原始transform）
      if (el.dataset.originalTransform) {
        restoreTransformKeepPosition(el, el.dataset.originalTransform);
      }
      
      document.onmousemove = null;
      document.onmouseup = null;
      if (selectedElement) showProperties(selectedElement);
    };
  }

  // ========== 调整大小系统（完全重写） ==========

  function startResize(e, el) {
    e.preventDefault();
    
    isResizing = true;
    resizeCorner = e.target.dataset.corner;
    
    const type = el.dataset.editable;
    
    // 【修复】对带transform的元素，临时去掉transform
    const hasTransform = hasCssTransform(el);
    if (hasTransform) {
      removeTransformKeepPosition(el);
    }
    
    // 【修复】获取实际要调整大小的目标
    const target = getResizeTarget(el);
    const targetEl = target.element;
    
    // 保存transform信息在target上
    if (target.isCharacter) {
      const tf = hasCssTransform(targetEl);
      if (tf) {
        const pos = getPositionPct(targetEl);
        targetEl.style.transform = 'none';
        targetEl.style.left = pos.x + '%';
        targetEl.style.top = pos.y + '%';
        targetEl.dataset.savedTransform = tf;
      }
    }
    
    const rect = targetEl.getBoundingClientRect();
    const offsetParent = el.offsetParent;
    if (!offsetParent) return;
    const parentRect = offsetParent.getBoundingClientRect();
    
    startX = e.clientX;
    startY = e.clientY;
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = el.getBoundingClientRect().left - parentRect.left;
    startTop = el.getBoundingClientRect().top - parentRect.top;
    
    document.onmousemove = (moveEvent) => {
      if (!isResizing) return;
      
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const parentRect = offsetParent.getBoundingClientRect();
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;
      
      if (resizeCorner.includes('e')) {
        newWidth = Math.max(20, startWidth + dx);
      }
      if (resizeCorner.includes('w')) {
        newWidth = Math.max(20, startWidth - dx);
        newLeft = startLeft + dx;
      }
      if (resizeCorner.includes('s')) {
        newHeight = Math.max(20, startHeight + dy);
      }
      if (resizeCorner.includes('n')) {
        newHeight = Math.max(20, startHeight - dy);
        newTop = startTop + dy;
      }
      
      if (target.isCharacter) {
        // 【修复】角色：修改sprite/img的大小
        targetEl.style.width = newWidth + 'px';
        targetEl.style.height = newHeight + 'px';
        if (target.img) {
          target.img.style.width = newWidth + 'px';
          target.img.style.height = newHeight + 'px';
        }
        // 角色的位置（wrapper的left/top）不变，但调整resize时的左上偏移
        if (resizeCorner.includes('w') || resizeCorner.includes('n')) {
          el.style.left = Math.max(0, (newLeft / parentRect.width) * 100) + '%';
          el.style.top = Math.max(0, (newTop / parentRect.height) * 100) + '%';
        }
      } else {
        // 普通元素：直接修改
        targetEl.style.width = newWidth + 'px';
        targetEl.style.height = newHeight + 'px';
        if (resizeCorner.includes('w') || resizeCorner.includes('n')) {
          el.style.left = Math.max(0, (newLeft / parentRect.width) * 100) + '%';
          el.style.top = Math.max(0, (newTop / parentRect.height) * 100) + '%';
        }
      }
    };
    
    document.onmouseup = () => {
      isResizing = false;
      resizeCorner = null;
      
      // 【修复】恢复target的transform
      if (target.isCharacter && targetEl.dataset.savedTransform) {
        const rect = targetEl.getBoundingClientRect();
        const restoreParent = targetEl.offsetParent;
        if (restoreParent) {
          const restoreRect = restoreParent.getBoundingClientRect();
          const x = ((rect.left - restoreRect.left) / restoreRect.width) * 100;
          const y = ((rect.top - restoreRect.top) / restoreRect.height) * 100;
          targetEl.style.transform = targetEl.dataset.savedTransform;
          targetEl.style.left = x + '%';
          targetEl.style.top = y + '%';
        }
        delete targetEl.dataset.savedTransform;
      }
      
      // 【修复】恢复el本身的transform（所有类型，只要有原始transform）
      if (el.dataset.originalTransform) {
        restoreTransformKeepPosition(el, el.dataset.originalTransform);
      }
      
      document.onmousemove = null;
      document.onmouseup = null;
      if (selectedElement) showProperties(selectedElement);
    };
  }

  // ========== 导出配置 ==========

  function saveConfig() {
    const config = {
      decorations: [],
      zones: [],
      characters: []
    };
    
    // 收集装饰物
    document.querySelectorAll('[data-editable="decoration"]').forEach(el => {
      const pos = getPositionPct(el);
      const size = getVisualSize(el);
      config.decorations.push({
        src: el.src || '',
        x: pos.x.toFixed(1),
        y: pos.y.toFixed(1),
        width: size.width.toFixed(0),
        height: size.height.toFixed(0)
      });
    });
    
    // 收集热区
    document.querySelectorAll('[data-editable="zone"]').forEach(el => {
      const pos = getPositionPct(el);
      const offsetP = el.offsetParent;
      const parentRect = offsetP ? offsetP.getBoundingClientRect() : { width: 1, height: 1 };
      const rect = el.getBoundingClientRect();
      config.zones.push({
        zone: el.dataset.zone,
        x: pos.x.toFixed(1),
        y: pos.y.toFixed(1),
        width: ((rect.width / parentRect.width) * 100).toFixed(1),
        height: ((rect.height / parentRect.height) * 100).toFixed(1)
      });
    });
    
    // 收集角色
    document.querySelectorAll('[data-editable="character"]').forEach(el => {
      const pos = getPositionPct(el);
      const sprite = el.querySelector('.chibi-sprite');
      const img = el.querySelector('.chibi-img');
      let w = 72;
      if (img && img.style.width) {
        w = parseInt(img.style.width);
      } else if (sprite) {
        w = sprite.getBoundingClientRect().width;
      }
      config.characters.push({
        id: el.dataset.char || 'unknown',
        x: pos.x.toFixed(1),
        y: pos.y.toFixed(1),
        width: w.toFixed(0),
        state: el.dataset.state || 'idle'
      });
    });
    
    showConfigModal(JSON.stringify(config, null, 2));
  }

  // ========== 配置弹窗 ==========

  function showConfigModal(json) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: #1e293b; padding: 24px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
        <h3 style="color: #38bdf8; margin-bottom: 16px;">💾 配置已生成</h3>
        <textarea readonly style="flex: 1; width: 100%; min-height: 300px; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 4px; padding: 12px; font-family: monospace; font-size: 12px; resize: vertical;">${json}</textarea>
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button id="copyBtn" style="flex: 1; padding: 12px; background: #22d3ee; color: #0f172a; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">📋 复制</button>
          <button id="closeBtn" style="flex: 1; padding: 12px; background: #334155; color: #f8fafc; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">关闭</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('copyBtn').onclick = () => {
      navigator.clipboard.writeText(json);
      alert('配置已复制到剪贴板！');
    };
    
    document.getElementById('closeBtn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  }

  // ========== 启动 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
