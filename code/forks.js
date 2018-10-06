import { Observable } from "./observable.js";
import { Entity } from "./entity.js";
import { Crate } from "./crate.js";

export class Forks extends Entity {
  constructor(grid_) {
    super(grid_);
    this._height = 0;
    this.payload = null;
    this._movesCount = 0;
    this._initEvents();
  }

  get height() {
    return this._height;
  }

  set height(height_) {
    if (height_ === this._height)
      return;
    if (!this._canMove(height_))
      return;
    const from = this._height;
    this._height = height_;
    this._updateLocation();
    ++this._movesCount;
    this.onMove.notify(from, this._height);
  }

  get movesCount() {
    return this._movesCount;
  }

  get cratesCount() {
    return this.payload instanceof Crate ? 1 : 0;
  }

  onForkliftLocationChanged() {
    this._updateLocation();
  }

  _initEvents() {
    this.onMove = new Observable();
  }

  _canMove(height_) {
    const h1 = Math.min(this.height, height_);
    const h2 = Math.max(this.height, height_);
    for (let h = h1; h <= h2; ++h) {
      if (h === this.height)
        continue;
      const loc = this._computeLocation(h);
      const entity = this._grid.get(loc);
      if (entity)
        return false;
    }
    return true;
  }

  _updateLocation() {
    this.location = this._computeLocation(this.height);
  }

  _computeLocation(height_) {
    const loc = this.parent.location;
    const ori = this.parent.orientation;
    return loc.dd(ori).dh(height_);
  }
}
