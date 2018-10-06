export class Aspect {
  constructor(screen_) {
    this._screen = screen_;
    this._mesh = null;
  }

  dispose() {
    this._mesh.dispose();
  }

  get position() {
    return this._mesh.position;
  }

  set position(position_) {
    this._mesh.position = position_;
  }

  get parentMesh() {
    return this._mesh.parent;
  }

  set parentMesh(mesh_) { 
    this._mesh.parent = mesh_;
  }

  set isVisible(flag_) {
    const mask = flag_ ? 0x0FFFFFFF : 0x0;
    this._mesh.layerMask = mask;
    for (const child of this._mesh.getChildMeshes(false))
      child.layerMask = mask;
  }

  // fadeIn/fadeOut require:
  // - material.forceDepthWrite = true;
  // - material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND; 
  fadeIn(time_) {
    const frames = time_ * 30;
    const from = this._mesh.visibility;
    const to = 1.0;
    const anim = this._createFadeAnimation(frames, from, to);
    this._mesh.animations = [];
    this._mesh.animations.push(anim);
    const scene = this._mesh.getScene();
    scene.beginAnimation(this._mesh);
  }

  fadeOut(time_) { 
    const frames = time_ * 30;
    const from = this._mesh.visibility;
    const to = 0;
    const anim = this._createFadeAnimation(frames, from, to);
    this._mesh.animations = [];
    this._mesh.animations.push(anim);
    const scene = this._mesh.getScene();
    scene.beginAnimation(this._mesh);
  }

  _createFadeAnimation(frames_, from_, to_) {
    const keys = [];
    keys.push({ frame: 0, value: from_ });
    keys.push({ frame: frames_, value: to_ });
    const anim = new BABYLON.Animation("fade", "visibility", 30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setKeys(keys);
    return anim;
  }
}