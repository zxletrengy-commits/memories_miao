/**
 * world.js — 全局状态中枢
 * 所有 Manager 通过这里读写状态，互不直接调用。
 */

const World = {
  // 当前场景 ID，例如 'cafe' | 'select' | 'memory-qiyu'
  currentScene: null,

  // 当前选中的角色 key 列表，例如 ['qiyu'] 或 ['qiyu', 'lishen']
  selectedCharacters: [],

  // 当前时段：'day' | 'dusk' | 'night'
  currentTime: 'day',

  // 天气（预留扩展）：'clear' | 'rain' | 'snow'
  weather: 'clear',

  // UI 状态
  uiState: {
    musicOn: true,
    activeCharKey: null,    // 当前展开图标的角色
    isDragging: false       // 是否正在拖拽
  },

  // ---------- 监听器系统（简易事件总线） ----------
  _listeners: {},

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  },

  emit(event, payload) {
    (this._listeners[event] || []).forEach(cb => cb(payload));
  },

  // ---------- 状态更新方法 ----------

  setScene(sceneId) {
    this.currentScene = sceneId;
    this.emit('sceneChange', sceneId);
  },

  setSelectedCharacters(keys) {
    this.selectedCharacters = keys;
    this.emit('selectedCharactersChange', keys);
  },

  setCurrentTime(tod) {
    this.currentTime = tod;
    this.emit('timeChange', tod);
  },

  setWeather(weather) {
    this.weather = weather;
    this.emit('weatherChange', weather);
  },

  setUIState(patch) {
    Object.assign(this.uiState, patch);
    this.emit('uiStateChange', this.uiState);
  }
};
