import classnames from "classnames";
import { useCallback, useState } from "react";
import { useGameStore } from "../../../../store";
import "./battle-log.css";

export const BattleLog = () => {
  const logs = useGameStore((state) => state.logs);
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return (
    <div className={classnames("battle-log-container", { collapsed: collapsed })}>
      <span className="battle-log-title" onClick={handleCollapse}>
        📜 Battle Log {collapsed ? "▲" : "▼"}
      </span>
      <div className="battle-log-logs-container">
        {logs.map((entry, i) => (
          <span key={i} className="battle-log-log">
            {entry}
          </span>
        ))}
      </div>
    </div>
  );
};
