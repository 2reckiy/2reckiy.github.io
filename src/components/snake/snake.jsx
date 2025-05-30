import { useCallback, useEffect, useRef, useState } from 'react';
import './snake.css';

const GRID_CELL_SIZE = 20;
const TICK_MS = 100;
const WALLS_ENABLED = false;
const SPEED_UP = 0.2;

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

export const Snake = () => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });
  const gridSizeRef = useRef({
    width: Math.floor(window.innerWidth / GRID_CELL_SIZE),
    height: Math.floor(window.innerHeight / GRID_CELL_SIZE),
  });
  const runningRef = useRef(true);
  const [score, setScore] = useState(0);

  const snakeRef = useRef([{ x: 10, y: 10, color: "#c94839" }]);
  const prevSnakeRef = useRef([{ x: 10, y: 10, color: "#c94839" }]);
  const interpProgressRef = useRef(0); // from 0 to 1
  const snakeSegmentsColorRef = useRef(["#c94839"]);
  const foodRef = useRef({
    x: 5,
    y: 5,
    color: generateHexColor()
  });
  const dirRef = useRef([1, 0]);
  const nextDirRef = useRef([1, 0]);
  const speedRef = useRef(1); // Not used, but can be used to control speed

  const lastUpdateRef = useRef(0);

  // Draw canvas
  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const t = interpProgressRef.current;
    
    // Interpolate snake segments
    snakeRef.current.forEach((curr, i) => {
      const prev = prevSnakeRef.current[i] || curr;
      const x = prev.x + (curr.x - prev.x) * t;
      const y = prev.y + (curr.y - prev.y) * t;
      
      const color = prev.color || curr.color;
      ctx.fillStyle = snakeSegmentsColorRef.current[i] || color;
      ctx.fillRect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE);
    });
    // snakeRef.current.forEach(({x, y, color}, index) => {
    //   ctx.fillStyle = snakeSegmentsColorRef.current[index] || color;
    //   ctx.fillRect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE)
    // });

    ctx.fillStyle = foodRef.current.color;
    ctx.fillRect(foodRef.current.x * GRID_CELL_SIZE, foodRef.current.y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE);
  }, [canvasSize]);

  // Resize
  useEffect(() => {
    const updateSize = () => {
      gridSizeRef.current = {
        width: Math.floor(window.innerWidth / GRID_CELL_SIZE),
        height: Math.floor(window.innerHeight / GRID_CELL_SIZE),
      };
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

  // Game logic using requestAnimationFrame
  useEffect(() => {
    const loop = (time) => {
      if (!runningRef.current) return;

      const delta = time - lastUpdateRef.current;
      interpProgressRef.current = Math.min(delta / TICK_MS * speedRef.current, 1);

      if (time - lastUpdateRef.current > TICK_MS * speedRef.current) {
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

        if (prev.some(seg => seg.x === head.x && seg.y === head.y) || (WALLS_ENABLED && checkWallCollision(head.x, head.y, canvasSize.width,canvasSize.height))
        ) {
          runningRef.current = false;
          snakeRef.current = prev;
          return;
        }

        const newSnake = [head, ...prev];
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          setScore(s => s + 1);
          snakeSegmentsColorRef.current.push(foodRef.current.color);
          foodRef.current = {
            x: Math.floor(Math.random() * GRID_CELL_SIZE),
            y: Math.floor(Math.random() * GRID_CELL_SIZE),
            color: generateHexColor()
          };
        } else {
          newSnake.pop();
        }

        snakeRef.current = newSnake;
        interpProgressRef.current = 0; // reset interpolation
      }

      draw();
      requestAnimationFrame(loop);
    };

    const frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame)
    };
  }, [draw]);

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

  const restartGame = () => {
    // setSnake([[10, 10]]);
    // setFood([5, 5]);
    // setDir([1, 0]);
    runningRef.current = true;
    lastUpdateRef.current = 0;
    requestAnimationFrame(() => {}); // trigger restart
  };

  return (
    <div className="snake-container">
      <div className="snake-canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>

      <div className="snake-score-container">
        <span>{score}</span>
      </div>
    </div>
  );
}
