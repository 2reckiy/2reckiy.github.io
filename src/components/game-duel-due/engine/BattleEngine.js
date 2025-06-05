import { wait } from '../utils';

export class BattleEngine {
  constructor({ store, teams }) {
    this.store = store;
    this.teams = teams;
    this.fighters = teams.flat();
    this.currentRound = 0;
    this.round = 1;
    this.log = [];
  }

  async simulate() {
    this.store.setBattleStart(true);

    const context = {
      logger: (log) => this.#logger(log),
      getTeam: (fighter) => (this.teams[0].includes(fighter) ? this.teams[0] : this.teams[1]),
      getEnemies: (fighter) => (this.teams[0].includes(fighter) ? this.teams[1] : this.teams[0]),
    };

    for (const f of this.teams.flat()) {
      f.trigger("onStart", context);
    }

    // while (this.teams[0].some((f) => f.isAlive()) && this.teams[1].some((f) => f.isAlive())) {
    //   this.#simulateRound(context);
    // }
    await this.#simulateRound(context);

    const winner = this.teams[0].some((f) => f.isAlive()) ? "Team A" : "Team B";
    this.#logger(`🏆 Winner: ${winner}`);
    this.store.setWinner(winner);
    this.store.setBattleEnd(true);
    return winner;
  }

  end() {
    this.store.reset();
  }

  async #simulateRound(context) {
    this.#logger(`🔁 Round ${this.round}`);
    await wait(2000);
    const fighters = this.fighters.filter((f) => f.isAlive());

    for (const f of fighters) f.tickStatusEffects();

    for (const attacker of fighters) {
      if (!attacker.isAlive()) continue;
      const target = this.#pickTarget(attacker);
      if (target) {
        attacker.attack(target, context);
        this.#logger(`${attacker.name} attacks ${target.name} (${target.hp} HP left)`);
      }
    }

    this.round++;

    if (this.#checkBattleEnd()) {
      return;
    }

    await this.#simulateRound(context);
    //
    // const roundLog = [];
    // const all = [...this.teamA, ...this.teamB].filter((f) => f.isAlive());
    // all.forEach((f) => {
    //   f.processAbilities("onStart", this, roundLog);
    // });

    // for (const attacker of this.teamA) {
    //   const target = this.teamB.find((f) => f.isAlive());
    //   if (attacker.isAlive() && target) {
    //     const dmg = attacker.getTotalStat("atk");
    //     target.takeDamage(dmg, attacker, this, roundLog);
    //   }
    // }

    // for (const attacker of this.teamB) {
    //   const target = this.teamA.find((f) => f.isAlive());
    //   if (attacker.isAlive() && target) {
    //     const dmg = attacker.getTotalStat("atk");
    //     target.takeDamage(dmg, attacker, this, roundLog);
    //   }
    // }
    // this.rounds.push(roundLog);
  }

  #pickTarget(attacker) {
    const enemies = this.teams[0].includes(attacker) ? this.teams[1] : this.teams[0];
    return enemies.find((e) => e.isAlive());
  }

  #checkBattleEnd() {
    return !this.teams[0].some((f) => f.isAlive()) || !this.teams[1].some((f) => f.isAlive());
  }

  #logger(log) {
    this.log.push(log);
    console.log(log);
    this.store.addLog(log);
  }
}
