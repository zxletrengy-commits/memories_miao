# SESSION_STATE.md

> 新窗口打开项目，**先读这份文件 + `PROJECT_MAP.md`**，别的文件按需读，不要通读。

---

## 当前项目状态

**能跑，双角色全功能正常。**

## 记忆索引

墨墨的个人记忆存在 `C:\Users\ZZX\.claude\projects\D--A-memories\memory\`，跨窗口持久化。每次新会话应读取 MEMORY.md 索引。

---

## 最近做了什么（按时间倒序）

### 2026-07-13：喵喵屋留声机歌单 + 全局音乐重构 + 夜间视觉打磨 + Memory卡片质感提升

- 点 ♪ 弹出歌单面板，白天暖色 / 夜间冷蓝双模式自动切换
- 歌单标题「喵咪留声机」+ 英文副标按时段切换
- 装饰金线 + ✦ + 10 粒冷蓝星光粒子 + 顶部淡月光渐变
- 当前播放行高亮 + 左侧竖条胶囊 + 右侧音浪条三帧 SVG 动画（暂停消失）
- 全局 `_musicInit()` 自动启动，全曲库随机（120+ 首）
- select / 黎深 / 祁煜 memory 页各有专属曲单
- ♪ 按钮 ON/OFF 标签自动同步
- **Memory 卡片**：顶部高光玻璃反光 + 多层边框（白描边→蓝紫→柔白光圈→外发光）
- 卡片 10s 漂浮动画，hover 暂停
- 左上四角星旁三粒多边形晶屑（四边形/三角/菱形），向右下散开各自闪烁
- 立绘底部渐暗遮罩，黎深白大褂不再吃掉白色文字
- 记忆页按钮统一为深蓝玻璃材质（backdrop-filter blur(18px)）
- **碎片卡片**：月光渐变玻璃块 + 顶边高光 + 淡白描边 + hover 轻浮
- 记忆页按钮统一为深蓝玻璃材质（backdrop-filter blur(18px)）

### 2026-07-12：Memory 页玻璃收藏档案卡重设计

- 祁煜/黎深页全新玻璃质感人物卡片（440×710px 桌面端，240px 手机端）
- 星云背景 + 多层边框 + SVG 四角星 + 粒子光尘 + 边缘星尘亮芒
- 文字左对齐布局：中文名 58px 思源宋体 + 英文名 + 居中双行格言
- 分角色配色 — 祁煜蔷薇粉 `#FFF0F3` + 淡粉发光，黎深冰雪蓝 `#E8F4FD` + 冰蓝发光
- 卡片底部装饰线 + 碎片缩小 + 四圆角
- 新增立绘 `assets/thing/Li 1.png` / `Qi 1.png`

---

## 下一步要做的事（未完成）

- 【待观察】顶部栏与场景衔接处色差线
- 编辑器保存配置→自动写回 `characters.json`（目前需手动转达）

---

## 快速定位指南

- 角色状态/坐标 → `data/characters.json` 或 `data/characters-inline.js`
- 热区位置/大小 → `cafe.html` `.drop-zone` + `style.css`
- 角色渲染 → `core/managers/CharacterManager.js`
- 对话气泡 → `UIManager.showBubble` + `style.css` `.dialogue-bubble`
- 功能图标 → `UIManager.toggleIcons` + `style.css` `.action-icons`
- 顶栏时间/背景 → `SceneManager.js` + `style.css` `.cafe-top-bar` / `.top-bar-time`
- 歌单弹窗 → `UIManager.js` `togglePlaylist()` + `style.css` `.playlist-*`
- 音乐系统 → `script.js` `_musicInit()` / `toggleMusic()` / `_musicPlayTrack()`
- 曲目列表 → `cafe.html` `<script>window._musicTracks`
- 页面专属曲单 → 各 HTML 的 `<script>window._pageTracks`
- select 页 → `select.html` + `style.css` `.select-scene` / `.scene-choices`
- memory 页卡片 → `.card-glass` / `.card-text-overlay` 系列
- 编辑模式入口 → 按 `E` 键
- Chat Tool → `D:\A\chat-tool\`（Flask 端口 5000）
- 静态服务器 → `python -m http.server 8080`（手机访问）
