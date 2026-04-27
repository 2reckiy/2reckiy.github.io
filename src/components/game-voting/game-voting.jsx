import { useCallback } from "react";
import classNames from "classnames";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import * as styles from "./game-voting.module.css";

export const GameVoting = ({ gameId, version, voted, votesCount, onVote, compact = false }) => {
  const handleVote = useCallback(() => {
    onVote(gameId, version);
  }, [onVote, gameId, version]);

  return (
    <div onClick={handleVote} className={classNames(styles.button, { [styles.compact]: compact })}>
      <div className={styles.content}>
        {voted ? <FaHeart /> : <FaRegHeart />}{" "}
        <span className={styles.votesCount}>
          <strong>{votesCount}</strong>
        </span>
      </div>
    </div>
  );
};
