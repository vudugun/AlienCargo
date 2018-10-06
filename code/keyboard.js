export class Keyboard {
  constructor() {
    this._keysDown = new Set();
    this._actions = null;
    this._keyDownListener = this._window_onKeyDown.bind(this);
    this._keyUpListener = this._window_onKeyUp.bind(this);
  }

  track(actions_) {
    this._actions = actions_;
    window.addEventListener("keydown", this._keyDownListener);
    window.addEventListener("keyup", this._keyUpListener);
  }

  untrack() {
    window.removeEventListener("keyup", this._keyUpListener);
    window.removeEventListener("keydown", this._keyDownListener);
    this._actions = null;
    this._keysDown.clear();
  }

  performActions() {
    for (const key of this._keysDown)
      this._actions.get(key)();
  }

  _window_onKeyDown(event_) {
    const key = event_.keyCode;
    if (!this._actions.has(key))
      return;
    event_.preventDefault();
    if (this._keysDown.has(key))
      return;
    this._keysDown.add(key);
    this._actions.get(key)();
  }

  _window_onKeyUp(event_) {
    const key = event_.keyCode;
    this._keysDown.delete(key);
  }
}
