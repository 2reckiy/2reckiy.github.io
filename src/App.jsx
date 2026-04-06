import { useCallback, useState } from "react";
import classNames from "classnames";
import { FaHome } from "react-icons/fa";
import { MdArrowRight } from "react-icons/md";

import { AudioProvider } from "./providers/audio-provider";
import { GameCatcher } from "./components/game-catcher/game-catcher";
import { GameSnake } from "./components/game-snake/game-snake";
import { GameFrame } from "./components/game-frame/game-frame";
import snakeImage from "./assets/images/snake-logo.jpg";
import catcherImage from "./assets/images/catcher-logo.png";
import "./App.css";

const GAMES = {
  ["snake"]: {
    id: "snake",
    title: "Snake",
    backgroundImage: `url(${snakeImage})`,
    backgroundColor: "#04053f",
    isFramed: false,
    render: GameSnake,
  },
  ["catcher"]: {
    id: "catcher",
    title: "Catcher",
    backgroundImage: `url(${catcherImage})`,
    backgroundColor: "#049146",
    isFramed: false,
    render: GameCatcher,
  },
  ["formula"]: {
    id: "formula",
    title: "Formula",
    backgroundColor: "#4e4e4e",
    isFramed: true,
    path: "/playground/formula/index.html",
  },
  // {
  //   id: "duel-due",
  //   title: "Duel Due",
  // },
};

export const App = () => {
  const [game, setGame] = useState(null);

  const handlePreviewGameSelect = useCallback(
    (e) => {
      const selectedGame = GAMES[e.target.id];
      if (selectedGame.id === game?.id) {
        return;
      }

      setGame(selectedGame);
    },
    [game],
  );

  const handleHomeClick = () => setGame(null);

  return (
    <div className="app-container">
      <header className="appHeader">
        {game && (
          <div className="appBreadcrumps">
            <FaHome className="appBreadcrumpHome" onClick={handleHomeClick} />
            <MdArrowRight className="appBreadcrumpSeparator" />
            <span className="appBreadcrumpTitle">{game.title}</span>
          </div>
        )}
      </header>
      {!game && (
        <>
          {/* <div>
            <Banner game={game} />
          </div> */}
          <div className="games-container">
            {Object.values(GAMES).map((g) => (
              <div
                className={classNames("game-container", g.id)}
                key={g.id}
                id={g.id}
                onClick={handlePreviewGameSelect}
              >
                <div
                  className={classNames("game-logo")}
                  style={{ backgroundImage: g.backgroundImage, backgroundColor: g.backgroundColor }}
                >
                  {!g.backgroundImage && <span className="game-logo-placeholder">{g.title}</span>}
                </div>
                <div className="game-title-container">
                  <span className="game-title">{g.title}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AudioProvider>
        {/* {game?.id === "snake" && <GameSnake />}
        {game?.id === "catcher" && <GameCatcher />}
        {game?.id === "duel-due" && <GameDuelDue />} */}
        {game?.isFramed ? <GameFrame game={game.path} /> : game?.render && <game.render />}
      </AudioProvider>

      {/* <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer> */}
    </div>
  );
};
