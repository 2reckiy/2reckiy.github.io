import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, increment, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useGamesStore = create(
  persist(
    (set, get) => ({
      catalogue: null, // The JSON data from your dependency
      votes: {}, // Format: { "gameId-v1": 10, "gameId-v2": 5 }
      userVotes: {}, // To track if THIS user already voted

      // Load the JSON data from your npm package
      setCatalogue: (data) => set({ catalogue: data }),

      // Sync votes from Firebase listener (called by your hook)
      syncVotes: (firebaseVotes) => {
        set((state) => ({
          // We merge Firebase data into our local 'votes' state
          votes: { ...state.votes, ...firebaseVotes },
        }));
      },

      // Logic to vote
      toggleVote: async (gameId, version) => {
        const voteKey = `${gameId}-v${version}`;
        const hasVoted = !!get().userVotes[voteKey];

        // 1. Determine the change
        const incrementValue = hasVoted ? -1 : 1;

        // 2. Optimistic Update (Local UI feels instant)
        set((state) => {
          const newUserVotes = { ...state.userVotes };

          if (hasVoted) {
            delete newUserVotes[voteKey]; // Clean up the key if unvoted
          } else {
            newUserVotes[voteKey] = true;
          }

          return {
            votes: {
              ...state.votes,
              [voteKey]: Math.max(0, (state.votes[voteKey] || 0) + incrementValue),
            },
            userVotes: newUserVotes,
          };
        });

        // 3. Firebase Sync
        try {
          const voteDocRef = doc(db, "votes", "global_counters");
          console.log("Writing to Project:", db.app.options.projectId);
          await setDoc(
            voteDocRef,
            {
              [voteKey]: increment(incrementValue),
            },
            { merge: true },
          );
        } catch (error) {
          console.error("Firebase sync failed:", error);
          // Optional: Revert local state if the network call fails
        }
      },
    }),
    {
      name: "playground-games-storage", // key in LocalStorage
      //   storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userVotes: state.userVotes }), // ONLY save these!
    },
  ),
);
