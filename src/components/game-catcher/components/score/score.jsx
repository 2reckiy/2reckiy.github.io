import { useGameStore } from "../../store";
import "./score.css";

export const Score = () => {
  const score = useGameStore(s => s.score);

  return <div className="score">
    <span>{score}</span>
  </div>;
}