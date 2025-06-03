import { useGameStore } from "../../store";
import "./game-over.css";

export const GameOver = ({ onRestart }) => {
  const score = useGameStore(s => s.score);

  return <div className="game-over-container">
    <div className="game-over-message">
      <h2>Game Over</h2>
      <p>Your score: {score}</p>
      <button onClick={onRestart}>Restart</button>
    </div>
  </div>
}