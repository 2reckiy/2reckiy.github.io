import { POSITION } from '../constants';

const GRID_CELL_SIZE = 20;
const LOOP_INTERVAL = 100;
const INCREASE_LEVEL_INTERVAL = 10_000;
const SPAWN_INTERVAL = 2000;
const CATCHER_WIDTH = 100;
const CATCHER_HEIGHT = 200;


export class GameEngine {
  constructor({ canvas, gridWidth, gridHeight, cellSize, wallsEnabled, store, audio, onScore, onGameOver, onLevelUp, onElapsedTime }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.width = canvas.width;
    this.height = canvas.height;
    this.cellSize = cellSize;
    this.requestAnimationFrameId = null;

    this.wallsEnabled = wallsEnabled;
    this.increaseLevelInterval = INCREASE_LEVEL_INTERVAL;
    this.spawnInterval = SPAWN_INTERVAL;
    this.lanes = Object.values(POSITION);
    this.positions = {
      [POSITION.TOP_LEFT]: { x: this.width * 0.5 - CATCHER_WIDTH, y: this.height * 0.5 - CATCHER_HEIGHT },
      [POSITION.TOP_RIGHT]: { x: this.width * 0.5 + CATCHER_WIDTH, y: this.height * 0.5 - CATCHER_HEIGHT },
      [POSITION.BOTTOM_RIGHT]: { x: this.width * 0.5 + CATCHER_WIDTH, y: this.height * 0.5 + CATCHER_HEIGHT },
      [POSITION.BOTTOM_LEFT]: { x: this.width * 0.5 - CATCHER_WIDTH, y: this.height * 0.5 + CATCHER_HEIGHT },
    };
    this.corners = {
      [POSITION.TOP_LEFT]: { x: 0, y: 0 },
      [POSITION.TOP_RIGHT]: { x: this.width, y: 0 },
      [POSITION.BOTTOM_RIGHT]: { x: this.width, y: this.height },
      [POSITION.BOTTOM_LEFT]: { x: 0, y: this.height },
    };

    this.store = store;
    this.audio = audio;

    this.onScore = onScore;
    this.onGameOver = onGameOver;
    this.onLevelUp = onLevelUp;
    this.onElapsedTime = onElapsedTime;

    this.#init();
  }

