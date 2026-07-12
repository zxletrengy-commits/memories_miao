# SESSION_STATE.md

> 新窗口打开项目，**先读这份文件 + `PROJECT_MAP.md`**，别的文件按需读，不要通读。

---

## 当前项目状态

**能跑，双角色全功能正常。**

## 记忆索引

墨墨的个人记忆存在 `C:\Users\ZZX\.claude\projects\D--A-memories\memory\`，跨窗口持久化。每次新会话应读取 MEMORY.md 索引。

## 最近做了什么（按时间顺序）

1. **memory 页玻璃收藏档案卡重设计（2026-07-12）**
   - 祁煜/黎深页全新玻璃质感人物卡片（440×710px 桌面端，240px 手机端）
   - 星云背景 + 多层边框 + SVG 四角星 + 粒子光尘
   - 文字左对齐布局：中文名 58px 思源宋体 + 英文名 + 居中双行格言
   - 分角色配色 — 祁煜蔷薇粉 `#FFF0F3` + 淡粉发光，黎深冰雪蓝 `#E8F4FD` + 冰蓝发光
   - 碎片卡片圆角改为左上+右下圆，左下+右上直角
   - 卡片底部装饰线：直线 + ✦ + 直线
   - 新增立绘 `assets/thing/Li 1.png` 和 `Qi 1.png`
   - CSS 新增约 380 行（`.card-glass` 全套 + 手机自适应）

2. **2026-07-11 终端整理**
   - 砍掉 psmux，WSL tmux 也退役，回归极简 Git Bash + Oh My Posh
   - Oh My Posh 配色：文字 `⟩` 串联纯色风格（非 powerline）
   - PowerShell 也配了同款（`Microsoft.PowerShell_profile.ps1`）
   - 删除了 `~/bin/tmux`、`~/.tmux.conf`、`editor.html.bak` 等遗留文件

3. **cafe 页 BGM 多曲随机播放**
   - `UIManager.js` 新增 `_pickRandomTrack()` 和 `_playNextTrack()`
   - `cafe.html` BGM 源切为空，音乐列表挂在 `window._musicTracks`
   - ⚠️ 实际 mp3 文件（`assets/music/track1~5.mp3`）还未下载

1. **select 页 PC 端内容偏上修复**
   - 在 `@media (min-width: 601px)` 中给 `.select-scene` 加 `padding-top: 60px`
   - 手机端不受影响

2. **cafe 页顶栏时间框夜间亮色**
   - 新增 `.cafe-body.topbar-night .top-bar-time` 和 `strong` 夜间样式
   - 夜间时间数字和标签自动变为浅米白色，与按钮风格一致
   - 背景/边框也同步变暗半透明

3. **对话框样式翻新（第二版）**
   - 奶油白实底 `#FFF8F0` + 波点纹理（`radial-gradient` 浅米圆点）
   - 边框：`2px solid #D3A07A`（暖浅棕），圆角 20px
   - 文字：`#664F46` 深棕褐，字号 15px
   - 内边距：均匀 `12px 16px`
   - 尾巴：居中朝下，指向人物头顶
   - 字体：PingFang SC 优先
   - 右下角 Iconfont 猫爪水印（单爪，20%透明度，-45°旋转）

4. **对话文本去句号**
   - 所有单句末尾 `。` 删除
   - 中间断句的 `。` 改为 `…`
   - 问号 `？` 保留
   - `characters.json` 和 `characters-inline.js` 已同步

5. **行为准则**
   - 只修 bug 加小结构，不重构除非有明确指令（见 `MEMORY.md`）

6. **Chat Tool 识图工具搭建**
   - 位置：`D:\A\chat-tool\`
   - 前端：微信风聊天界面，支持截图粘贴/拖拽上传
   - 后端：Flask 双引擎路由——纯文本走 DeepSeek V4 Pro，含图片走 SiliconFlow Qwen3-VL-8B（免费）
   - 保存每次对话到 `_last_response.json`，供 Claude 读取分析结果
   - 用于辅助 memories 项目的 UI 视觉设计参考

7. **安装 Anthropic Skills**
   - 在 `.claude/skills/` 添加了 4 个 skill：`frontend-design`、`theme-factory`、`canvas-design`、`algorithmic-art`

8. **黄昏时段调整**
   - 黄昏从 `16:00~18:59` 改为 `17:00~19:59`

9. **功能图标改造（大改）**
   - 图标从顶部横排改为**弧形侧边排列**，自动识别 chibi 左右空间切换方向
   - 图标层级提升到气泡之上（`z-index: 55`）
   - 点击时当前 chibi 提到最前（`z-index: 100`）
   - 三个操作图标替换为 Iconfont 原版 SVG：
     - ❄️ 黎深·回忆 → 晶体雪花
     - 🐟 祁煜·回忆 → 小鱼
     - 🖼 相册 → 风景相框
     - 📖 日记 → 书本
   - 图标按钮颜色改为暖白底暖棕边，适配喵喵屋风格

10. **黎深拖拽大小调优**
    - 中间 18%、左右 20%

11. **气泡猫爪水印**
    - 从 Iconfont 获取猫爪 SVG，右下角单爪水印（20%透明度，-45°旋转）
    - 波点纹理保留不变

## 下一步要做的事（未完成）

### 【待观察】顶部栏与场景衔接处色差线
- 顶部栏底部与场景背景之间有一条细微的视觉"线"
- 尝试过：叠加层渐变淡出（回退）、移除 `overflow:hidden` 让模糊延伸（回退）、新增场景模糊过渡层 `scene-blur-bridge`（回退）
- 待用户想好描述后再继续

## 已知未解决/待观察的小问题

- `UIManager.toggleMusic()` 和 `script.js` 全局 `toggleMusic()` 并存，行为一致但没统一，暂不影响功能
- 编辑器保存的配置目前需要手动转达，还没做自动写回 `characters.json` 的功能
- 顶部栏底部与场景之间有细微色差线，待处理

## 快速定位指南

- 角色状态/坐标 → `data/characters.json` 或 `data/characters-inline.js`（两个要同步改）
- 热区位置/大小 → `cafe.html` 里的 `.drop-zone` 元素 + `style.css`
- 角色渲染逻辑 → `core/managers/CharacterManager.js`
- 拖拽逻辑 → `CharacterManager._onDrag` / `_endDrag`
- 对话气泡定位/样式 → `UIManager.showBubble` + `style.css` 的 `.dialogue-bubble` 系列
- 功能图标弧形排列 → `UIManager.toggleIcons` + `style.css` 的 `.action-icons` 系列
- 顶栏时间/背景 → `SceneManager.js` + `style.css` 的 `.cafe-top-bar` / `.top-bar-time`
- select 页 → `select.html` + `style.css` 的 `.select-scene` / `.scene-choices`
- 编辑模式入口 → 按 `E` 键（按钮已隐藏但系统保留）
