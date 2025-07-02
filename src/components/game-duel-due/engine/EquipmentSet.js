export const EquipmentSets = {
  firelord: {
    name: "Firelord Set",
    bonuses: {
      2: {
        stats: { atk: 5 },
      },
      3: {
        abilities: [
          {
            name: "Flame Aura",
            onStart: (fighter, context) => {
              context.logger(`${fighter.name} activates 🔥 Flame Aura (deals 3 dmg to all enemies)`);
              const enemies = context.getEnemies(fighter);
              enemies.forEach((e) => e.takeDamage(3, fighter, context));
            },
          },
        ],
      },
    },
  },

  guardian: {
    name: "Guardian Set",
    bonuses: {
      2: {
        stats: { hp: 20 },
      },
      4: {
        abilities: [
          {
            name: "Shield Wall",
            onStart: (fighter, context) => {
              fighter.baseStats.hp += 30;
              context.logger(`${fighter.name} gains +30 HP from 🛡️ Shield Wall`);
            },
          },
        ],
      },
    },
  },
};
