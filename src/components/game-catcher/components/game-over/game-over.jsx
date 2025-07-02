import { useAudio } from '../../../../providers/audio-provider';
import looseScreen from "../../assets/loose_screen.png";
import restartButton from "../../assets/retry_button.png";
import { useGameStore } from "../../store";
import "./game-over.css";

export const GameOver = ({ onRestart }) => {
  const score = useGameStore((s) => s.score);
  const audio = useAudio();

  audio.playMusic("/music/menu_1.wav", false);

  return (
    <div className="game-over-container">
      <div className="game-over-message">
        <div
          style={{
            backgroundImage: `url(${looseScreen})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat, no-repeat",
            backgroundPosition: "center",
            height: "40vh",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={onRestart}
        ></div>
        <span className='score'>Рахунок: {score}</span>
        <div
          style={{
            backgroundImage: `url(${restartButton})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat, no-repeat",
            backgroundPosition: "center",
            height: "20vh",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={onRestart}
        ></div>
      </div>
    </div>
  );
};
