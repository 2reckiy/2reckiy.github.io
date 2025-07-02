import { useEffect, useRef, useState } from "react";
import { abilities } from "../../engine/abilities";
import { BattleEngine } from "../../engine/BattleEngine";
import { Equipment } from "../../engine/Equipment";
import { Fighter } from "../../engine/Fighter";
import { useGameStore } from "../../store";
import "./arena.css";
import { BattleLog } from "./components/battle-log/battle-log";
import { FighterCard } from "./components/fighter-card/fighter-card";
import { WinScreen } from "./components/win-screen/win-screen";

export const Arena = () => {
  const engineRef = useRef(null);
  const battleStart = useGameStore((state) => state.battleStart);
  const battleEnd = useGameStore((state) => state.battleEnd);
  const [fighters, setFighters] = useState({ teamA: [], teamB: [] });

  useEffect(() => {
    const sword = new Equipment({
      id: "fireSword",
      name: "Flameblade",
      slot: "weapon",
      stats: { atk: 7 },
      set: "firelord",
      abilities: [abilities.fireStrike],
    });

    const helm = new Equipment({
      id: "fireHelm",
      name: "Cinder Helm",
      slot: "head",
      stats: { hp: 10 },
      set: "firelord",
    });

    const armor = new Equipment({
      id: "fireArmor",
      name: "Lava Plate",
      slot: "body",
      stats: { hp: 20 },
      set: "firelord",
    });

    const f1 = new Fighter({
      name: "Ash Knight",
      baseStats: { hp: 100, atk: 5 },
      equipment: [sword, helm, armor],
    });

    const f2 = new Fighter({
      name: "Dummy",
      baseStats: { hp: 100, atk: 5 },
    });

    const battleEngine = new BattleEngine({
      store: useGameStore.getState(),
      teams: [[f1], [f2]],
    });
    engineRef.current = battleEngine;

    setFighters({ teamA: [f1], teamB: [f2] });
  }, []);

  function startBattle() {
    engineRef.current.simulate();
  }

  function handleBattleBack() {
    engineRef.current.end();
  }

  return (
    <div className="game-duel-due-container">
      {battleStart && (
        <div className="game-duel-due-battle-container">
          <div className="duel-due-fighters-container">
            {fighters.teamA.map((f) => (
              <FighterCard key={f.name} fighter={f} />
            ))}
            <span className="vs">vs</span>
            {fighters.teamB.map((f) => (
              <FighterCard key={f.name} fighter={f} />
            ))}
          </div>
          <BattleLog />
        </div>
      )}

      {!battleStart && (
        <div className="game-duel-due-battle-preview-container">
          <button onClick={startBattle} className="start-battle-buutton">
            ▶️ Start Battle
          </button>
        </div>
      )}

      {battleEnd && <WinScreen onBack={handleBattleBack} />}
    </div>
  );
};
