import * as styles from "./game-frame.module.css";

export const GameFrame = ({game}) => (
  <>
    <iframe
      src={game}
      title="Game Frame"
      allowtransparency="true"
      scrolling="no"
      frameBorder="0"
      className={styles.iframeContainer}
    />
  </>
);
