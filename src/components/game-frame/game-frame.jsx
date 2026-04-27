import { useState, useEffect } from "react";
import * as styles from "./game-frame.module.css";

const gameModules = import.meta.glob("../../../node_modules/playground/games/**/*.html", {
  query: "?raw",
  import: "default",
  eager: false, // Set to true if you want them all loaded immediately
});

const loadGame = async (gamePath) => {
  // Construct the exact key used in the glob (must match the path above)
  const fullPath = `../../../node_modules/playground/${gamePath}`;

  if (gameModules[fullPath]) {
    // Calling the function returns the raw HTML string
    const htmlString = await gameModules[fullPath]();
    const blob = new Blob([htmlString], { type: "text/html" });
    return URL.createObjectURL(blob);
  } else {
    throw new Error(`Game not found: ${fullPath}`);
  }
};

export const GameFrame = ({ gamePath }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let isActive = true;

    loadGame(gamePath)
      .then((res) => {
        if (isActive) {
          setBlobUrl(res);
        } else {
          URL.revokeObjectURL(res);
        }
      })
      .catch((err) => {
        if (isActive) {
          setBlobUrl(null);
        }
        console.error(err);
      });

    return () => {
      isActive = false;

      setBlobUrl((currentBlobUrl) => {
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
        }

        return null;
      });
    };
  }, [gamePath]);

  return (
    blobUrl && (
      <>
        <iframe
          src={blobUrl}
          title="Game Frame"
          allowtransparency="true"
          scrolling="no"
          frameBorder="none"
          className={styles.iframeContainer}
        />
      </>
    )
  );
};
