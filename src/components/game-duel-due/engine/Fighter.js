import { EquipmentSets } from './EquipmentSet';

export class Fighter {
  constructor({ name, baseStats, equipment = [] }) {
    this.name = name;
    this.baseStats = baseStats;
    this.equipment = equipment;
    this.hp = this.getTotalStat("hp");
    this.statusEffects = [];
    this.abilities = this.getAbilitiesFromEquipment();
  }

  getSetBonuses() {
    const setCounts = {};
    for (const eq of this.equipment) {
      if (eq.set) {
        setCounts[eq.set] = (setCounts[eq.set] || 0) + 1;
      }
    }

    const bonuses = {
      stats: {},
      abilities: [],
    };

    for (const [setId, count] of Object.entries(setCounts)) {
      const set = EquipmentSets[setId];
      if (!set) continue;

      for (const tier of Object.keys(set.bonuses)
        .map((n) => parseInt(n))
        .sort((a, b) => a - b)) {
        if (count >= tier) {
          const bonus = set.bonuses[tier];
          // Stats
          for (const [stat, value] of Object.entries(bonus.stats || {})) {
            bonuses.stats[stat] = (bonuses.stats[stat] || 0) + value;
          }
          // Abilities
          if (bonus.abilities) bonuses.abilities.push(...bonus.abilities);
        }
      }
    }

    return bonuses;
  }

  getTotalStat(stat) {
    const base = this.baseStats[stat] || 0;
    const eq = this.equipment.reduce(
      (sum, eq) => sum + (eq.stats?.[stat] || 0),
      0
    );
    const set = this.getSetBonuses().stats?.[stat] || 0;
    return base + eq + set;
  }

  getAbilitiesFromEquipment() {
    const itemAbilities = this.equipment.flatMap((eq) => eq.abilities || []);
    const setAbilities = this.getSetBonuses().abilities || [];
    return [...itemAbilities, ...setAbilities];
  }

  trigger(event, ...args) {
    for (const ability of this.abilities) {
      if (ability[event]) {
        ability[event](this, ...args);
      }
    }
  }

  applyStatus(effect) {
    this.statusEffects.push({ ...effect });
  }

  tickStatusEffects() {
    this.statusEffects = this.statusEffects.filter((effect) => {
      effect.duration -= 1;
      if (effect.onTick) effect.onTick(this);
      return effect.duration > 0;
    });
  }

  isAlive() {
    return this.hp > 0;
  }

  takeDamage(amount, attacker = null, context = null) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.isAlive()) {
      this.trigger("onDamaged", attacker, context);
    } else {
      this.trigger("onDeath", context);
    }
  }

  attack(target, context) {
    const atk = this.getTotalStat("atk");
    target.takeDamage(atk, this, context);
    this.trigger("onHit", target, context);
  }
}
