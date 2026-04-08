import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "./firebase";
import { useGamesStore } from "../store/games-store";

export const useFirebaseSync = () => {
  const syncVotes = useGamesStore((state) => state.syncVotes);

  useEffect(() => {
    // 1. Reference the specific document containing all vote counts
    const votesDocRef = doc(db, "votes", "global_counters");

    // 2. Subscribe to real-time changes
    const unsubscribe = onSnapshot(
      votesDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log("Firebase Sync - Received data:", data);
          // data looks like: { "game1-v1": 15, "game1-v2": 8 }
          syncVotes(data);
        }
      },
      (error) => {
        console.error("Firebase Sync Error:", error);
      },
    );

    // 3. Cleanup listener when the app unmounts
    return () => unsubscribe();
  }, [syncVotes]);
};
