import { Location } from "./location.js";

export class Entity { 
  constructor(grid_) {
    this._grid = grid_;
    this._parent = null;
    this._location = null;
  }

  dispose() {}

  get parent() {
    return this._parent;
  }

  set parent(parent_) {
    this._parent = parent_;
  }

  get location() {
    return this._location;
  }

  set location(location_) {
    console.assert(!Location.equal(location_, this._location));
    if (this._location)
      this._grid.set(this._location, undefined);
    this._location = location_;
    if (this._location) {
      const entity = this._grid.get(this._location);
      if (entity)
        entity.location = null;
      this._grid.set(this._location, this);
    }
  }
}