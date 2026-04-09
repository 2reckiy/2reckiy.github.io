import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "./engine";
import { useAudio } from "../../providers/audio-provider";
import { FuryokuBar } from "./components/furyoku-bar/furyoku-bar";
import { GameOver } from "./components/game-over/game-over";
import { Timer } from "./components/timer/timer";
import "./game-snake.css";
import { useGameStore } from "./store";
import throttle from "lodash/throttle";

const GRID_CELL_SIZE = 20;

const getGridSize = (w, h) => {
  return {
    width: Math.floor((w - 0) / GRID_CELL_SIZE),
    height: Math.floor((h - 0) / GRID_CELL_SIZE),
  };
};

export const GameSnake = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const audio = useAudio();

  const gameOver = useGameStore((s) => s.gameOver);

  useEffect(() => {
    let engine;
    let resizeObserver;

    const handleKeyDown = (e) => {
      switch (e.code) {
        case "Space":
          engine.useFuryoku(true);
          break;
        case "ArrowUp":
          engine.changeDirection(0, -1);
          break;
        case "ArrowDown":
          engine.changeDirection(0, 1);
          break;
        case "ArrowLeft":
          engine.changeDirection(-1, 0);
          break;
        case "ArrowRight":
          engine.changeDirection(1, 0);
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case "Space":
          engine.useFuryoku(false);
          break;
      }
    };

    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const gridSize = getGridSize(rect.width, rect.height);
      const width = gridSize.width * GRID_CELL_SIZE;
      const height = gridSize.height * GRID_CELL_SIZE;

      // Internal resolution is small
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Visual size remains the same
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      engine.resize(gridSize.width, gridSize.height);
    };

    const initGame = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;

      engine = new GameEngine({
        store: useGameStore.getState(),
        audio,
        canvas,
        gridWidth: 0,
        gridHeight: 0,
        cellSize: GRID_CELL_SIZE,
        wallsEnabled: false,
      });

      engineRef.current = engine;

      const callback = throttle(handleResize, 100);
      resizeObserver = new ResizeObserver(callback);
      resizeObserver.observe(container);
      handleResize();

      engine.start();

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    };

    initGame();

    return () => {
      engine.close();
      engine = null;
      engineRef.current = null;

      resizeObserver?.disconnect();

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const restartGame = useCallback(() => {
    engineRef.current.restart();
  }, []);

  return (
    <>
      <div className="snake-container" ref={containerRef}>
        <canvas ref={canvasRef} className="border" />

        <div className="snake-furyoku-container">
          <FuryokuBar />
        </div>

        <div className="snake-time-container">
          <Timer />
        </div>
        {gameOver && <GameOver onRestart={restartGame} />}
      </div>
    </>
  );
};
