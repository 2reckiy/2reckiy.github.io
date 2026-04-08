import React, { useCallback, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import * as styles from "./game-voting.module.css";

export const GameVoting = ({ gameId, version, voted, votesCount, onVote }) => {
  const handleVote = useCallback(() => {
    onVote(gameId, version);
  }, [onVote, gameId, version]);

  return (
    <div onClick={handleVote} className={styles.button}>
      <div className={styles.content}>
        {voted ? <FaHeart /> : <FaRegHeart />}{" "}
        <span className={styles.votesCount}>
          <strong>{votesCount}</strong>
        </span>
      </div>
    </div>
  );
};
