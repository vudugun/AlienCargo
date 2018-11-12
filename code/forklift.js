import { Observable } from "./observable.js";
import { Compass } from "./compass.js";
import { Entity } from "./entity.js";
import { Crate } from "./crate.js";
import { Forks } from "./forks.js";

export class Forklift extends Entity {
  constructor(grid_, orientation_) {
    super(grid_);
    this._orientation = orientation_;
    this._moves = [];
    this._createForks();
    this._initCallbacks();
    this._initEvents();
  }

  dispose() {
    this._disposeEvents();
    super.dispose();
  }

  get location() {
    return super.location;
  }

  set location(location_) {
    super.location = location_;
    this._forks.updateLocation();
  }

  get orientation() {
    return this._orientation;
  }

  set orientation(orientation_) {
    this._orientation = orientation_;
    this._forks.updateLocation();
  }

  move(action_) {
    switch (action_) {
      case "n":
      case "e":
      case "s":
      case "w":
        if (action_ === this.orientation)
          this._moveForward(action_);
        else if (action_ === Compass.getOpposite(this.orientation))
          this._moveBackward(action_);
        else if (action_ === Compass.getCW(this.orientation))
          this._rotateCW(action_);
        else if (action_ === Compass.getCCW(this.orientation))
          this._rotateCCW(action_);
        break;
      case "F":
        this._moveForward(this.orientation);
        break;
      case "B":
        this._moveBackward(Compass.getOpposite(this.orientation));
        break;
      case "CW":
        this._rotateCW(Compass.getCW(this.orientation));
        break;
      case "CCW":
        this._rotateCCW(Compass.getCCW(this.orientation));
        break;
      case "1":
        this._moveForks(0);
        break;
      case "2":
        this._moveForks(1);
        break;
      case "3":
        this._moveForks(2);
        break;
      default:
        console.error("Unknown action: " + action_);
        break;
    }
  }

  get moves() {
    return this._moves;
  }

  get cratesCount() {
    return this._forks.cratesCount;
  }

  _createForks() {
    this._forks = new Forks(this._grid);
    this._forks.parent = this;
  }

  _initCallbacks() {
    this._forks_onMoveCallback = this._forks_onMove.bind(this);
  }

  _initEvents() {
    this.onMoveForward = new Observable();
    this.onMoveBackward = new Observable();
    this.onRotateCW = new Observable();
    this.onRotateCCW = new Observable();
    this.onForksMove = new Observable();
    this._forks.onMove.add(this._forks_onMoveCallback);
  }

  _disposeEvents() {
    this._forks.onMove.remove(this._forks_onMoveCallback);
  }

  _moveForward(direction_) {
    if (!this._canMoveForward(direction_))
      return;
    let payloadIn = null;
    const loc = this._forks.location.dd(direction_);
    const entity = this._grid.get(loc);
    if (entity instanceof Crate) {
      payloadIn = entity;
      payloadIn.parent = this._forks;
    }
    this.location = this.location.dd(direction_);
    this._moves.push("F");
    this.onMoveForward.notify(payloadIn);
  }

  _canMoveForward(direction_) {
    return this._canMoveForksForward(direction_) &&
      this._canMoveTractorForward(direction_);
  }

  _canMoveForksForward(direction_) {
    const loc = this._forks.location.dd(direction_);
    const entity = this._grid.get(loc);
    return !entity || entity instanceof Crate && !this._forks.payload;
  }

  _canMoveTractorForward(direction_) {
    for (let h = 0; h < 3; ++h) {
      if (h === this._forks.height)
        continue;
      const loc = this.location.dd(direction_).dh(h);
      const entity = this._grid.get(loc);
      if (entity)
        return false;
    }
    return true;
  }

  _moveBackward(direction_) {
    if (!this._canMoveBackward(direction_))
      return;
    let payloadOut = null;
    if (this._forks.payload) {
      const below = this._forks.location.dh(-1);
      const entityBelow = this._grid.get(below);
      if (entityBelow) {
        payloadOut = this._forks.payload;
        payloadOut.parent = null;
      }
    }
    this.location = this.location.dd(direction_);
    this._moves.push("B");
    this.onMoveBackward.notify(payloadOut);
  }

  _canMoveBackward(direction_) {
    const loc = this.location.dd(direction_);
    const entity = this._grid.get(loc);
    if (entity)
      return false;
    return true;
  }

  _rotateCW(direction_) {
    if (!this._canRotate(direction_))
      return;
    this.orientation = direction_;
    this._moves.push("CW");
    this.onRotateCW.notify();
  }

  _rotateCCW(direction_) {
    if (!this._canRotate(direction_))
      return;
    this.orientation = direction_;
    this._moves.push("CCW");
    this.onRotateCCW.notify();
  }

  _canRotate(direction_) {
    const loc1 = this._forks.location.dh(1);
    const entity1 = this._grid.get(loc1);
    if (entity1)
      return false;
    const loc2 = this._forks.location.dd(direction_);
    const entity2 = this._grid.get(loc2);
    if (entity2)
      return false;
    const loc3 = loc2.dd(Compass.getOpposite(this.orientation))
    const entity3 = this._grid.get(loc3);
    if (entity3)
      return false;
    return true;
  }

  _moveForks(height_) {
    this._forks.height = height_;
  }

  _forks_onMove(from_, to_) {
    this._moves.push(String(to_ + 1));
    this.onForksMove.notify(from_, to_);
  }
}
