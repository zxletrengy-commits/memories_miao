# SESSION_STATE.md

> 新窗口打开项目，**先读这份文件 + `PROJECT_MAP.md`**，别的文件按需读，不要通读。

---

## 当前项目状态

**能跑，双角色全功能正常。**

## 记忆索引

墨墨的个人记忆存在 `C:\Users\ZZX\.claude\projects\D--A-memories\memory\`，跨窗口持久化。每次新会话应读取 MEMORY.md 索引。

---

## 最近做了什么（按时间倒序）

### 2026-07-13：喵喵屋留声机歌单 + 全局音乐重构

**歌单弹窗（cafe.html + style.css + UIManager.js）：**
- 点 ♪ 弹出歌单面板，再点关闭。点击空白处也可关闭
- 白天奶油玻璃暖色系 + 夜间冷蓝玻璃（双模式自动切换）
- 顶部双行标题：「喵咪留声机」/ Daylight's Playlist（白天）或 Tonight's Playlist（夜间）
- 歌曲列表嵌卡背景（灰调半透明 + blur + 边框）
- 当前播放行高亮：暖杏/深蓝实底 + 香槟/冰蓝边框 + inset 高光
- 装饰元素：琥珀金线 + ✦ + 香槟金/月光银蓝双模式 + 10 粒漂浮粒子
- 左侧 1px 竖条胶囊（当前播放）、hover 左侧出现 ✦、右侧发光播放点
- 自定义滚动条（暖金/冰蓝，4px）
- 点击正在播放的曲目 → 暂停；点击其他曲目 → 切歌
- 弹窗打开自动定位到当前曲目

**音乐系统重构（script.js）：**
- 全局 `_musicInit()` 自动启动，所有页面共用
- 喵喵屋 `window._musicTracks` 全曲库随机（120+ 首）
- select 页专属曲单：深空序曲、恋与光年、时空引力
- 黎深 memory 专属曲单：黎明深雪、霜天雪霁、冷调交熔
- 祁煜 memory 专属曲单：海的最深处、鲸歌载梦、绮境幻想
- `_musicPickRandom()` 优先读 `window._pageTracks`，无则用全曲库
- ♪ 按钮 ON/OFF 标签自动同步播放状态

**其他：**
- 时段标签改为「暖阳·薄暮·星夜」
- 英文副标按时段切换（Daylight's / Tonight's Playlist）
- BACK 按钮智能记忆咖啡馆 char 参数
- 全屏按钮跨页优化 + 记忆页圆形全屏按钮
- `.gitignore` 忽略 `assets/music/`
- Chat Tool 视觉模型升级到 Qwen3-VL-32B

### 2026-07-13（晚间）：夜间播放列表视觉打磨

- **面板底色** 偏紫 `rgba(26,30,46,.60)` + 毛玻璃 `blur(22px) saturate(120%)`
- **顶部月光渐变** `::before` `linear-gradient(180deg, rgba(175,190,255,.10), transparent 40%)`
- **滚动条** 滑块降亮 `rgba(170,185,255,.28)` / hover `.55`
- **漂浮粒子** 改冷白蓝 `#DDE5FF`，1/2/3px 三档，每粒独立 opacity `.15~.35`
- **音浪条动画** 替代右侧圆点 — 三帧 SVG `steps(1)` 轮播，底部对齐；暂停消失
- 时段切换定时器现在也会更新歌单英文副标

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
