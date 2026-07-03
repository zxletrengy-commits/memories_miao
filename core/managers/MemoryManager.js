/**
 * MemoryManager.js
 * 职责：管理回忆碎片数据、弹窗展示
 * 预留扩展：未来可以加载 data/memories.json，管理解锁状态等。
 * 不知道角色渲染，不知道场景背景。
 */

const MemoryManager = {
  _fragments: {},   // 已加载的回忆碎片，按角色 key 存储

  // ---------- 初始化（预留，目前内容在各自 HTML 页面里） ----------
  init() {
    // 未来可以在这里 fetch('data/memories.json')
  },

  // ---------- 回忆碎片弹窗（兼容现有 HTML 页面里的调用） ----------
  openFragment(el) {
    const overlay = document.getElementById('fragOverlay');
    if (!overlay) return;
    overlay.querySelector('.modal-title').textContent = el.dataset.title || '';
    overlay.querySelector('.modal-text').textContent  = el.dataset.text  || '';
    overlay.classList.add('show');
  },

  closeFragment() {
    const overlay = document.getElementById('fragOverlay');
    if (overlay) overlay.classList.remove('show');
  },

  // ---------- 导航到回忆页（通过 World 记录当前角色） ----------
  goToMemory(charKey) {
    World.setScene('memory-' + charKey);
    goTo('memory-' + charKey + '.html');
  }
};
