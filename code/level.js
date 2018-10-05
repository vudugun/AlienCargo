import { Location } from "./location.js";
import { Grid } from "./grid.js";
import { Wall } from "./wall.js";
import { Floor } from "./floor.js";
import { Goal } from "./goal.js";
import { Crate } from "./crate.js";
import { Forklift } from "./forklift.js";

export class Level {
  constructor(map_) {
    this._map = map_;
    this._createGrid();
  }

  dispose() {
    this._disposeGrid();
  }

  get number() {
    return this._map.number;
  }

  get solution() {
    return this._map.solution;
  }

  get grid() {
    return this._grid;
  }

  get movesCount() {
    return this._forklift.movesCount;
  }

  get cratesCount() {
    return this._grid.cratesCount + this._forklift.cratesCount;
  }

  get cratesOnGoal() {
    return this._grid.cratesOnGoal;
  }

  get goalsCount() {
    return this._grid.goalsCount;
  }

  get goalsWithCrates() {
    return this._grid.goalsWithCrates;
  }

  reset() {
    this._disposeGrid();
    this._createGrid();
  }

  move(action_) {
    this._forklift.move(action_);
  }

  isSolved() {
    if (this.cratesOnGoal !== this.cratesCount)
      return false;
    if (this.goalsWithCrates !== this.goalsCount)
      return false;
    return true;
  }

  _createGrid() {
    console.assert(!this._grid);
    const diagram = this._map.diagram;
    this._grid = new Grid();
    for (let h = 0, n1 = diagram.length; h < n1; ++h) {
      for (let r = 0, n2 = diagram[h].length; r < n2; ++r) {
        for (let c = 0, n3 = diagram[h][r].length; c < n3; ++c) {
          const glyph = diagram[h][r][c];
          const entity = this._createEntity(glyph);
          if (entity)
            entity.location = new Location(r, c, h);
        }
      }
    }
  }

  _createEntity(glyph_) {
    switch (glyph_) {
      case "#":
        return new Wall(this._grid);
      case ".":
        return new Floor(this._grid);
      case "x":
        return new Goal(this._grid);
      case "o":
        return new Crate(this._grid);
      case "^":
        this._forklift = new Forklift(this._grid, "n");
        return this._forklift;
      case ">":
        this._forklift = new Forklift(this._grid, "e");
        return this._forklift;
      case "v":
        this._forklift = new Forklift(this._grid, "s");
        return this._forklift;
      case "<":
        this._forklift = new Forklift(this._grid, "w");
        return this._forklift;
      case " ":
        break;
      default:
        console.error("Unknown element: " + glyph_);
        break;
    }
  }

  _disposeGrid() {
    if (this._grid) {
      this._grid.dispose();
      this._grid = null;
    }
  }
}
