import { Observable } from "./observable.js"

export class Animation {
  constructor(mesh_, attribute_, lerp_, keys_, fps_, carry_ = 0) {
    this._mesh = mesh_;
    this._attribute = attribute_;
    this._lerp = lerp_;
    this._keys = keys_;
    this._fps = fps_;
    this._elapsed = 0;
    this._index = 0;
    this.onFinished = new Observable();
    if (carry_ > 0)
      this.update(carry_);
  }

  update(timeDelta_) {
    this._elapsed += timeDelta_;
    let frameNum = this._elapsed * this._fps / 1000;
    while (frameNum >= this._nextKey().frame) {
      if (!this._advance()) {
        frameNum = this._nextKey().frame;
        this._updateAttribute(frameNum);
        const carry = this._elapsed - frameNum * 1000 / this._fps;
        this.onFinished.notify(carry);
        return;
      }
    }
    this._updateAttribute(frameNum);
  }

  _updateAttribute(frameNum_) {
    const key1 = this._prevKey();
    const key2 = this._nextKey();
    const ratio = frameNum_ / (key2.frame - key1.frame);
    this._mesh[this._attribute] = this._lerp(key1.value, key2.value, ratio);
  }

  _prevKey() {
    return this._keys[this._index];
  }

  _nextKey() {
    return this._keys[this._index + 1];
  }

  _advance() {
    if (this._index === this._keys.length - 2)
      return false;
    ++this._index;
    return true;
  }
}
