import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { FaPlay, FaPuzzlePiece } from "react-icons/fa6";
import snakeImage from "./assets/images/snake-logo.jpg";
import catcherImage from "./assets/images/catcher-logo.png";
import { GameCatcher } from "./components/game-catcher/game-catcher";
import { GameSnake } from "./components/game-snake/game-snake";
import { GamePage } from "./components/game-page/game-page";
import { useGamesStore } from "./store/games-store";
import { useFirebaseSync } from "./firebase/use-firebase-sync";
import styles from "./App.module.css";
import catalogue from "playground/output/catalogue.json";

const NATIVE_GAMES = {
  snake: {
    id: "snake",
    title: "Snake",
    summary: "A small built-in arcade game made directly in React.",
    backgroundImage: `url(${snakeImage})`,
    backgroundColor: "#15304d",
    isFramed: false,
    versions: [],
    typeLabel: "Native",
    render: GameSnake,
  },
  catcher: {
    id: "catcher",
    title: "Catcher",
    summary: "A bright reflex game sitting alongside the HTML archive.",
    backgroundImage: `url(${catcherImage})`,
    backgroundColor: "#28563f",
    isFramed: false,
    versions: [],
    typeLabel: "Native",
    render: GameCatcher,
  },
};

const prettifyTitle = (value) =>
  value
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildGamesMap = () => {
  const games = { ...NATIVE_GAMES };

  catalogue?.games.forEach((game) => {
    if (games[game.id]) {
      return;
    }

    games[game.id] = {
      id: game.id,
      title: game.title || prettifyTitle(game.id),
      summary: `${game.versions.length + 1} playable build${game.versions.length ? "s" : ""} from the HTML/CSS/JS archive.`,
      backgroundColor: "#1c1a16",
      isFramed: true,
      versions: game.versions,
      typeLabel: "HTML",
      path: `${catalogue.path}/${game.id}/index.html`,
    };
  });

  return games;
};

const getTotalVotes = (votes, gameId) =>
  Object.entries(votes).reduce((sum, [voteKey, count]) => {
    return voteKey.startsWith(`${gameId}-v`) ? sum + count : sum;
  }, 0);

