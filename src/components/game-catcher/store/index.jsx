import { create } from "zustand";

export const useGameStore = create((set) => ({
  score: 0,
  level: 1,
  elapsedTime: 0,
  lifes: 0,
  gameOver: false,
  settingsOpen: false,

  setScore: (score) => set({ score }),
  setLevel: (level) => set({ level }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setLifes: (lifes) => set({ lifes }),
  setGameOver: (gameOver) => set({ gameOver }),
  toggleSettings: (settingsOpen) => set({ settingsOpen }),
  reset: ({ lifes }) =>
    set({
      score: 0,
      level: 1,
      ellapsedTime: 0,
      lifes: lifes,
      gameOver: false,
      settingsOpen: false,
    }),
}));
