/**
 * characters-inline.js
 * Inline character data for file:// protocol fallback.
 * This is the same data as characters.json but as a JS object.
 */
const CHARACTER_DATA = {
  "qiyu": {
    "id": "qiyu",
    "displayName": "祁煜",
    "displayNameEn": "Rafayel",
    "color": "#6ba3a0",
    "assetPath": "assets/cafe_alot/qiyu/",
    "spriteType": "gif",
    "availableStates": {
      "sleep": { "label": "休息中", "options": [
        { "img": "Startled.gif", "widthPct": 20, "pos": { "x": 36.4, "y": 32.6 } },
        { "img": "Eat.gif",      "widthPct": 18, "pos": { "x": 33.8, "y": 31.2 } }
      ]},
      "plant": { "label": "玩耍中", "options": [
        { "img": "Wuwuu.gif",    "widthPct": 14, "pos": { "x": 64.4, "y": 50.3 } }
      ]},
      "clean": { "label": "清洁中", "options": [
        { "img": "Sway.gif",     "widthPct": 17, "pos": { "x": 34.7, "y": 55.4 } },
        { "img": "Walk.gif",     "widthPct": 13, "pos": { "x": 35.6, "y": 53.4 } }
      ]},
      "relax": { "label": "放松中", "options": [
        { "img": "Drawing.gif",  "widthPct": 16, "pos": { "x": 37.8, "y": 74.3 } },
        { "img": "angry.gif",    "widthPct": 16, "pos": { "x": 38.7, "y": 75.1 } }
      ]},
      "lobby": { "label": "接待中", "options": [
        { "img": "Standby.gif",  "widthPct": 15, "pos": { "x": 57.2, "y": 91.0 } }
      ]}
    },
    "preferredZones": ["sleep", "plant", "clean", "relax", "lobby"],
    "dragGifs": { "left": "left.gif", "center": "Followme.gif", "right": "right.gif", "widthPct": 20, "sideWidthPct": 18 },
    "dialoguePool": [
      "你终于来了…我等了好久。",
      "今天海风很舒服，你感觉到了吗？",
      "想听我哼首歌吗？",
      "这幅画，还差一笔——你。",
      "喂，别一直盯着我看啊。",
      "这里的咖啡…没你泡的好喝。",
      "下次一起去海边吧？",
      "你身上有阳光的味道。"
    ]
  },
  "lishen": {
    "id": "lishen",
    "displayName": "黎深",
    "displayNameEn": "Zayne",
    "color": "#7b8db3",
    "assetPath": "assets/cafe_alot/lishen/",
    "spriteType": "gif",
    "availableStates": {
      "sleep": { "label": "休息中", "options": [
        { "img": "Sleep.gif",   "widthPct": 14, "pos": { "x": 50.9, "y": 25.6 } },
        { "img": "Makebed.gif", "widthPct": 17, "pos": { "x": 50.8, "y": 30.6 } }
      ]},
      "plant": { "label": "玩耍中", "options": [
        { "img": "Idle.gif",    "widthPct": 15, "pos": { "x": 61.8, "y": 64.5 } }
      ]},
      "clean": { "label": "清洁中", "options": [
        { "img": "Miss.gif",    "widthPct": 16, "pos": { "x": 35.7, "y": 53.9 } },
        { "img": "Groom.gif",   "widthPct": 15, "pos": { "x": 36.2, "y": 53.7 } }
      ]},
      "relax": { "label": "放松中", "options": [
        { "img": "Walk.gif",    "widthPct": 15, "pos": { "x": 50.3, "y": 71.1 } },
        { "img": "Tea.gif",     "widthPct": 19, "pos": { "x": 44.6, "y": 68.2 } }
      ]},
      "lobby": { "label": "接待中", "options": [
        { "img": "Nap.gif",     "widthPct": 15, "pos": { "x": 44.4, "y": 90.6 } }
      ]}
    },
    "preferredZones": ["sleep", "plant", "clean", "relax", "lobby"],
    "dragGifs": { "left": "LeftDrag.gif", "center": "Dance.gif", "right": "RightDrag.gif", "widthPct": 18, "sideWidthPct": 21 },
    "dialoguePool": [
      "你来了。今天还顺利吗？",
      "咖啡要凉了。",
      "外面下雪了…靠近一点吧。",
      "别太累，休息一下。",
      "我在看你的消息。每一条。",
      "想听听我今天遇到的事吗？",
      "这份报告…算了，晚点再写。",
      "和你在一起的时间，总是过得太快。"
    ]
  }
};
