import { Fighter } from "./core/Fighter.js";
import { Equipment } from "./core/Equipment.js";
import { BattleEngine } from "./core/BattleEngine.js";
import { abilities } from "./core/abilities.js";

const sword = new Equipment({
  id: "sword01",
  name: "Flaming Sword",
  slot: "weapon",
  stats: { atk: 10 },
  abilities: [abilities.fireStrike],
});

const helm = new Equipment({
  id: "helm01",
  name: "War Helm",
  slot: "head",
  stats: { hp: 20 },
  abilities: [abilities.battleCry],
});

const fireSword = new Equipment({
  id: "fireSword",
  name: "Flameblade",
  slot: "weapon",
  stats: { atk: 7 },
  set: "firelord",
});

const fireHelm = new Equipment({
  id: "fireHelm",
  name: "Cinder Helm",
  slot: "head",
  stats: { hp: 10 },
  set: "firelord",
});

const fireArmor = new Equipment({
  id: "fireArmor",
  name: "Lava Plate",
  slot: "body",
  stats: { hp: 20 },
  set: "firelord",
});

const fighterA = new Fighter({
  name: "Knight",
  baseStats: { hp: 100, atk: 5 },
  equipment: [fireSword, fireHelm, fireArmor],
});

const fighterB = new Fighter({
  name: "Bandit",
  baseStats: { hp: 90, atk: 7 },
  equipment: [sword, helm],
});

const battle = new BattleEngine([fighterA], [fighterB]);
battle.simulate();

console.log(battle.log.join("\n"));
