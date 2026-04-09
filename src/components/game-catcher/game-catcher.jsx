import "./game-catcher.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "./engine";
import { useAudio } from "../../providers/audio-provider";
import { GameOver } from "./components/game-over/game-over";
import { Timer } from "./components/timer/timer";
import { useGameStore } from "./store";
import { POSITION } from "./constants";
import bg from "./assets/background_2.jpg";
import baba1 from "./assets/egg_4.png";
import baba2 from "./assets/egg_5.png";
import baba3 from "./assets/egg_6.png";
import charaBot from "./assets/chara_1.png";
import charaTop from "./assets/chara_2.png";
import charaEmpty from "./assets/chara_3.png";
import { Lifes } from "./components/lifes/lifes";
import { Settings } from "./components/settings/settings";
import throttle from 'lodash/throttle';

const BG_RATIO = 0.411;
const LIFES_COUNT = 3;

const loadImage = async (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.log(e);
      reject(e);
    };
    img.src = src;
  });
};

export const GameCatcher = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const audio = useAudio();

  const gameOver = useGameStore((s) => s.gameOver);
  const settingsOpen = useGameStore((s) => s.settingsOpen);

  useEffect(() => {
    let engine;
    let resizeObserver;

    const handleKeyDown = (e) => {
      switch (e.code) {
        case "Escape":
          engine.toggleSettings();
          break;
        case "KeyQ":
          engine.moveCatcher(POSITION.TOP_LEFT);
          break;
        case "KeyW":
          engine.moveCatcher(POSITION.TOP_RIGHT);
          break;
        case "KeyA":
          engine.moveCatcher(POSITION.BOTTOM_LEFT);
          break;
        case "KeyS":
          engine.moveCatcher(POSITION.BOTTOM_RIGHT);
          break;
      }
    };

    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const scaleFactor = 1; // Higher = more pixelated (try 3, 4, or 6)

      // Internal resolution is small
      canvasRef.current.width = rect.width / scaleFactor;
      canvasRef.current.height = rect.height / scaleFactor;

      // Visual size remains the same
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;

      engine?.resize({
        canvasWidth: rect.width,
        canvasHeight: rect.height,
      });
    };

    async function initGame() {
      const container = containerRef.current;
      const canvas = canvasRef.current;

      let assets = [];
      try {
        assets = await Promise.all(
          [bg, baba1, baba2, baba3, charaBot, charaTop, charaEmpty].map((src) => loadImage(src)),
        );
      } catch (error) {
        console.log(error);
      }

      engine = new GameEngine({
        store: useGameStore.getState(),
        assets,
        audio,
        canvas,
        bgRatio: BG_RATIO,
        lifes: LIFES_COUNT,
      });
      engineRef.current = engine;

      const callback = throttle(handleResize, 100);
      resizeObserver = new ResizeObserver(callback);
      resizeObserver.observe(container);
      handleResize();

      engine.start();

      window.addEventListener("keydown", handleKeyDown);
    }

    initGame();

    return () => {
      engine.close();
      engineRef.current = null;
      engine = null;

      resizeObserver?.disconnect();

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const restartGame = useCallback(() => {
    engineRef.current.restart();
  }, []);

  return (
    <div className="game-catcher-container" ref={containerRef}>
      {/* <div className="game-catcher-canvas-container"> */}
      <canvas ref={canvasRef} className="border" />
      {/* </div> */}
      <div className="game-catcher-time-container">
        <Timer />
      </div>
      <div className="game-catcher-lifes-container">
        <Lifes />
      </div>

      {settingsOpen && <Settings />}
      {gameOver && <GameOver onRestart={restartGame} />}
    </div>
  );
};
