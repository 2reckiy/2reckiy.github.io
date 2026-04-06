import { useCallback, useEffect, useState, version } from "react";
import classNames from "classnames";
import { FaHome } from "react-icons/fa";
import { MdArrowRight } from "react-icons/md";

import snakeImage from "./assets/images/snake-logo.jpg";
import catcherImage from "./assets/images/catcher-logo.png";

import { AudioProvider } from "./providers/audio-provider";
import { GameCatcher } from "./components/game-catcher/game-catcher";
import { GameSnake } from "./components/game-snake/game-snake";
import { GameFrame } from "./components/game-frame/game-frame";
import "./App.css";

import catalogue from "playground/output/catalogue.json";

export const App = () => {
  const [games, setGames] = useState({});
  const [game, setGame] = useState(null);

  useEffect(() => {
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
    };

    catalogue?.games.forEach((g) => {
      if (GAMES[g.id]) {
        console.log(`Game with id "${g.id}" is already in GAMES. Skipping...`);
        return;
      }

      GAMES[g.id] = {
        id: g.id,
        title: g.title,
        backgroundColor: "#4e4e4e",
        isFramed: true,
        versions: g.versions,
        path: `${catalogue.path}/${g.id}/index.html`,
      };
    });

    // GAMES['formula'] = {
    //   id: 'formula',
    //   title: 'formula',
    //   backgroundColor: "#4e4e4e",
    //   isFramed: true,
    //   versions: [],
    //   path: `games/formula/index.html`,
    // };

    setGames(GAMES);
  }, []);

  const handlePreviewGameSelect = useCallback(
    (e) => {
      const selectedGame = games[e.target.id];
      if (selectedGame.id === game?.id) {
        return;
      }

      setGame(selectedGame);
    },
    [games, game],
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
            {Object.values(games).map((g) => (
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
        {game?.isFramed ? <GameFrame gamePath={game.path} /> : game?.render && <game.render />}
      </AudioProvider>

      {/* <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer> */}
    </div>
  );
};
