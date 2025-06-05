export const abilities = {
  fireStrike: {
    name: "Fire Strike",
    onHit: (attacker, target, context) => {
      const burn = {
        name: "Burn",
        duration: 3,
        onTick: (f) => f.takeDamage(2),
      };
      target.applyStatus(burn);
      context.logger(`${attacker.name} applies 🔥 Burn to ${target.name}`);
    },
  },

  battleCry: {
    name: "Battle Cry",
    onStart: (fighter, context) => {
      fighter.baseStats.atk += 3;
      context.logger(`${fighter.name} roars with 💥 Battle Cry (ATK +3)`);
    },
  },

  thornMail: {
    name: "Thorns",
    onDamaged: (fighter, attacker, context) => {
      attacker.takeDamage(2);
      context.logger(
        `${attacker.name} takes 2 thorns damage from ${fighter.name}`
      );
    },
  },

  vengeance: {
    name: "Vengeance",
    onDeath: (fighter, context) => {
      const team = context.getTeam(fighter);
      team.forEach((f) => {
        if (f !== fighter && f.isAlive()) {
          f.baseStats.atk += 5;
          context.logger(
            `${f.name} gains +5 ATK in vengeance for ${fighter.name}`
          );
        }
      });
    },
  },
};
