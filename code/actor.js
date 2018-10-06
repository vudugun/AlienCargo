import { Observable } from "./observable.js";
import { Figure } from "./figure.js";
import { Animation } from "./animation.js";

export class Actor extends Figure  {
  constructor(entity_, screen_) {
    super(entity_, screen_);
    this._idle = true;
    this._animations = []
    this._carries = new Map();
    this._initCallbacks();
    this._initEvents();
  }

  dispose() {
    this._disposeEvents();
    super.dispose();
  }

  get idle() {
    return this._idle;
  }

  set idle(idle_) {
    this._idle = idle_;
    if (this._idle)
      this.onIdle.notify();
  }

  _moveBy(mesh_, step_, frames_, {
        fps: fps_ = 30,
        group: group_ = "default",
        onFinished: onFinished_ = () => {}
      }) {
    this.idle = false;
    const from = mesh_.position;
    const to = from.add(step_);
    const keys = [
      { frame: 0, value: from },
      { frame: frames_, value: to }
    ];
    const carry = this._carries.get(group_) || 0;
    const anim = new Animation(mesh_, "position",
      BABYLON.Vector3.Lerp, keys, fps_, carry);
    anim.onFinished.add(carry_ => {
      this._carries.set(group_, carry_);
      const index = this._animations.indexOf(anim);
      this._animations.splice(index, 1);
      onFinished_();
      if (this._animations.length === 0)
        this.idle = true;
    });
    this._animations.push(anim);
  }

  _rotateBy(mesh_, step_, frames_, {
        fps: fps_ = 30,
        group: group_ = "default",
        onFinished: onFinished_ = () => {}
      }) {
    this.idle = false;
    const from = mesh_.rotationQuaternion;
    const to = from.multiply(step_);
    const keys = [
      { frame: 0, value: from },
      { frame: frames_, value: to }
    ];
    const carry = this._carries.get(group_) || 0;
    const anim = new Animation(mesh_, "rotationQuaternion",
      BABYLON.Quaternion.Slerp, keys, fps_, carry);
    anim.onFinished.add(carry_ => {
      this._carries.set(group_, carry_);
      const index = this._animations.indexOf(anim);
      this._animations.splice(index, 1);
      onFinished_();
      if (this._animations.length === 0)
        this.idle = true;
    });
    this._animations.push(anim);
  }

  _initCallbacks() {
    this._scene_onBeforeRenderCallback = this._scene_onBeforeRender.bind(this);
  }

  _initEvents() {
    this.onIdle = new Observable();
    this._screen.scene.registerBeforeRender(this._scene_onBeforeRenderCallback);
  }

  _disposeEvents() {
    this._screen.scene.unregisterBeforeRender(this._scene_onBeforeRenderCallback);
  }

  _scene_onBeforeRender() {
    this._carries.clear();
    const timeDelta_ = this._screen.scene.getEngine().getDeltaTime();
    for (const anim of [...this._animations]) // loop on a copy
      anim.update(timeDelta_);
  }
}
