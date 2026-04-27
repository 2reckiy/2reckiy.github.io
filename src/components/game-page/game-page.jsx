import { useState } from "react";
import classNames from "classnames";
import { FaArrowLeftLong, FaCompress, FaExpand } from "react-icons/fa6";
import { AudioProvider } from "../../providers/audio-provider";
import { GameFrame } from "../game-frame/game-frame";
import { GameVoting } from "../game-voting/game-voting";
import styles from "./game-page.module.css";

export const GamePage = ({
  game,
  gamePath,
  selectedVersion,
  setSelectedVersion,
  votesCount,
  isVoted,
  onVote,
  onBack,
}) => {
  const [isFocused, setIsFocused] = useState(true);

  return (
    <div className={classNames(styles.gamePage, { [styles.gamePageFocused]: isFocused })}>
      <header className={classNames(styles.gameHeader, { [styles.gameHeaderCompact]: isFocused })}>
        <div className={styles.gameHeaderMain}>
          <div className={styles.gameHeaderLead}>
            <button
              type="button"
              className={styles.backButton}
              onClick={onBack}
              aria-label="Back to library"
            >
              <FaArrowLeftLong />
            </button>

            <div className={styles.gameHeading}>
              <p className={styles.sectionEyebrow}>Now playing</p>
              <h2>{game.title}</h2>
            </div>
          </div>

          <div className={styles.gameTools}>
            <button type="button" className={styles.ghostButton} onClick={() => setIsFocused((current) => !current)}>
              {isFocused ? <FaExpand /> : <FaCompress />}
              {isFocused ? "Details" : "Full screen"}
            </button>

            <div className={classNames(styles.gameSelectWrap, {[styles.gameSelectWrapSingle]: !game.versions?.length})}>
              {game.versions?.length ? (
                <select
                  className={styles.gameSelect}
                  aria-label="Select build"
                  value={selectedVersion}
                  onChange={(event) => setSelectedVersion(event.target.value)}
                >
                  <option value="">Origin</option>
                  {game.versions.map((version) => (
                    <option key={`${game.id}-${version}`} value={version}>
                      {version}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.gameBadge}>Origin</span>
              )}
            </div>

            <GameVoting
              gameId={game.id}
              version={selectedVersion}
              votesCount={votesCount}
              voted={isVoted}
              onVote={onVote}
              compact={isFocused}
            />
          </div>
        </div>
      </header>

      <main className={styles.gameMain}>
        {!isFocused && (
          <section className={styles.gameInfoPanel}>
            <div className={styles.gameInfoBlock}>
              <p className={styles.sectionEyebrow}>Project</p>
              <h3>{game.title}</h3>
            </div>

            <div className={styles.gameInfoBlock}>
              <p>{game.summary}</p>
            </div>

            <div className={styles.gameInfoGrid}>
              <div>
                <span className={styles.infoLabel}>Type</span>
                <strong>{game.isFramed ? "HTML archive" : "Native React"}</strong>
              </div>
              <div>
                <span className={styles.infoLabel}>Builds</span>
                <strong>{game.versions.length + 1}</strong>
              </div>
            </div>
          </section>
        )}

        <section className={styles.gameContent}>
          <AudioProvider>
            {game.isFramed ? <GameFrame gamePath={gamePath} /> : game.render && <game.render />}
          </AudioProvider>
        </section>
      </main>
    </div>
  );
};
