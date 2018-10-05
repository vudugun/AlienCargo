import { Crate } from "./crate.js";
import { Goal } from "./goal.js";

export class Grid {
  constructor() {
    this._grid = [];
    this._cratesCount = 0;
    this._cratesOnGoal = 0;
    this._goalsCount = 0;
    this._goalsWithCrates = 0;
  }

  dispose() {
    for (let r = 0, n1 = this.getRowCount(); r < n1; ++r) {
      for (let c = 0, n2 = this.getColumnCount(r); c < n2; ++c) {
        for (let h = 0, n3 = this.getHeight(r, c); h < n3; ++h) {
          const entity = this.getRCH(r, c, h);
          if (entity)
            entity.dispose();
        }
      }
    }
    this._grid = null;
  }

  get cratesCount() {
    return this._cratesCount;
  }
  
  get cratesOnGoal() {
    return this._cratesOnGoal;
  }

  get goalsCount() {
    return this._goalsCount;
  }

  get goalsWithCrates() {
    return this._goalsWithCrates;
  }

  getRowCount() {
    return this._grid.length;
  }

  getColumnCount(r_) {
    if (this._grid[r_] === undefined)
      return 0;
    return this._grid[r_].length;
  }

  getHeight(r_, c_) {
    if (this._grid[r_] === undefined)
      return 0;
    if (this._grid[r_][c_] === undefined)
      return 0;
    return this._grid[r_][c_].length;
  }

  get({ r, c, h }) {
    return this.getRCH(r, c, h);
  }

  getRCH(r_, c_, h_) {
    if (this._grid[r_] === undefined)
      return undefined;
    if (this._grid[r_][c_] === undefined)
      return undefined;
    return this._grid[r_][c_][h_];
  }

  set({r, c, h }, entity_) {  
    this.setRCH(r, c, h, entity_);
  }

  setRCH(r_, c_, h_, entity_) { 
    if (this._grid[r_] === undefined)
      this._grid[r_] = [];
    if (this._grid[r_][c_] === undefined)
      this._grid[r_][c_] = [];
    const entity = this._grid[r_][c_][h_];
    this._updateCounters(r_, c_, h_, entity, -1);
    this._grid[r_][c_][h_] = entity_;
    this._updateCounters(r_, c_, h_, entity_, 1);
  }

  _updateCounters(r_, c_, h_, entity_, delta_) {
    if (entity_ instanceof Goal) {
      this._goalsCount += delta_;
    } else if (entity_ instanceof Crate) {
      this._cratesCount += delta_;
      const base = this.getRCH(r_, c_, 0);
      if (base instanceof Goal) {
        this._cratesOnGoal += delta_;
        if (h_ === 1)
          this._goalsWithCrates += delta_;
      }
    }
  }
}
