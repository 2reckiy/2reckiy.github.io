const GRID_CELL_SIZE = 20;
const LOOP_PERIOD_MS = 100;
const INCREASE_LEVEL_PERIOD = 10_000;
const FURYOKU_ACCELERATION = 0.2;
const FURYOKU_USAGE = 0.5;
const FURYOKU_REGAIN = 0.01;
const SNAKE_HEAD_COLOR = "#c94839";
const NEXT_OBSTACLE_COLOR = "rgba(85, 85, 85, 1)";
const OBSTACLE_COLOR = "#000000";
const OBSTACLE_GENERATION_PERIOD = 5000;
const MAX_TRAIL_LENGTH = 10;

const getIdFromPos = ({x, y}) => `${x}.${y}`;
const randomPosition = (width, height) => ({
  x: Math.floor(Math.random() * width),
  y: Math.floor(Math.random() * height),
});
const generateHexColor = () => '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');

const isWrapped = (curr, prev, gridW, gridH) => {
  return Math.abs(curr.x - prev.x) > 1 && Math.abs(curr.x - prev.x) === gridW - 1 ||
         Math.abs(curr.y - prev.y) > 1 && Math.abs(curr.y - prev.y) === gridH - 1;
};

export class GameEngine {
  constructor({ canvas, gridWidth, gridHeight, cellSize, wallsEnabled, store, audio, onScore, onGameOver, onLevelUp, onElapsedTime, onFuryoku }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellSize = cellSize;
    this.requestAnimationFrameId = null;

    this.wallsEnabled = wallsEnabled;
    this.increaseLevelPeriod = INCREASE_LEVEL_PERIOD;

    this.store = store;
    this.audio = audio;

    this.onScore = onScore;
    this.onGameOver = onGameOver;
    this.onLevelUp = onLevelUp;
    this.onElapsedTime = onElapsedTime;
    this.onFuryoku = onFuryoku;

    this.#init();
  }

  start() {
    this.running = true;
    this.startTime = performance.now();
    this.lastUpdate = performance.now();
    this.#handleFoodGeneration();
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

  resize(w, h) {
    this.gridWidth = w;
    this.gridHeight = h;

    if (!this.running) {
      this.#render(performance.now());
    }
  }

  changeDirection(x, y) {
    if ((x === -this.dir.x && y === 0) || (y === -this.dir.y && x === 0)) return;
    this.nextDir = { x, y };
  }

  useFuryoku(isUsing) {
    if (isUsing && this.furyoku <= this.furyokuUsage) {
      this.isFuryokuUsing = false;
      this.acceleration = 1;
      return;
    }

    this.isFuryokuUsing = isUsing;
    this.acceleration = isUsing ? this.furyokuAcceleration : 1;
  }

  #init() {
    this.snake = [{ x: 10, y: 10, color: SNAKE_HEAD_COLOR }];
    this.prevSnake = [{ x: 10, y: 10, color: SNAKE_HEAD_COLOR }];
    this.snakeSegmentsColors = [SNAKE_HEAD_COLOR];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = {}
    this.obstacles = {};
    this.nextObstacle = null;
    this.level = 1;
    this.score = 0;
    this.furyoku = 100;
    this.isFuryokuUsing = false;
    this.furyokuAcceleration = FURYOKU_ACCELERATION;
    this.furyokuUsage = FURYOKU_USAGE;
    this.furyokuRegain = FURYOKU_REGAIN;
    this.acceleration = 1;
    this.startTime = 0;
    this.ellapsedTime = 0;
    
    this.running = false;
    this.loopPeriod = LOOP_PERIOD_MS;
    this.lastUpdate = 0;
    this.interpolationProgress = 0;
    this.obstacleGenerationPeriod = OBSTACLE_GENERATION_PERIOD;
    this.nextObstacleAnimationStart = 0;
    this.lastObstacleGenerationTime = 0;

    this.store.reset();
  }

  #loop(now) {
    if (!this.running) return;

    const dt = now - this.lastUpdate;
    this.ellapsedTime = now - this. startTime;
    this.interpolationProgress = Math.min(dt / (this.loopPeriod * this.acceleration), 1);

    if (dt > this.loopPeriod * this.acceleration) {
      this.#update(now);
      this.lastUpdate = now;
      this.interpolationProgress = 0;
    }

    this.#render(now);

    this.requestAnimationFrameId = requestAnimationFrame(this.#loop.bind(this));
  }

