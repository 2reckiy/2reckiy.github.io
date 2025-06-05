import classnames from "classnames";
import { useCallback } from "react";
import { useGameStore } from "../../../../store";
import "./win-screen.css";

export const WinScreen = ({ onBack }) => {
  const winner = useGameStore((state) => state.winner);

  const handleBack = useCallback(() => {
    onBack();
  }, []);

  return (
    <div className={classnames("win-screen-container")}>
      <span className="win-screen-title">🏆 {winner}</span>
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
    </div>
  );
};
