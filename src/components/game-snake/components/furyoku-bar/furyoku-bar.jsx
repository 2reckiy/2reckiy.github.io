import { useGameStore } from "../../store";
import "./furyoku-bar.css";

export const FuryokuBar = () => {
  const furyoku = useGameStore(s => s.furyoku);

  return <div className="furyoku-bar">
    <div
      className="furyoku-fill"
      style={{ height: `${furyoku}%` }}
    />
  </div>;
}