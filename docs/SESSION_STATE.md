# SESSION_STATE.md

> 新窗口打开项目，**先读这份文件 + `PROJECT_MAP.md`**，别的文件按需读，不要通读。

---

## 当前项目状态

**v1.0 — 已部署上线。**

部署地址：https://zxletrengy-commits.github.io/memories_miao/
仓库：`git@github.com:zxletrengy-commits/memories_miao.git`
分支：`master`

## 记忆索引

墨墨的个人记忆存在 `C:\Users\ZZX\.claude\projects\D--A-memories\memory\`，跨窗口持久化。每次新会话应先读 MEMORY.md 索引。**另有一份 1.0 上线日全记录**：[[1.0-shipping-day]]

---

## 1.0 功能总览

### 回忆碎片上传弹窗（新增）
- 点 Memory Archive 任意条目 → 弹窗内可上传文件（PNG/JPG/GIF/MP4/WebM）
- 「专属语音」和 🎵 开头的音乐项只接 MP3
- 上传后 prompt 取标题 → 折叠成一粒玻璃小药丸，标题显示在药丸上
- 点药丸 → 弹窗内预览（不跳新标签），点 × → 确认删除
- 数据存 localStorage，key 格式 `frag-{角色}-{条目标题}`，刷新不丢
- 祁煜页弹窗标题和上传按钮换了蔷薇粉色（`#E8A8C0` / `rgba(235,195,215,...)`）
- 手机端响应式已适配

### 相册 & 日记占位弹窗（新增）
- cafe.html 新增 `#placeholderOverlay` 弹窗
- `UIManager.js` 新增 `showPlaceholder()` / `closePlaceholder()`
- 相册：「📷 光已经进去了。只是还没显影——啪嗒，啪嗒——再等等。」
- 日记：「📖 纸在等第一滴墨。笔也在等。……然后它们一起看向了你。」
- 版本号 `UIManager.js?v=20260714`

### 飘落花瓣（新增）
- **黎深页** — 茉莉花 SVG（五瓣奶油白，4 种角度但已废弃 → 统一为一款全开正面），9 朵。16~32px 随机大小。左右各 3，中间 3 从卡片背后穿过。约 1/3 在下落中轻轻自转。`z-index: 50`（两侧） / `z-index: 2`（背后）
- **祁煜页** — 螺旋贝壳 SVG（姐姐选的图标改蔷薇粉），同分布规则
- 初始化入口：`script.js` → `initPetals()`，按 `data-character` 分流
- `.scaled-page` 已加 `position: relative; z-index: 3` 确保卡片在背后花瓣之上

### 细节微调
- 「点击翻开档案」：字号 13px，呼吸闪烁 2.8s 循环
- 头像上传锚点收窄：只有 `.anchor-thumb-avatar` 圆圈可点
- 手机端弹窗内边距、字号、药丸、预览媒体均已缩放适配

---

## 下一步（未完成）

- 祁煜飘落贝壳还没调整好（当前的螺旋贝壳姐姐没确认最终效果）
- 编辑器保存配置 → 自动写回 `characters.json`
- 【待观察】顶部栏与场景衔接处色差线

---

## 快速定位指南

| 找什么 | 在哪里 |
|---|---|
| 角色数据/坐标 | `data/characters.json` / `data/characters-inline.js` |
| 热区/拖拽 | `cafe.html` `.drop-zone` + `style.css` |
| 角色渲染 | `core/managers/CharacterManager.js` |
| 对话气泡 | `UIManager.showBubble` + `style.css` `.dialogue-bubble` |
| 功能图标 | `UIManager.toggleIcons` + `style.css` `.action-icons` |
| 占位弹窗 | `UIManager.showPlaceholder` + `cafe.html` `#placeholderOverlay` |
| 回忆碎片上传 | `script.js` `openFragment` / `handleFragUpload` / `renderFragPills` |
| 飘落花瓣 | `script.js` `initPetals` + `style.css` `.falling-petal` |
| 歌单/音乐 | `script.js` `_musicInit()` / `toggleMusic()` / `UIManager.togglePlaylist()` |
| select 页 | `select.html` |
| memory 页卡片 | `.card-glass` / `.card-text-overlay` |
| 编辑模式入口 | 按 `E` 键 |
| Chat Tool | `D:\A\chat-tool\`（Flask 端口 5000） |
| 静态服务器 | `python -m http.server 8080` |
