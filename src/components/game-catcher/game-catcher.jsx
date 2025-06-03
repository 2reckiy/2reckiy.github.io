import './game-catcher.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine';
import { useAudio } from '../../providers/audio-provider';
import { GameOver } from './components/game-over/game-over';
import { Timer } from './components/timer/timer';
import { useGameStore } from './store';
import { POSITION } from './constants';
import { Score } from './components/score/score';

const GRID_CELL_SIZE = 20;

const getGridSize = () => {
  return {
    width: Math.floor((window.innerWidth - 24) / GRID_CELL_SIZE),
    height: Math.floor((window.innerHeight - 24) / GRID_CELL_SIZE),
  };
}

export const GameCatcher = () => { 
  const canvasRef = useRef();
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
    });

    engineRef.current = engine;

    const handleKeyDown = (e) => {
      switch (e.code) {
        case "Space": engine.useFuryoku(true); break;
        case "KeyQ": engine.moveCatcher(POSITION.TOP_LEFT); break;
        case "KeyW": engine.moveCatcher(POSITION.TOP_RIGHT); break;
        case "KeyA": engine.moveCatcher(POSITION.BOTTOM_LEFT); break;
        case "KeyS": engine.moveCatcher(POSITION.BOTTOM_RIGHT); break;
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

      engine.resize({canvasWidth: width, canvasHeight: height, gridWidth: gridSize.width, gridHeight: gridSize.height});

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
    <div className="container">
      <div className="canvas-container">
        <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="border" />
      </div>
      <div className="score-container">
        <Score />
      </div>
      <div className="time-container">
        <Timer />
      </div>

      {gameOver && <GameOver onRestart={restartGame} />}
    </div>
  );
};
