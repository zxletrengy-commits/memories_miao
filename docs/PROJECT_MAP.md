# Project Map (技术现状速查)

本文件跟 PROJECT_RULE / ARCHITECTURE_RULE / DEVELOPMENT_RULE 不重复。
那三份是"规矩"，这份是"地图"——记录当前代码里实际有什么，方便快速定位，
减少每次改动都要整篇重读文件的成本。

维护原则：改了代码顺手更新这里对应的条目，不需要单独起一轮任务来维护。

---

## 1. 文件总览

| 文件 | 职责 | 备注 |
|---|---|---|
| `index.html` | 首页/加载入口 | 用 `script.js` 的星空、翻转卡片、进度条 |
| `loading.html` | 加载动画页 | 同上 |
| `select.html` | 角色选择页 | 点击后 `goTo('cafe.html?char=qiyu/lishen')` |
| `cafe.html` | 喵喵屋主页面 | World架构的加载入口，见第3节脚本顺序 |
| `memory-qiyu.html` / `memory-lishen.html` | 回忆相册页 | 只依赖 `script.js` |
| `script.js` | **全局通用函数**，所有页面共用 | 星空/加载条/翻转卡片/`goTo`/`openFragment`/`initMusic`/`toggleMusic` |
| `style.css` | 全站样式 | 约700行，喵喵屋相关样式集中在文件后半段 |
| `editor-mode.js` | 喵喵屋可视化编辑器 | 按 `E` 键或点右上角"编辑"按钮开启，用于调整热区/角色/装饰位置 |
| `editor.html.bak` | 废弃的独立编辑器页面 | 已停用，保留备份 |

## 2. `/core` 架构（仅 cafe.html 使用）

| 文件 | 职责 | 绝不做的事 |
|---|---|---|
| `core/world.js` | 全局状态 + 事件总线（`World.emit/on`），持有 `currentScene`/`selectedCharacters`/`currentTime`/`weather`/`uiState` | 不包含业务逻辑 |
| `core/managers/SceneManager.js` | 背景、时段判断、太阳光晕、浮尘、时间显示 | 不知道角色是谁 |
| `core/managers/CharacterManager.js` | 角色生成、拖拽、状态切换、热区判定、自动切换定时器 | 不直接操作UI气泡/图标 |
| `core/managers/CharacterPixel.js` | 黎深的像素画生成（canvas绘制） | 只负责画像素图 |
| `core/managers/UIManager.js` | 对话气泡、操作图标（相册/日记）、音乐UI | 不知道角色数据结构细节 |
| `core/managers/MemoryManager.js` | 回忆碎片弹窗（预留扩展，包装 `script.js` 里的 `openFragment/closeFragment`） | — |

Manager 之间只通过 `World.emit/on` 通信，不互相直接调用（见 ARCHITECTURE_RULE.md）。

## 3. `cafe.html` 脚本加载顺序（重要，别改乱）

```
script.js                              ← 全局工具，必须最先
data/characters-inline.js              ← fetch失败时的兜底数据（见坑1）
core/world.js
core/managers/SceneManager.js
core/managers/UIManager.js
core/managers/MemoryManager.js
core/managers/CharacterPixel.js        ← 必须在 CharacterManager 之前
core/managers/CharacterManager.js
editor-mode.js
(inline script) 初始化各Manager.init()
```

## 4. 角色数据结构

数据源：`data/characters.json`（正式）+ `data/characters-inline.js`（fetch失败兜底，内容需保持同步）

每个角色字段：
```
id              → "qiyu" | "lishen"
displayName     → 显示名
assetPath       → 素材文件夹路径前缀
renderType      → "gif" (祁煜) | "pixel" (黎深，用 CharacterPixel 画)
availableStates → 状态列表，每个状态包含 img/pos/label
preferredZones  → 该角色在哪些热区可用
dialoguePool    → 点击时随机弹出的对话文本
```

## 5. 热区与状态映射（五个热区，两角色共用热区位置，各自独立状态）

| 热区 | 位置（图中） | 祁煜状态/GIF | 黎深状态 |
|---|---|---|---|
| 休息区 sleep | 左上米黄猫窝 | 打盹.gif | sleep |
| 娱乐区 plant | 右上猫爬架 | 呜呜呜.gif | plant |
| 清洁区 clean | 左下淋浴头 | 来咯.gif | clean(悠闲) |
| 放松区 relax | 门口招牌旁 | 有了.gif | coffee |
| 接待区 lobby | 底部排排坐贴图 | 打盹.gif | coffee |

拖拽中动画（祁煜专属，按鼠标X位置切换）：
- 屏幕左1/3 → 左拎猫猫.gif
- 屏幕中1/3 → 求关注.gif
- 屏幕右1/3 → 右拎猫猫.gif

映射关系写在 `CharacterManager.js` 的 `_ZONE_STATE_MAP`。

## 6. 关键 CSS 类名速查（`style.css`）

| 类名 | 作用 |
|---|---|
| `.cafe-scene` | 场景根容器，`position: relative`，是所有绝对定位子元素的基准 |
| `.char-layer` | 角色层容器，`position: absolute; inset:0; z-index:5`，`pointer-events:none`（角色本身 `pointer-events:auto`） |
| `.chibi-sprite` | 单个角色的定位包裹层（绝对定位，控制x/y） |
| `.chibi-img` | 祁煜GIF的实际img标签，固定 `width:120px` 覆盖默认限制 |
| `.drop-zone` | 热区容器，拖拽时显示虚线边框 |
| `.drop-zone.highlight-valid` | 拖到某热区范围内时的白边高亮效果 |
| `.lobby-decoration` | 底部接待区PNG装饰层 |
| `.bg-video-layer` | 白天背景视频层，`object-fit: contain`(桌面)/`cover`(手机，`@media max-width:600px`) |
| `.bg-image-layer` | 黄昏/夜晚静态背景图层 |

## 7. 已知的坑

1. **`fetch()` 在 `file://` 协议下会因CORS失败**——本地直接双击打开html时 `fetch('data/characters.json')` 会静默失败。已加 `try/catch` 兜底读取全局变量 `CHARACTER_DATA`（来自 `data/characters-inline.js`）。**改了 `characters.json` 记得同步改 `characters-inline.js`**，否则本地打开和部署后行为不一致。
2. **大文件用 `write_file` 整体重写容易被截断**——超过一定长度的文件（如曾经的 `CharacterManager.js`）分段写或用 `edit_file` 做局部替换，不要整篇 `write_file`。
3. **音乐初始化有两套入口**——`script.js` 的全局 `initMusic()`（所有页面走）+ `UIManager.initMusic()`（仅cafe页，World-aware）。两者是幂等的，不会冲突，但如果以后改音乐逻辑要两边都看一下。
4. **`editor-mode.js` 是开发工具，不是产品功能**——正式发布前应确认是否需要移除引用（目前保留中，方便小梓继续调位置）。

## 8. 修改前速查清单

- 改背景/时段/光效 → `SceneManager.js`
- 改角色位置/拖拽/状态切换 → `CharacterManager.js` + `characters.json`（记得同步 `characters-inline.js`）
- 改气泡文案/图标 → `UIManager.js` + `characters.json` 的 `dialoguePool`
- 改热区位置/大小 → `cafe.html` 里的 `.drop-zone` div + 用编辑模式（按`E`）可视化调
- 改视觉样式（颜色/大小/间距） → `style.css`，先用搜索定位类名，不整篇读
- 加新角色 → 只改 `characters.json`+素材文件夹，理论上不用改Manager代码（若需要改代码说明架构有耦合，需检查）