export const App = () => {
  const { votes, userVotes, toggleVote, setCatalogue } = useGamesStore();
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const deferredSearchValue = useDeferredValue(searchValue);

  const games = useMemo(buildGamesMap, []);
  const gamesList = useMemo(() => Object.values(games), [games]);
  const selectedGame = selectedGameId ? games[selectedGameId] : null;
  const isVoted = selectedGame && !!userVotes[`${selectedGame.id}-v${selectedVersion}`];
  const votesCount = (selectedGame && votes[`${selectedGame.id}-v${selectedVersion}`]) || 0;

  useFirebaseSync();

  useEffect(() => {
    setCatalogue(catalogue);
  }, [setCatalogue]);

  useEffect(() => {
    setSelectedVersion("");
  }, [selectedGameId]);

  const filteredGames = useMemo(() => {
    const normalizedQuery = deferredSearchValue.trim().toLowerCase();

    return gamesList
      .filter((game) => {
        if (activeFilter === "native") {
          return !game.isFramed;
        }

        if (activeFilter === "html") {
          return game.isFramed;
        }

        return true;
      })
      .filter((game) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchText = [game.title, game.id, game.summary].join(" ").toLowerCase();
        return searchText.includes(normalizedQuery);
      })
      .sort((gameA, gameB) => gameA.title.localeCompare(gameB.title));
  }, [activeFilter, deferredSearchValue, gamesList]);

  const featuredGames = useMemo(
    () =>
      gamesList
        .map((game) => ({
          ...game,
          totalVotes: getTotalVotes(votes, game.id),
        }))
        .sort((gameA, gameB) => {
          if (gameB.totalVotes !== gameA.totalVotes) {
            return gameB.totalVotes - gameA.totalVotes;
          }

          return gameA.title.localeCompare(gameB.title);
        })
        .slice(0, 4),
    [gamesList, votes],
  );

  const gamePath = useMemo(
    () =>
      selectedGame && selectedVersion
        ? selectedGame.path.replace("index.html", `index${selectedVersion}.html`)
        : selectedGame?.path,
    [selectedGame, selectedVersion],
  );

  const handleSelectGame = (gameId) => {
    startTransition(() => {
      setSelectedGameId(gameId);
    });
  };

  const handleVote = (gameId, version) => {
    toggleVote(gameId, version);
  };

  return (
    <div className={styles.appShell}>
      {!selectedGame ? (
        <main className={styles.cataloguePage}>
          <section className={styles.introPanel}>
            <div className={styles.introCopy}>
              <p className={styles.eyebrow}>2reckiy playground</p>
              <h1 className={styles.introTitle}>A small archive of browser game experiments.</h1>
              <p className={styles.introText}>
                Most projects here were built in plain HTML, CSS, and JavaScript, then wrapped into this React shell so
                the whole collection can live in one place.
              </p>
            </div>

            <div className={styles.introStats}>
              <div className={styles.introStat}>
                <span className={styles.introStatValue}>{gamesList.length}</span>
                <span className={styles.introStatLabel}>games</span>
              </div>
              <div className={styles.introStat}>
                <span className={styles.introStatValue}>
                  {catalogue.games.reduce(
                    (sum, game) => sum + game.versions.length + 1,
                    Object.keys(NATIVE_GAMES).length,
                  )}
                </span>
                <span className={styles.introStatLabel}>builds</span>
              </div>
              <div className={styles.introStat}>
                <span className={styles.introStatValue}>HTML</span>
                <span className={styles.introStatLabel}>core medium</span>
              </div>
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sectionEyebrow}>Featured</p>
                <h2>Start with a few favorites</h2>
              </div>
            </div>

            <div className={styles.featuredGrid}>
              {featuredGames.map((game) => (
                <article key={game.id} className={styles.gameCard}>
                  <div
                    className={styles.gameCardVisual}
                    style={{
                      backgroundImage: game.backgroundImage,
                      backgroundColor: game.backgroundColor,
                    }}
                  >
                    {!game.backgroundImage && <span className={styles.gameCardVisualLabel}>{game.title}</span>}
                  </div>

                  <div className={styles.gameCardBody}>
                    <div className={styles.gameMetaRow}>
                      <span className={classNames(styles.metaPill, styles.metaPillType)}>{game.typeLabel}</span>
                      <span className={classNames(styles.metaPill, styles.metaPillBuilds)}>
                        {game.versions.length + 1} builds
                      </span>
                    </div>
                    <h3>{game.title}</h3>
                    <p>{game.summary}</p>
                    <p className={styles.gameVotesCount}>{game.totalVotes} votes</p>
                    <button type="button" className={styles.actionButton} onClick={() => handleSelectGame(game.id)}>
                      <FaPlay />
                      Open game
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={classNames(styles.sectionHeading, styles.sectionHeadingSplit)}>
              <div>
                <p className={styles.sectionEyebrow}>Catalogue</p>
                <h2>Browse the full library</h2>
              </div>

              <div className={styles.catalogueControls}>
                <label className={styles.searchField}>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Find a game"
                  />
                </label>

                <div className={styles.filterGroup} role="tablist" aria-label="Game filters">
                  {[
                    ["all", "All"],
                    ["html", "HTML"],
                    ["native", "Native"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={classNames(styles.filterButton, {
                        [styles.filterButtonActive]: activeFilter === value,
                      })}
                      onClick={() => setActiveFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.catalogueGrid}>
              {filteredGames.map((game) => {
                const totalVotes = getTotalVotes(votes, game.id);

                return (
                  <article key={game.id} className={styles.gameCard}>
                    <div
                      className={classNames(styles.gameCardVisual, styles.gameCardVisualCompact)}
                      style={{
                        backgroundImage: game.backgroundImage,
                        backgroundColor: game.backgroundColor,
                      }}
                    >
                      {!game.backgroundImage && <span className={styles.gameCardVisualLabel}>{game.title}</span>}
                    </div>

                    <div className={styles.gameCardBody}>
                      <div>
                        <div className={styles.gameMetaRow}>
                          <span className={classNames(styles.metaPill, styles.metaPillType)}>{game.typeLabel}</span>
                          <span className={classNames(styles.metaPill, styles.metaPillBuilds)}>
                            {game.versions.length + 1} builds
                          </span>
                        </div>
                        <h3>{game.title}</h3>
                      </div>

                      <p className={styles.catalogueSummary}>{game.summary}</p>
                      <p className={styles.gameVotesCount}>{totalVotes} votes</p>

                      <div className={styles.catalogueFooter}>
                        <button
                          type="button"
                          className={classNames(styles.actionButton, styles.actionButtonCompact)}
                          onClick={() => handleSelectGame(game.id)}
                        >
                          <FaPuzzlePiece />
                          Play
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        <GamePage
          game={selectedGame}
          gamePath={gamePath}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          votesCount={votesCount}
          isVoted={isVoted}
          onVote={handleVote}
          onBack={() => setSelectedGameId(null)}
        />
      )}
    </div>
  );
};
