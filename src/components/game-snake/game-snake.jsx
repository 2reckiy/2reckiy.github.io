import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine';
import { useAudio } from '../../providers/audio-provider';
import { FuryokuBar } from './components/furyoku-bar/furyoku-bar';
import { GameOver } from './components/game-over/game-over';
import { Timer } from './components/timer/timer';
import './game-snake.css';
import { useGameStore } from './store';

const GRID_CELL_SIZE = 20;

const getGridSize = () => {
  return {
    width: Math.floor((window.innerWidth - 24) / GRID_CELL_SIZE),
    height: Math.floor((window.innerHeight - 24) / GRID_CELL_SIZE),
  };
}

export const GameSnake = () => {  const canvasRef = useRef();
  const engineRef = useRef(null);
  const audio = useAudio();
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const gameOver = useGameStore(s => s.gameOver);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new GameEngine({
      store: useGameStore.getState(),
      audio,
      canvas,
      gridWidth: 0,
      gridHeight: 0,
      cellSize: GRID_CELL_SIZE,
      wallsEnabled: false,
    });

    engineRef.current = engine;

    const handleKeyDown = (e) => {
      switch (e.code) {
        case "Space": engine.useFuryoku(true); break;
        case "ArrowUp": engine.changeDirection(0, -1); break;
        case "ArrowDown": engine.changeDirection(0, 1); break;
        case "ArrowLeft": engine.changeDirection(-1, 0); break;
        case "ArrowRight": engine.changeDirection(1, 0); break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case "Space": engine.useFuryoku(false); break;
      }
    }

    const handleResize = () => {
      const gridSize = getGridSize();
      const width = gridSize.width * GRID_CELL_SIZE;
      const height = gridSize.height * GRID_CELL_SIZE;

      engine.resize(gridSize.width, gridSize.height);

      setCanvasSize({
        width,
        height,
      });
    };

    handleResize();
    engine.start();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  const restartGame = useCallback(() => {
    engineRef.current.restart();
  }, []);

  return (
    <div className="snake-container">
      <div className="snake-canvas-container">
        <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="border" />
      </div>

      <div className="snake-time-container">
        <Timer />
      </div>

      <div className="snake-furyoku-container">
        <FuryokuBar />
      </div>

      {gameOver && <GameOver onRestart={restartGame} />}
    </div>
  );
};
