import { POSITION } from "../constants";

const LOOP_INTERVAL = 100;
const SPAWN_INTERVAL = 2000;
const TARGET_ANGLE_PER_TICK = 12;
const DEBUG = false;

export class GameEngine {
  constructor({ canvas, assets, store, audio, bgRatio, lifes, onScore, onGameOver, onElapsedTime }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.bgWidth = this.width;
    this.bgHiegth = this.height;
    this.bgRatio = bgRatio;
    this.laneCharRatio = 1112 / 1200;
    this.requestAnimationFrameId = null;

    this.spawnInterval = SPAWN_INTERVAL;
    this.lanes = Object.values(POSITION);

    this.store = store;
    this.audio = audio;
    this.assets = assets;

    this.maxLifes = lifes;
    this.lifes = lifes;
    this.settingsOpen = false;

    this.onElapsedTime = onElapsedTime;
    this.onScore = onScore;
    this.onGameOver = onGameOver;

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

  moveCatcher(direction) {
    if (this.lanes.includes(direction)) {
      this.catcher.position = direction;
    }
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;

    if (this.settingsOpen) {
    }

    this.store.toggleSettings(this.settingsOpen);
  }

  resize({ canvasWidth, canvasHeight }) {
    this.width = canvasWidth;
    this.height = canvasHeight;

    this.#resetSizes();

    if (!this.running) {
      this.#render(performance.now());
    }
  }

  #init() {
    this.running = false;
    this.loopInterval = LOOP_INTERVAL;
    this.lastUpdate = 0;
    this.spawnInterval = SPAWN_INTERVAL;
    this.lastSpawn = 0;
    this.interpolationProgress = 0;

    this.settingsOpen = false;

    this.catcher = { position: POSITION.TOP_LEFT };
    this.targets = [];
    this.targetSpeed = 0.01;
    this.score = 0;
    this.startTime = 0;
    this.ellapsedTime = 0;
    this.lifes = this.maxLifes;

    this.#resetSizes();

    this.store.reset({ lifes: this.lifes });
  }

  #pause() {}

  #resetSizes() {
    const bgScale = this.width > this.height / this.bgRatio ? this.width / (this.height / this.bgRatio) : 1;
    this.bgWidth = (this.height / this.bgRatio) * bgScale;
    this.bgHiegth = this.height * bgScale;

    const charLaneScale = this.width >= 1114 ? 1 : (this.width * 0.58) / ((this.height * 0.7) / this.laneCharRatio);
    this.laneCharWidth = ((this.height * 0.7) / this.laneCharRatio) * charLaneScale;
    this.laneCharHeight = this.height * 0.7 * charLaneScale;
    this.tSize = 500 * ((this.height * 0.2) / 500) * charLaneScale;

    this.corners = {
      [POSITION.TOP_LEFT]: { x: 0, y: this.height - this.laneCharHeight * 1.075 },
      [POSITION.BOTTOM_LEFT]: { x: 0, y: this.height - this.laneCharHeight * 0.701 },

      [POSITION.TOP_RIGHT]: { x: this.width, y: this.height - this.laneCharHeight * 1.075 },
      [POSITION.BOTTOM_RIGHT]: { x: this.width, y: this.height - this.laneCharHeight * 0.701 },
    };
    this.positions = {
      [POSITION.TOP_LEFT]: { x: this.laneCharWidth * 0.65, y: this.height - this.laneCharHeight * 0.75 },
      [POSITION.BOTTOM_LEFT]: { x: this.laneCharWidth * 0.65, y: this.height - this.laneCharHeight * 0.37 },

      [POSITION.TOP_RIGHT]: {
        x: this.width - this.laneCharWidth * 0.65,
        y: this.height - this.laneCharHeight * 0.75,
      },
      [POSITION.BOTTOM_RIGHT]: {
        x: this.width - this.laneCharWidth * 0.65,
        y: this.height - this.laneCharHeight * 0.37,
      },
    };
  }

  #spawnTarget() {
    const lane = this.lanes[Math.floor(Math.random() * 4)];
    const assetIndex = Math.floor(Math.random() * 3 + 1);
    this.targets.push({ lane, progress: 0, angle: 0, assetIndex });
  }

  #tryToCatch() {
    this.targets = this.targets.filter((t) => {
      if (t.progress >= 1) {
        if (t.lane === this.catcher.position) {
          this.score++;
          this.audio.play("catch");
          this.store.setScore(this.score);
          return false;
        } else {
          this.lifes--;
          this.audio.play("miss");
          this.store.setLifes(this.lifes);
          return false;
        }
      }
      return true;
    });
  }

  #loop(now) {
    if (!this.running) return;

    const dt = now - this.lastUpdate;
    this.ellapsedTime = now - this.startTime;
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
      target.angle += TARGET_ANGLE_PER_TICK;
    }

    this.#tryToCatch();

    if (this.lifes === 0) {
      this.audio.play("gameOver");
      this.store.setGameOver(true);
      this.stop();
      this.onGameOver?.();

      return;
    }

    this.onElapsedTime?.(this.ellapsedTime);
    this.store.setElapsedTime(this.ellapsedTime);
  }

  #render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // BACKGROUND
    ctx.drawImage(
      this.assets[0],
      -(this.bgWidth - this.width) * 0.5,
      -(this.bgHiegth - this.height) * 0.5,
      this.bgWidth,
      this.bgHiegth,
    );

    // catcher ans lanes
    const flip = this.catcher.position[1] === "R";
    const top = this.catcher.position[0] === "T";
    if (flip) {
      ctx.save();
      ctx.scale(flip ? -1 : 1, 1);
      ctx.drawImage(
        top ? this.assets[5] : this.assets[4],
        -this.width,
        this.height - this.laneCharHeight,
        this.laneCharWidth,
        this.laneCharHeight,
      );
      ctx.restore();

      ctx.drawImage(this.assets[6], 0, this.height - this.laneCharHeight, this.laneCharWidth, this.laneCharHeight);
    } else {
      ctx.drawImage(
        top ? this.assets[5] : this.assets[4],
        0,
        this.height - this.laneCharHeight,
        this.laneCharWidth,
        this.laneCharHeight,
      );

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.assets[6],
        -this.width,
        this.height - this.laneCharHeight,
        this.laneCharWidth,
        this.laneCharHeight,
      );
      ctx.restore();
    }

    // targets
    for (const egg of this.targets) {
      const end = this.positions[egg.lane];
      const start = this.corners[egg.lane];
      const x =
        start.x + (end.x - start.x) * egg.progress + this.interpolationProgress * (end.x - start.x) * this.targetSpeed;
      const y =
        start.y + (end.y - start.y) * egg.progress + this.interpolationProgress * (end.y - start.y) * this.targetSpeed;
      const flip = egg.lane[1] === "R";
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip ? -1 : 1, 1);
      ctx.rotate((Math.PI / 180) * (egg.angle + TARGET_ANGLE_PER_TICK * this.interpolationProgress));
      ctx.translate(-x, -y);
      ctx.drawImage(this.assets[egg.assetIndex], x - this.tSize * 0.5, y - this.tSize * 0.5, this.tSize, this.tSize);
      ctx.restore();
    }

    if (DEBUG) {
      for (const lane of this.lanes) {
        const pos = this.positions[lane];
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(pos.x - 20, pos.y - 20, 40, 40);

        const posc = this.corners[lane];
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(posc.x - 20, posc.y - 20, 40, 40);
      }
    }
  }
}
