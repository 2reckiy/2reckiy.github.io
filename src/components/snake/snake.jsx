import { useCallback, useEffect, useRef, useState } from 'react';
import './snake.css';
import { useAudio } from '../../providers/audio-provider';

const GRID_CELL_SIZE = 20;
const TICK_MS = 100;
const INCREASE_LEVEL_PERIOD = 10_000;
const WALLS_ENABLED = false;
const SPEED_UP = 0.2;
const FURYOKU_USAGE = 0.5;
const FURYOKU_REGAIN = 0.01;
const SNAKE_HEAD_COLOR = "#c94839";
const NEXT_OBSTACLE_COLOR = "rgba(85, 85, 85, 1)";
const OBSTACLE_COLOR = "#000000";
const OBSTACLE_GENERATION_PERIOD = 5000;
const MAX_TRAIL_LENGTH = 10;

function formatTime(miliseconds, withMilliseconds = false) {;
  const totalSeconds = Math.floor(miliseconds / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  const ms = withMilliseconds ? `.${pad(Math.floor(miliseconds % 1000), 3)}` : "";
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}${ms}`;
  } else {
    return `${pad(m)}:${pad(s)}${ms}`;
  }
}

function generateHexColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

const generateSegmentColor = (index) => {
  // Rainbow style using HSL
  const hue = (index * 25) % 360;
  return `hsl(${hue}, 100%, 50%)`;
};

const checkWallCollision = (x, y, width, height) => {
  x < 0 || y < 0 ||
  x >= width || y >= height
}

const isWrapped = (curr, prev, gridW, gridH) => {
  return Math.abs(curr.x - prev.x) > 1 && Math.abs(curr.x - prev.x) === gridW - 1 ||
         Math.abs(curr.y - prev.y) > 1 && Math.abs(curr.y - prev.y) === gridH - 1;
};

const lerpWrapped = (prev, curr, max, t) => {
  let delta = curr - prev;

  // Check for wraparound (e.g., from 0 to max-1 or vice versa)
  if (Math.abs(delta) > 1 && Math.abs(delta) === max - 1) {
    if (delta > 0) {
      // e.g., prev=0, curr=max-1
      delta = (curr - max) - prev;
    } else {
      // e.g., prev=max-1, curr=0
      delta = (curr + max) - prev;
    }
  }

  return prev + delta * t;
}

const genereateFood = (gridSize, obstacles) => {
  let x = Math.floor(Math.random() * gridSize.width),
      y = Math.floor(Math.random() * gridSize.height);

  while (obstacles[`${x}.${y}`]) {
    x = Math.floor(Math.random() * gridSize.width);
    y = Math.floor(Math.random() * gridSize.height);
  }

  return {
    x, y,
    color: generateHexColor()
  };
}

const genereateNextObstacle = (gridSize, food) => {
  let x = Math.floor(Math.random() * gridSize.width),
      y = Math.floor(Math.random() * gridSize.height);

  while (food.x === x && food.y === y) {
    x = Math.floor(Math.random() * gridSize.width);
    y = Math.floor(Math.random() * gridSize.height);
  }

  return {
    x, y,
    color: NEXT_OBSTACLE_COLOR
  };
}

const getGridSize = () => {
  return {
    width: Math.floor((window.innerWidth - 24) / GRID_CELL_SIZE),
    height: Math.floor((window.innerHeight - 24) / GRID_CELL_SIZE),
  };
}

export const Snake = () => {
  const audio = useAudio();

  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const gridSizeRef = useRef(getGridSize());
  const gameLoopAnimationFrameRef = useRef(null);
  const obstaclesIntervalRef = useRef(null);
  const nextObstacleAnimationStartRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const currentLevelRef = useRef(1);
  const gameLoopTickPeriodRef = useRef(TICK_MS);
  const obstaclesIntervalPeriodRef = useRef(OBSTACLE_GENERATION_PERIOD);
  const snakeTrailRef = useRef([]); // array of {x, y, age}


  // UI state
  const [score, setScore] = useState(0);
  const [furyoku, setFuryoku] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Game state
  const startTimeRef = useRef(0);
  const gameOverRef = useRef(false);
  const snakeRef = useRef([{ x: 10, y: 10, color: SNAKE_HEAD_COLOR }]);
  const prevSnakeRef = useRef([{ x: 10, y: 10, color: SNAKE_HEAD_COLOR }]);
  const interpProgressRef = useRef(0); // 0..1
  const snakeSegmentsColorRef = useRef([SNAKE_HEAD_COLOR]);
  const foodRef = useRef({
    x: 5,
    y: 5,
    color: generateHexColor()
  });
  const dirRef = useRef([1, 0]);
  const nextDirRef = useRef([1, 0]);
  const speedRef = useRef(1);
  const furyokuRef = useRef(100);
  const obstaclesRef = useRef({});
  const nextObstacleRef = useRef({});

  // Draw canvas
  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);


    const t = interpProgressRef.current;
    
    // obstacles
    if (nextObstacleRef.current) {
      // const animT = Math.min(
      //   (performance.now() - nextObstacleAnimationStartRef.current) / 1000,
      //   1
      // );

      // const { x, y, color } = nextObstacleRef.current;

      // const pulseScale = 1 + 0.25 * Math.sin(animT * Math.PI * 2); // Pulse up and down
      // const size = GRID_CELL_SIZE * pulseScale;
      // const offset = (GRID_CELL_SIZE - size) / 2;
    
      // ctx.fillStyle = color;
      // ctx.fillRect(
      //   x * GRID_CELL_SIZE + offset,
      //   y * GRID_CELL_SIZE + offset,
      //   size,
      //   size
      // );

      const { x, y, color } = nextObstacleRef.current;

      // Animation progress (0 to 1 second loop)
      const animT = (performance.now() - nextObstacleAnimationStartRef.current) / 1000;
      const pulseScale = 1 + 0.2 * Math.sin(animT * Math.PI * 2); // Smooth pulse
    
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

    if (obstaclesRef.current) {
      Object.values(obstaclesRef.current).forEach(obs => {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 1)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x * GRID_CELL_SIZE, obs.y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE);
        ctx.restore();
      });
    }

    // food
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(foodRef.current.x * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, foodRef.current.y * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, GRID_CELL_SIZE * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = foodRef.current.color;
    ctx.fill();
    ctx.restore();



    // snake trail
    // for (let i = snakeTrailRef.current.length - 1; i > 0; i--) {
    //   const t = snakeTrailRef.current[i];
    //   // const alpha = 1 - i / MAX_TRAIL_LENGTH;
    //   const alpha = Math.max(0, 1 - (i / MAX_TRAIL_LENGTH));
    
    //   ctx.fillStyle = `rgba(40, 45, 49, ${alpha})`; // Green fading trail
    //   ctx.fillRect(t.x * GRID_CELL_SIZE, t.y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE);
    // }

    // snake
    snakeRef.current.forEach((curr, i) => {
      const prev = prevSnakeRef.current[i] || curr;
      const gridW = gridSizeRef.current.width;
      const gridH = gridSizeRef.current.height;
    
      let x, y;
      if (isWrapped(curr, prev, gridW, gridH)) {
        x = curr.x;
        y = curr.y;
      } else {
        x = prev.x + (curr.x - prev.x) * t;
        y = prev.y + (curr.y - prev.y) * t;
      }

      // const x = lerpWrapped(prev.x, curr.x, gridSizeRef.current.width, t);
      // const y = lerpWrapped(prev.y, curr.y, gridSizeRef.current.height, t);
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = snakeSegmentsColorRef.current[i] || curr.color;
      ctx.fillRect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE);
      ctx.restore();
    });
  }, [canvasSize]);

  // Level up
  const increaseLevel = useCallback(() => {
    currentLevelRef.current += 1;
    gameLoopTickPeriodRef.current = Math.max(30, TICK_MS - (currentLevelRef.current - 1) * 10);
    obstaclesIntervalPeriodRef.current = Math.max(300, OBSTACLE_GENERATION_PERIOD - (currentLevelRef.current - 1) * 750);
    if (gameLoopTickPeriodRef.current > 30 || obstaclesIntervalPeriodRef.current > 300) {
      audio?.play('levelUp');
    }
  }, [audio]);

  // Game loop
  useEffect(() => {
    const loop = (time) => {
      if (gameOverRef.current) return;

      const elapsedTime = time - startTimeRef.current;
      setElapsedTime(elapsedTime);

      const delta = time - lastUpdateRef.current;
      interpProgressRef.current = Math.min(delta / (gameLoopTickPeriodRef.current * speedRef.current), 1);

      if (speedRef.current < 1) {
        audio?.play('speed');
        furyokuRef.current = Math.max(0, furyokuRef.current - FURYOKU_USAGE);
        setFuryoku(furyokuRef.current);
        if (furyokuRef.current <= FURYOKU_USAGE) {
          speedRef.current = 1;
        }
      } else {
        if (furyokuRef.current < 100) {
          furyokuRef.current = Math.min(100, furyokuRef.current + FURYOKU_REGAIN);
          setFuryoku(furyokuRef.current);
        }
      }

      if (delta > gameLoopTickPeriodRef.current * speedRef.current) {
        lastUpdateRef.current = time;
        dirRef.current = nextDirRef.current;

        // Save previous state
        prevSnakeRef.current = snakeRef.current.map(seg => ({ ...seg }));

        const prev = [...snakeRef.current];
        const head = {
          x: prev[0].x + dirRef.current[0],
          y: prev[0].y + dirRef.current[1],
          color: prev[0].color
        };

        if (!WALLS_ENABLED) {
          head.x = head.x % gridSizeRef.current.width;
          head.x = head.x < 0 ? gridSizeRef.current.width - 1 : head.x;
          head.y = head.y % gridSizeRef.current.height;
          head.y = head.y < 0 ? gridSizeRef.current.height - 1 : head.y;
        }

        if (prev.some(seg => seg.x === head.x && seg.y === head.y) || 
          obstaclesRef.current[`${head.x}.${head.y}`] || 
          (WALLS_ENABLED && checkWallCollision(head.x, head.y, canvasSize.width,canvasSize.height))
        ) {
          audio?.play('gameOver');
          gameOverRef.current = true;
          setGameOver(true);
          return;
        }

        const newSnake = [head, ...prev];
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          audio?.play('food');
          setScore(s => s + 1);
          snakeSegmentsColorRef.current.push(foodRef.current.color);
          foodRef.current = genereateFood(gridSizeRef.current, obstaclesRef.current);
          // {
          //   x: Math.floor(Math.random() * GRID_CELL_SIZE),
          //   y: Math.floor(Math.random() * GRID_CELL_SIZE),
          //   color: generateHexColor()
          // };
        } else {
          newSnake.pop();
        }

        snakeRef.current = newSnake;
        interpProgressRef.current = 0;

        snakeTrailRef.current.unshift({ x: snakeRef.current[0].x, y: snakeRef.current[0].y });
        if (snakeTrailRef.current.length > MAX_TRAIL_LENGTH) {
          snakeTrailRef.current.pop();
        }
      }

      if (currentLevelRef.current * INCREASE_LEVEL_PERIOD <= elapsedTime) {
        increaseLevel();
      }

      draw();
      requestAnimationFrame(loop);
    };

    gameLoopAnimationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(gameLoopAnimationFrameRef.current);
      gameLoopAnimationFrameRef.current = null;
    };
  }, [audio, gameOver, canvasSize.width, canvasSize.height, draw, increaseLevel]);

  // obstacles generation
  useEffect(() => {
    setTimeout(obstaclesIntervalRef.current);
    if (gameOver) return;

    nextObstacleRef.current = genereateNextObstacle(gridSizeRef.current, foodRef.current);
    nextObstacleAnimationStartRef.current = performance.now();

    const startTimeout = (timeout) => {
      return setTimeout(() => {
        if (gameOverRef.current) {
          clearTimeout(obstaclesIntervalRef.current);
          return;
        }
  
        obstaclesRef.current[`${nextObstacleRef.current.x}.${nextObstacleRef.current.y}`] = {...nextObstacleRef.current, color: OBSTACLE_COLOR};
        nextObstacleRef.current = genereateNextObstacle(gridSizeRef.current, foodRef.current);
        nextObstacleAnimationStartRef.current = performance.now();
        // rerun
        obstaclesIntervalRef.current = startTimeout(obstaclesIntervalPeriodRef.current || OBSTACLE_GENERATION_PERIOD);
      }, timeout);
    };
    obstaclesIntervalRef.current = startTimeout(obstaclesIntervalPeriodRef.current || OBSTACLE_GENERATION_PERIOD);

    return () => {
      clearTimeout(obstaclesIntervalRef.current);
      obstaclesIntervalRef.current = null;
    }
  }, [gameOver]);

  // Resize
  useEffect(() => {
    const updateSize = () => {
      gridSizeRef.current = getGridSize();
      const width = gridSizeRef.current.width * GRID_CELL_SIZE;
      const height = gridSizeRef.current.height * GRID_CELL_SIZE;

      setCanvasSize({
        width,
        height,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Direction control
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        speedRef.current = SPEED_UP;
        return;
      }

      const keyMap = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const newDir = keyMap[e.code];
      if (newDir) {
        const [dx, dy] = newDir;
        const [prevDx, prevDy] = dirRef.current;
        if (dx !== -prevDx && dy !== -prevDy) {
          nextDirRef.current = newDir;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        speedRef.current = 1;
        return;
      }
    }

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keydown', handleKeyUp);
    };
  }, []);

  const restartGame = useCallback(() => {
    clearInterval(obstaclesIntervalRef.current);
    cancelAnimationFrame(gameLoopAnimationFrameRef.current);
    gameLoopAnimationFrameRef.current = null;
    obstaclesIntervalRef.current = null;
    nextObstacleAnimationStartRef.current = 0;

    interpProgressRef.current = 0;
    lastUpdateRef.current = 0;
    startTimeRef.current = performance.now();
    currentLevelRef.current = 1;
    gameLoopTickPeriodRef.current = TICK_MS;
    obstaclesIntervalPeriodRef.current = OBSTACLE_GENERATION_PERIOD;
    snakeTrailRef.current = [];

    snakeRef.current = [{ x: 10, y: 10, color: SNAKE_HEAD_COLOR }];
    prevSnakeRef.current = [{ x: 10, y: 10, color: SNAKE_HEAD_COLOR }];
    snakeSegmentsColorRef.current = [SNAKE_HEAD_COLOR];
    foodRef.current = {
      x: Math.floor(Math.random() * gridSizeRef.current.width),
      y: Math.floor(Math.random() * gridSizeRef.current.height),
      color: generateHexColor()
    };
    dirRef.current = [1, 0];
    nextDirRef.current = [1, 0];
    speedRef.current = 1;
    furyokuRef.current = 100;
    obstaclesRef.current = {};
    nextObstacleRef.current = {};
    gameOverRef.current = false;
    
    setFuryoku(furyokuRef.current);
    setScore(0);
    setElapsedTime(0);
    setGameOver(false);
  }, []);

  return (
    <div className="snake-container">
      <div className="snake-canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>

      <div className="snake-time-container">
        <span>{formatTime(elapsedTime)}</span>
      </div>

      {/* <div className="snake-score-container">
        <span>{score}</span>
      </div> */}

      <div className="snake-furyoku-container">
        <div className="furyoku-bar">
          <div
            className="furyoku-fill"
            style={{ height: `${furyoku}%` }}
          />
        </div>
      </div>

      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-message">
            <h2>Game Over</h2>
            <p>Your score: {score}</p>
            <button onClick={restartGame}>Restart</button>
          </div>
        </div>  
      )}
    </div>
  );
}