  #update(now) {
    this.dir = this.nextDir;
    this.prevSnake = this.snake.map(seg => ({ ...seg }));
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y, color: this.snake[0].color };

    if (!this.wallsEnabled) {
      head.x = head.x % this.gridWidth;
      head.x = head.x < 0 ? this.gridWidth - 1 : head.x;
      head.y = head.y % this.gridHeight;
      head.y = head.y < 0 ? this.gridHeight - 1 : head.y;
    }

    if (this.#hitObstacle(head) || this.#hitWall(head) || this.#hitSelf(head)) {
      this.audio.play("gameOver");
      this.store.setGameOver(true);
      this.stop();
      this.onGameOver?.();
      
      return;
    }

    this.snake.unshift(head);

    if (this.food[getIdFromPos(head)]) {
      this.score++;
      // this.furyoku += 10;
      this.#eat(head);
      this.#handleFoodGeneration();
      this.onScore?.(this.score);
      this.store.setScore(this.score);

      if (this.level * this.increaseLevelPeriod <= this.ellapsedTime) {
        this.#levelUp();
      }
    } else {
      this.snake.pop();
    }

    this.#handleFuryokuAcceleration(now);
    this.#handleObstacleGeneration(now);
    this.onElapsedTime?.(this.ellapsedTime);
    this.store.setElapsedTime(this.ellapsedTime);
  }

  #eat({x, y}) {
    const id = getIdFromPos({x, y});
    this.snakeSegmentsColors.push(this.food[id].color);
    delete this.food[id];
    this.audio.play("eat");
  }

  #levelUp() {
    this.level++;
    this.loopPeriod = Math.max(30, this.loopPeriod - 10);
    this.obstacleGenerationPeriod = Math.max(300, this.obstacleGenerationPeriod - 750);
    this.onLevelUp?.(this.level);
    this.store.setLevel(this.level);
    this.audio.play("levelUp");
  }

  #hitWall(pos) {
    if (!this.wallsEnabled) {
      return false;
    }
    return pos.x < 0 || pos.y < 0 || pos.x >= this.gridWidth || pos.y >= this.gridHeight;
  }

  #hitSelf(pos) {
    return this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
  }

  #hitObstacle(pos) {
    return !!this.obstacles[getIdFromPos(pos)];
  }

  #handleFoodGeneration() {
    let pos = randomPosition(this.gridWidth, this.gridHeight);
    
    while (this.obstacles?.[getIdFromPos(pos)]) {
      pos = randomPosition(this.gridWidth, this.gridHeight);
    }

    this.food[getIdFromPos(pos)] = {
      ...pos,
      color: generateHexColor(),
    }
  }

  #handleObstacleGeneration(now) {
    const isTime = now - this.lastObstacleGenerationTime >= this.obstacleGenerationPeriod;

    if (!this.nextObstacle) {
      let pos = randomPosition(this.gridWidth, this.gridHeight);
    
      while (this.food?.[getIdFromPos(pos)]) {
        pos = randomPosition(this.gridWidth, this.gridHeight);
      }

      this.nextObstacle = {
        ...pos,
        color: NEXT_OBSTACLE_COLOR,
      }
      this.nextObstacleAnimationStart = now;
    }

    if (!isTime) {
      return;
    }


    this.lastObstacleGenerationTime = now;
    this.obstacles[getIdFromPos(this.nextObstacle)] = {
      ...this.nextObstacle,
      color: OBSTACLE_COLOR,
    };
    this.nextObstacle = null;
  }

  #handleFuryokuAcceleration() {
    if (this.isFuryokuUsing) {
      this.furyoku = Math.max(0, this.furyoku - this.furyokuUsage);
      this.audio.play("accelerate");
      if (this.furyoku <= this.furyokuUsage) {
        this.useFuryoku(false);
      }
    } else {
      if (this.furyoku < 100) {
        this.furyoku = Math.min(100, this.furyoku + this.furyokuUsage);
      }
    }

    this.onFuryoku?.(this.furyoku);
    this.store.setFuryoku(this.furyoku);
  }

  #render(now) {
    const { ctx, canvas, cellSize } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Next obstacle
    if(this.nextObstacle) {
      const { x, y, color } = this.nextObstacle;

      const animT = (now - this.nextObstacleAnimationStart) / 1000;
      const pulseScale = 1 + 0.2 * Math.sin(Math.PI * 2 * animT); // Smooth pulse
    
      const cx = x * GRID_CELL_SIZE + GRID_CELL_SIZE / 2;
      const cy = y * GRID_CELL_SIZE + GRID_CELL_SIZE / 2;
    
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      // Move origin to center of cell
      ctx.translate(cx, cy);
    
      // Apply pulse scale
      ctx.scale(pulseScale, pulseScale);
    
      // Set style and draw square centered at (0,0)
      ctx.fillStyle = color;
      ctx.fillRect(-GRID_CELL_SIZE / 2, -GRID_CELL_SIZE / 2, GRID_CELL_SIZE, GRID_CELL_SIZE);
    
      ctx.restore();
    }
    // Current obstacles
    Object.values(this.obstacles).forEach(o => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize)
      ctx.restore();
    });

    // Food
    Object.values(this.food).forEach(f => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.arc(f.x * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, f.y * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, GRID_CELL_SIZE * 0.5, 0, 2 * Math.PI);
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.restore();
    });

    // Snake
    this.snake.forEach((s, i) => {
      const prevS = this.prevSnake[i] || s;
      let x, y;

      if (isWrapped(s, prevS, this.gridWidth, this.gridHeight)) {
        x = s.x;
        y = s.y;
      } else {
        x = prevS.x + (s.x - prevS.x) * this.interpolationProgress;
        y = prevS.y + (s.y - prevS.y) * this.interpolationProgress;
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = this.snakeSegmentsColors[i] || s.color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.restore();
    });
  }
}

