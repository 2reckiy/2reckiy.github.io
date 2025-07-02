import { create } from "zustand";

export const useGameStore = create((set) => ({
  logs: [],
  winner: null,
  battleStart: false,
  battleEnd: false,

  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setBattleStart: () => set({ battleStart: true }),
  setBattleEnd: () => set({ battleEnd: true }),
  setWinner: (winner) => set({ winner }),
  reset: () =>
    set({
      logs: [],
      winner: null,
      battleStart: false,
      battleEnd: false,
    }),
}));
