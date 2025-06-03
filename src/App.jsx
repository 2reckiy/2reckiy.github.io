import { useCallback, useState } from "react";
import "./App.css";
import { AudioProvider } from "./providers/audio-provider";
import snakePreview from "./assets/images/snake-preview.png";

const GAMES = [
  {
    id: "snake",
    title: "Snake",
    preview: snakePreview,
  },
  {
    id: "catcher",
    title: "Catcher",
    preview: snakePreview,
  },
];

export const App = () => {
  const [previewGame, setPreviewGame] = useState(GAMES[0].id);
  // const [game, setGame] = useState("");

  const onPreviewGameSelect = useCallback(
    (e) => {
      if (e.target.id === previewGame) {
        return;
      }

      setPreviewGame(e.target.id);
    },
    [previewGame],
  );

  return (
    <div className="app-container">
      <div className="games-container">
        {GAMES.map((g) => (
          <div className="game-container" key={g.id}>
            <img src={g.preview} alt="Logo" />
            <div className="game-title-container">
              <span className="game-title">{g.title}</span>
            </div>
          </div>
        ))}
      </div>

      <AudioProvider>
        {/* { game === "snake" && <GameSnake /> }
        { game === "catcher" && <GameCatcher /> } */}
      </AudioProvider>

      <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer>
    </div>
  );
};
