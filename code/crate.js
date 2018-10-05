import { Entity } from "./entity.js";
import { Goal } from "./goal.js";

export class Crate extends Entity {
  constructor(grid_) {
    super(grid_);
  }

  get parent() {
    return super.parent;
  }

  set parent(parent_) {
    if (parent_) {
      super.parent = parent_;
      super.parent.payload = this;
      this.location = null;
    } else {
      this.location = this.parent.location;
      super.parent.payload = null;
      super.parent = null;
    }
  }

  isLifted() {
    if (!this.parent)
      return false;
    const loc = this.parent.location;
    const aboveEntity = this._grid.get(loc.dh(1));
    if (aboveEntity instanceof Crate)
      return false;
    return true;
  }

  isOnGoal() {
    if (this.isLifted())
      return false;
    const loc = this.parent ? this.parent.location : this.location;
    const baseEntity = this._grid.get(loc.sh(0));
    if (!(baseEntity instanceof Goal))
      return false;
    return true;
  }
}
