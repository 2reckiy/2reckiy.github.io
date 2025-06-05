export class Equipment {
  constructor({ id, name, slot, stats = {}, abilities = [], set = null }) {
    this.id = id;
    this.name = name;
    this.slot = slot;
    this.stats = stats;
    this.abilities = abilities;
    this.set = set;
  }
}
