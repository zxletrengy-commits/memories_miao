\# Beyond the Stars - AI Developer Guide



\## Project



Beyond the Stars is a private interactive memory museum.



Goal:

\- immersive

\- peaceful

\- nostalgic



Not:

\- commercial game

\- public remake



\---



\## Architecture



World-driven architecture.



Managers:



\- SceneManager

\- CharacterManager

\- UIManager

\- MemoryManager



Rules:



\- Managers communicate only through World.

\- One responsibility per manager.

\- No hardcoded character data.

\- Load data from /data.

\- init() required.

\- destroy() required.

\- update() optional.



\---



\## Development Rules



\- Never break existing features.

\- Refactor only after migration.

\- Configuration over hardcode.

\- Preserve UX before architecture.

\- Do not redesign without approval.



\## AI Working Style



\- Read PROJECT\_GUIDE.md, PROJECT\_MAP.md, SESSION\_STATE.md before major changes.

\- Explain the plan before modifying multiple files.

\- Prefer small fixes over rewrites.

\- Never redesign existing systems without approval.

\- Keep changes compatible with current architecture.

