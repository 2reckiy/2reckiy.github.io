import { useGameStore } from "../../store";

const formatTime = (miliseconds, withMilliseconds = false) => {
  const totalSeconds = Math.floor(miliseconds / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  const ms = withMilliseconds ? `.${pad(Math.floor(miliseconds % 1000), 3)}` : "";
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}${ms}`;
  } else {
    return `${pad(m)}:${pad(s)}${ms}`;
  }
};

export const Timer = () => {
  const elapsedTime = useGameStore(s => s.elapsedTime);
  return <span>{formatTime(elapsedTime)}</span>
}