  start() {
    this.running = true;
    this.startTime = performance.now();
    this.lastUpdate = performance.now();
    this.#loop(performance.now());
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.requestAnimationFrameId);
  }

  restart() {
    this.#init();
    this.start();
  }

  resize({ canvasWidth, canvasHeight, gridWidth, gridHeight }) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.width = canvasWidth;
    this.height = canvasHeight;

    this.positions = {
      [POSITION.TOP_LEFT]: { x: this.width * 0.5 - CATCHER_WIDTH, y: this.height * 0.5 - CATCHER_HEIGHT },
      [POSITION.TOP_RIGHT]: { x: this.width * 0.5 + CATCHER_WIDTH, y: this.height * 0.5 - CATCHER_HEIGHT },
      [POSITION.BOTTOM_RIGHT]: { x: this.width * 0.5 + CATCHER_WIDTH, y: this.height * 0.5 + CATCHER_HEIGHT },
      [POSITION.BOTTOM_LEFT]: { x: this.width * 0.5 - CATCHER_WIDTH, y: this.height * 0.5 + CATCHER_HEIGHT },
    };
    this.corners = {
      [POSITION.TOP_LEFT]: { x: 0, y: 0 },
      [POSITION.TOP_RIGHT]: { x: this.width, y: 0 },
      [POSITION.BOTTOM_RIGHT]: { x: this.width, y: this.height },
      [POSITION.BOTTOM_LEFT]: { x: 0, y: this.height },
    };

    if (!this.running) {
      this.#render(performance.now());
    }
  }

  moveCatcher(direction) {
    if (this.lanes.includes(direction)) {
      this.catcher.position = direction;
    }
  }

  #init() {
    this.running = false;
    this.loopInterval = LOOP_INTERVAL;
    this.lastUpdate = 0;
    this.interpolationProgress = 0;

    this.level = 1;
    this.score = 0;
    this.startTime = 0;
    this.ellapsedTime = 0;

    this.catcher = { position: POSITION.TOP_LEFT };
    this.targets = [];
    this.targetSpeed = 0.01;
    this.misses = 0;
    this.spawnInterval = SPAWN_INTERVAL;
    this.lastSpawn = 0;

    this.store.reset();
  }

  #loop(now) {
    if (!this.running) return;

    const dt = now - this.lastUpdate;
    this.ellapsedTime = now - this. startTime;
    this.interpolationProgress = Math.min(dt / this.loopInterval, 1);

    if (dt > this.loopInterval) {
      this.#update(dt);
      this.lastUpdate = now;
      this.interpolationProgress = 0;
    }

    this.#render(dt);

    this.requestAnimationFrameId = requestAnimationFrame(this.#loop.bind(this));
  }

  #update(dt) {
    this.lastSpawn += dt;
    if (this.lastSpawn >= this.spawnInterval) {
      this.#spawnTarget();
      this.lastSpawn = 0;
    }

    for (const target of this.targets) {
      target.progress += this.targetSpeed;
    }

    this.#tryToCatch()

    if (this.misses >= 3000000) {
      this.audio.play("gameOver");
      this.store.setGameOver(true);
      this.stop();
      this.onGameOver?.();
      
      return;
    }

    this.onElapsedTime?.(this.ellapsedTime);
    this.store.setElapsedTime(this.ellapsedTime);
  }

  #spawnTarget() {
    const lane = this.lanes[Math.floor(Math.random() * 4)];
    this.targets.push({ lane, progress: 0 });
  }

  #tryToCatch() {
    this.targets = this.targets.filter(t => {
      if (t.progress >= 1) {
        if (t.lane === this.catcher.position) {
          this.score++;
          this.store.setScore(this.score);
          return false;
        } else {
          this.misses++;
          return false;
        }
      }
      return true;
    });
  }

  #render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Draw baskets
    for (const lane of this.lanes) {
      const pos = this.positions[lane];
      ctx.strokeStyle = '#999';
      ctx.strokeRect(pos.x - 20, pos.y - 20, 40, 40);
    }

    // catcher
    const wolf = this.positions[this.catcher.position];
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(wolf.x, wolf.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // targets
    for (const egg of this.targets) {
      const pos = this.positions[egg.lane];
      const start = { x: egg.lane[1] === 'L' ? 0 : this.width, y: egg.lane[0] === 'T' ? 0 : this.height };
      const x = start.x + (pos.x - start.x) * egg.progress + this.interpolationProgress * (pos.x - start.x) * this.targetSpeed;
      const y = start.y + (pos.y - start.y) * egg.progress + this.interpolationProgress * (pos.y - start.y) * this.targetSpeed;

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke(); 
    }

    // for (let i = 0; i < this.lanes.length; i++) {
    //   const lane = this.lanes[i];
    //   const start = this.corners[lane];
    //   const pos = this.positions[lane];
    //   ctx.beginPath(); // Start a new path
    //   ctx.moveTo(start.x, start.y); // Move the pen to (30, 50)
    //   ctx.lineTo(pos.x, pos.y); // Draw a line to (150, 100)
    //   ctx.stroke();

    //   const nextLane = this.lanes[i + 1] || this.lanes[0];
    //   if (nextLane) {
    //     const nextPos = this.positions[nextLane];
    //     ctx.beginPath(); // Start a new path
    //     ctx.moveTo(pos.x, pos.y); // Move the pen to (30, 50)
    //     ctx.lineTo(nextPos.x, nextPos.y); // Draw a line to (150, 100)
    //     ctx.stroke();
    //   }
    // }
  }
}

