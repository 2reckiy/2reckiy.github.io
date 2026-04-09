import { useCallback, useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { FaHome } from "react-icons/fa";
import { MdArrowRight } from "react-icons/md";
import snakeImage from "./assets/images/snake-logo.jpg";
import catcherImage from "./assets/images/catcher-logo.png";
import { AudioProvider } from "./providers/audio-provider";
import { GameCatcher } from "./components/game-catcher/game-catcher";
import { GameSnake } from "./components/game-snake/game-snake";
import { GameFrame } from "./components/game-frame/game-frame";
import { GameVoting } from "./components/game-voting/game-voting";
import { useGamesStore } from "./store/games-store";
import { useFirebaseSync } from "./firebase/use-firebase-sync";

import catalogue from "playground/output/catalogue.json";
import "./App.css";

export const App = () => {
  const { votes, userVotes, toggleVote, setCatalogue } = useGamesStore();
  const [games, setGames] = useState({});
  const [game, setGame] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState("");

  const isVoted = game && !!userVotes[`${game.id}-v${selectedVersion}`];
  const votesCount = game && votes[`${game.id}-v${selectedVersion}`] || 0;

  useFirebaseSync();

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

    setCatalogue(catalogue);
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

  const handleHomeClick = () => {
    setGame(null);
    setSelectedVersion("");
  };

  const gamePath = useMemo(
    () => (game && selectedVersion ? game.path.replace("index.html", `index${selectedVersion}.html`) : game?.path),
    [game, selectedVersion],
  );

  const handleVote = (gameId, version) => {
    console.log(`Voted for game "${gameId}" version "${version || "origin"}"`);
    toggleVote(gameId, version);
  };

  return (
    <div className="app-container">
      <header className="appHeader">
        {game && (
          <>
            <div className="appBreadcrumps">
              <FaHome className="appBreadcrumpHome" onClick={handleHomeClick} />
              <MdArrowRight className="appBreadcrumpSeparator" />
              <span className="appBreadcrumpTitle">{game.title}</span>
            </div>
            <div className="gameVersionsContainer">
              <span>version:</span>
              {game.versions?.length ? (
                <select
                  className="gameVersionsSelect"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                >
                  <option value="">Origin</option>
                  {game.versions.map((v) => (
                    <option key={game.title + v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <span>Origin</span>
              )}
            </div>

            <GameVoting gameId={game.id} version={selectedVersion} votesCount={votesCount} voted={isVoted} onVote={handleVote} />
          </>
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
                  <span className="game-versions">{g.versions?.length || 0 + 1} Versions</span>
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
        {game?.isFramed ? <GameFrame gamePath={gamePath} /> : game?.render && <game.render />}
      </AudioProvider>

      {/* <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer> */}
    </div>
  );
};
