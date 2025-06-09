import { useGameStore } from "../../store";
import lifeSrc from "../../assets/logo_3.png";
import "./lifes.css";

export const Lifes = () => {
  const lifes = useGameStore((s) => s.lifes);
  return (
    <div className="container">
      {Array.from({ length: lifes }).map((_, i) => {
        return <img key={i} src={lifeSrc} className="life-image" />;
      })}
    </div>
  );
};
