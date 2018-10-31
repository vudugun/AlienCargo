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
    this._screen.scene.beginAnimation(this._mesh, 0, 1200, true);
  }
  
  _createSpaceAnimation() {
    const y = -Math.PI + Math.random() * Math.PI * 2;
    const from = new BABYLON.Vector3(0, y, 0);
    const to = new BABYLON.Vector3(Math.PI * 2, y, 0);
    const keys = [];
    keys.push({ frame: 0, value: from });
    keys.push({ frame: 1200, value: to });
    const anim = new BABYLON.Animation("rotate", "rotation", 1,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys(keys);
    return anim;
  }
}
