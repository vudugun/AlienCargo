export class UI {
  constructor(screen_) {
    this._screen = screen_;
    this._alphas = new Map();
    this._fadeFPS = 30;
    this._ui = null;
  }

  set isEnabled(flag_) {
    this._ui.executeOnAllControls(c => c.isEnabled = flag_);
  }

  set isVisible(flag_) {
    this._ui.layer.layerMask = flag_ ? 0x0FFFFFFF : 0x0;
  }

  get isVisible() {
    this._ui.layer.layerMask === 0x0FFFFFFF;
  }

  set alpha(alpha_) {
    this._ui.executeOnAllControls(c => c.alpha = alpha_);
  }

  fadeIn(duration_, onFinished_ = () => {}) {
    console.assert(this._alphas.size > 0);
    const id = window.setInterval(() => {
      let left = 0;
      this._ui.executeOnAllControls(c => {
        ++left;
        const step = 1000 / (this._fadeFPS * duration_);
        const target = this._alphas.get(c.name);
        c.alpha = Math.min(target, c.alpha + step);
        if (c.alpha === target)
          --left;
      })
      if (left === 0) {
        window.clearInterval(id);
        onFinished_();
      }
    }, 1000 / this._fadeFPS);
  }

  fadeOut(duration_, onFinished_ = () => {}) {
    const id = window.setInterval(() => {
      let left = 0;
      this._ui.executeOnAllControls(c => {
        ++left;
        const step = 1000 / (this._fadeFPS * duration_);
        c.alpha = Math.max(0, c.alpha - step);
        if (c.alpha === 0)
          --left;
      })
      if (left === 0) {
        window.clearInterval(id);
        onFinished_();
      }
    }, 1000 / this._fadeFPS);
  }

  _saveAlpha() {
    this._alphas.clear();
    this._ui.executeOnAllControls(c => {
      this._alphas.set(c.name, c.alpha);
    });
  }
}
