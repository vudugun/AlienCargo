import { Aspect } from "./aspect.js";

export class Figure extends Aspect {
  constructor(entity_, screen_) {
    super(screen_);
    this._entity = entity_;
    this._entity.figure = this;
  }

  dispose() {
    super.dispose();
  }
}