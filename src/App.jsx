import { useCallback, useState } from "react";
import "./App.css";
import { AudioProvider } from "./providers/audio-provider";
import { GameDuelDue } from "./components/game-duel-due/game-duel-due";
import { GameCatcher } from "./components/game-catcher/game-catcher";
import { GameSnake } from "./components/game-snake/game-snake";
import { Banner } from "./components/banner/banner";
import classNames from "classnames";

const GAMES = [
  {
    id: "snake",
    title: "Snake",
  },
  {
    id: "catcher",
    title: "Catcher",
  },
  {
    id: "duel-due",
    title: "Duel Due",
  },
];

export const App = () => {
  const [game, setGame] = useState("");

  const onPreviewGameSelect = useCallback(
    (e) => {
      if (e.target.id === game) {
        return;
      }

      setGame(e.target.id);
    },
    [game],
  );

  return (
    <div className="app-container">
      {!game && (
        <>
          <div>
            <Banner game={game} />
          </div>
          <div className="games-container">
            {GAMES.map((g) => (
              <div className={classNames("game-container", g.id)} key={g.id} id={g.id} onClick={onPreviewGameSelect}>
                <div className={classNames("game-logo", g.id)}></div>
                <div className="game-title-container">
                  <span className="game-title">{g.title}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AudioProvider>
        {game === "snake" && <GameSnake />}
        {game === "catcher" && <GameCatcher />}
        {game === "duel-due" && <GameDuelDue />}
      </AudioProvider>

      {/* <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer> */}
    </div>
  );
};
