export class Maps {
  constructor(screen_) {
    this._screen = screen_;
  }

  init() {
    const json = this._screen.assets.getText("maps");
    this._maps = JSON.parse(json);
  }

  getCount(pack_) {
    return this._maps[pack_].length;
  }

  get(pack_, i_) {
    return this._maps[pack_][i_ - 1];
  }
}