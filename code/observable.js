export class Observable { 
  constructor() {
    this._callbacks = [];
  }

  add(callback_) {
    console.assert(this._callbacks.indexOf(callback_) === -1,
      "Duplicate callback: " + callback_);
    this._callbacks.push(callback_);
  }

  remove(callback_) {
    console.assert(this._callbacks.indexOf(callback_) >= 0,
      "Unknown callback: " + callback_);
    const index = this._callbacks.indexOf(callback_);
    this._callbacks.splice(index, 1);
  }

  notify(...args) {
    for (const callback of this._callbacks)
      callback(...args);
  }
}
