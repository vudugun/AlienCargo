import { Aspect } from "./aspect.js";

export class SpaceAspect extends Aspect {
  constructor(screen_) {
    super(screen_);
    this._createMesh();
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("space");
    this._initAnimations();
  }

  _initAnimations() {
    this._mesh.animations = [];
    this._mesh.animations.push(this._createSpaceAnimation());
    this._screen.scene.beginAnimation(this._mesh, 0, 800, true);
  }
  
  _createSpaceAnimation() {
    const axis = BABYLON.Vector3.Right();
    const angle = Math.PI * 2;
    const from = BABYLON.Vector3.Zero();
    const to = axis.multiplyByFloats(angle, angle, angle);
    const keys = [];
    keys.push({ frame: 0, value: from });
    keys.push({ frame: 800, value: to });
    const anim = new BABYLON.Animation("rotate", "rotation", 1,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys(keys);
    return anim;
  }
}
