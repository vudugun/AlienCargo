export class Keyboard {
  constructor(scene_) {
    this._scene = scene_;
    this._keysDown = new Set();
    this._actions = null;
    this._onKeyboardCallback = this._scene_onKeyboard.bind(this);
  }

  track(actions_) {
    this._actions = actions_;
    this._scene.onKeyboardObservable.add(this._onKeyboardCallback);
  }

  untrack() {
    this._scene.onKeyboardObservable.removeCallback(this._onKeyboardCallback);
    this._actions = null;
    this._keysDown.clear();
  }

  performActions() {
    for (const key of this._keysDown)
      this._actions.get(key)();
  }

  _scene_onKeyboard(info_) {
    if (info_.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
      const key = info_.event.keyCode;
      if (!this._actions.has(key))
        return;
      info_.event.preventDefault();
      if (this._keysDown.has(key))
        return;
      this._keysDown.add(key);
      this._actions.get(key)();
    } else if (info_.type === BABYLON.KeyboardEventTypes.KEYUP) {
      const key = info_.event.keyCode;
      this._keysDown.delete(key);
    }
  }
}
