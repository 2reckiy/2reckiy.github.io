import { create } from 'zustand';

export const useGameStore = create((set) => ({
  score: 0,
  level: 1,
  elapsedTime: 0,
  furyoku: 0,
  gameOver: false,

  setScore: (score) => set({ score }),
  setLevel: (level) => set({ level }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setFuryoku: (furyoku) => set({ furyoku }),
  setGameOver: (gameOver) => set({ gameOver }),
  reset: () => set({
    score: 0,
    level: 1,
    ellapsedTime: 0,
    furyoku: 0,
    gameOver: false,
  }),
}));