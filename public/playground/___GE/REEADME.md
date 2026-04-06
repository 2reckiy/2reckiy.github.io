Here is the **Master Implementation**. This single file contains the complete, refined architecture we've built, including the `GameEngine`, `EntityManager`, `Grid`, and `Cell` systems, all optimized for modular game development.

Save this as `engine.js` or keep it as a reference for your next session.

---

### 🏛️ The Master Engine File

```javascript
/**
 * GEMINI GAME ENGINE (PROTOTYPE)
 * Key Features:
 * - Decoupled Event Bus (Broadcasting)
 * - Fixed-step Delta Time (FPS Capping)
 * - Auto-centering & Scale-to-Fit Canvas
 * - Late-Join Entity Initialization
 * - Spatial Grid with Data Persistence
 */

class Cell {
  constructor(col, row, x, y, size) {
    this.col = col;
    this.row = row;
    this.x = x; // Includes Grid Offset
    this.y = y; // Includes Grid Offset
    this.size = size;
    this.data = {}; // Custom state (e.g., cell type, value, entity ref)
    this.isHovered = false;
  }
}

class EntityManager {
  constructor() {
    this.entities = [];
    this.lastW = 0;
    this.lastH = 0;
    this._needsSort = false;
  }

  add(entity, zIndex = 0) {
    entity.zIndex = zIndex;
    this.entities.push(entity);
    this._needsSort = true;
    // Initialize entity immediately if manager already has dimensions
    if (typeof entity.onResize === "function" && this.lastW > 0) {
      entity.onResize(this.lastW, this.lastH);
    }
    return entity;
  }

  broadcast(eventName, data) {
    for (const ent of this.entities) {
      if (typeof ent[eventName] === "function") ent[eventName](data);
    }
  }

  update(dt) {
    if (this._needsSort) {
      this.entities.sort((a, b) => a.zIndex - b.zIndex);
      this._needsSort = false;
    }
    for (const ent of this.entities) if (ent.update) ent.update(dt);
  }

  draw(ctx) {
    for (const ent of this.entities) if (ent.draw) ent.draw(ctx);
  }
}

class GameEngine {
  constructor(userSettings = {}) {
    this.settings = {
      canvasId: "gameCanvas",
      width: 800,
      height: 600,
      fullScreen: false,
      centered: true,
      scaleToFit: true,
      fpsCap: 60,
      timeScale: 1.0,
      paused: false,
      clearColor: "#000",
      ...userSettings,
    };

    this.canvas = document.getElementById(this.settings.canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.manager = new EntityManager();
    this.lastTime = performance.now();

    this.init();
  }

  init() {
    window.addEventListener("resize", () => this.resize());
    this.setupInput();
    this.resize();
    requestAnimationFrame((t) => this.loop(t));
  }

  setupInput() {
    const dispatchMouse = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const sx = this.canvas.width / rect.width;
      const sy = this.canvas.height / rect.height;
      this.manager.broadcast("onMouseMove", {
        x: (e.clientX - rect.left) * sx,
        y: (e.clientY - rect.top) * sy,
      });
    };
    window.addEventListener("mousemove", dispatchMouse);
    window.addEventListener("mousedown", () =>
      this.manager.broadcast("onMouseDown"),
    );
    window.addEventListener("keydown", (e) =>
      this.manager.broadcast("onKeyDown", e.code),
    );
  }

  resize() {
    const s = this.settings;
    const w = s.fullScreen ? window.innerWidth : s.width;
    const h = s.fullScreen ? window.innerHeight : s.height;

    this.canvas.width = w;
    this.canvas.height = h;

    if (s.centered) {
      Object.assign(this.canvas.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        transformOrigin: "center",
        transform: `translate(-50%, -50%) ${s.scaleToFit ? this.getScale(w, h) : ""}`,
      });
    }

    this.manager.onResize(w, h);
  }

  getScale(w, h) {
    const scale = Math.min(window.innerWidth / w, window.innerHeight / h, 1);
    return `scale(${scale})`;
  }

  loop(now) {
    const delta = (now - this.lastTime) / 1000;
    const interval = 1 / this.settings.fpsCap;

    if (delta >= interval) {
      this.lastTime = now - (delta % interval);
      const dt = this.settings.paused ? 0 : delta * this.settings.timeScale;

      this.ctx.fillStyle = this.settings.clearColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.manager.update(dt);
      this.manager.draw(this.ctx);
    }
    requestAnimationFrame((t) => this.loop(t));
  }
}
```

### 📏 The Centered Grid Class (Logic Demo)

```javascript
class Grid {
  constructor(cellSize = 40, cols = 10, rows = 10) {
    this.config = { cellSize, cols, rows };
    this.cells = [];
    this.offsetX = 0;
    this.offsetY = 0;
  }

  onResize(w, h) {
    const { cellSize, cols, rows } = this.config;
    this.offsetX = (w - cols * cellSize) / 2;
    this.offsetY = (h - rows * cellSize) / 2;

    this.cells = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = this.offsetX + c * cellSize;
        const y = this.offsetY + r * cellSize;
        this.cells.push(new Cell(c, r, x, y, cellSize));
      }
    }
  }

  onMouseMove(pos) {
    const c = Math.floor((pos.x - this.offsetX) / this.config.cellSize);
    const r = Math.floor((pos.y - this.offsetY) / this.config.cellSize);
    this.cells.forEach((cell) => {
      cell.isHovered = cell.col === c && cell.row === r;
    });
  }

  draw(ctx) {
    this.cells.forEach((cell) => {
      ctx.fillStyle = cell.isHovered ? "#333" : "#111";
      ctx.strokeStyle = "#444";
      ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
      ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
    });
  }
}
```

---

### 💡 How to use this for your next project:

1. **Initialize Engine**: `const game = new GameEngine({ width: 1024, height: 768 });`
2. **Add Grid**: `game.manager.add(new Grid(50, 12, 12));`
3. **Add Custom Logic**: Create classes with `update(dt)` and `draw(ctx)` methods and use `manager.add()`.

Good luck with your development! Would you like me to explain how to add a **State Machine** to the engine next, so you can handle switching between "Menu," "Playing," and "GameOver" screens?
