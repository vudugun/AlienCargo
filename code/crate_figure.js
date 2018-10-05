import { Figure } from "./figure.js";
import { settings as $settings } from "./settings.js";

export class CrateFigure extends Figure {
  constructor(entity_, screen_) {
    super(entity_, screen_);
    this._isLifted = false;
    this._isOnGoal = false;
    this._createMesh();
    this._createSounds();
    this._updateGlow();
    this._initCallbacks();
    this._initEvents();
  }

  initShadows(shadowGenerator_) {
    shadowGenerator_.addShadowCaster(this._mesh);
    this._mesh.receiveShadows = true;
  }

  dispose() {
    this._disposeEvents();
    super.dispose();
  }

  get parentMesh() {
    return super.parentMesh;
  }

  set parentMesh(mesh_) {
    if (mesh_)
      this._onPick(mesh_);
    else
      this._onDrop();
    this._updateGlow();
    super.parentMesh = mesh_;
  }

  _initCallbacks() {
    this._settings_onOptionChangedCallback =
      this._settings_onOptionChanged.bind(this); 
  }

  _initEvents() {
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("crate");
    this._mesh.material = this._mesh.material.clone();
    this._initTransform();
    this._initMaterials();
  }

  _initTransform() {
    const { r, c, h } = this._entity.location;
    const idx = (r + c + h) % 4;
    const orientation = ["n", "e", "s", "w"][idx];
    this._mesh.rotationQuaternion =
      BABYLON.Quaternion.Orientation(orientation);
  }

  _initMaterials() {
    this._mesh.material.ambientColor.set(0.5, 0.5, 0.5);
  }
  
  _createSounds() {
    this._dropSound = this._screen.assets.getSound("drop");
    const volume = $settings.getOption("sound_effects_volume") / 100;
    this._dropSound.setVolume(volume);
  }

  _onPick(mesh_) {
    const m1 = mesh_.getWorldMatrix();
    const m2 = this._mesh.getWorldMatrix();
    const m3 = m2.multiply(BABYLON.Matrix.Invert(m1));
    m3.decompose(this._mesh.scaling, this._mesh.rotationQuaternion,
      this._mesh.position);
    if (this._entity.isLifted()) {
      this._isLifted = true;
      this._mesh.position.y += 0.05;
    }
  } 
  
  _onDrop() {
    const m1 = this._mesh.computeWorldMatrix(true);
    m1.decompose(this._mesh.scaling, this._mesh.rotationQuaternion,
      this._mesh.position);
    if (this._isLifted) {
      this._isLifted = false;
      this._mesh.position.y -= 0.05;
      this._dropSound.play();
    }
  }

  _updateGlow() {
    const isOnGoal = this._entity.isOnGoal();
    if (isOnGoal === this._isOnGoal)
      return;
    this._isOnGoal = isOnGoal;
    const anim = this._createGlowAnimation(isOnGoal);
    this._mesh.animations = [];
    this._mesh.animations.push(anim);
    const scene = this._mesh.getScene();
    scene.beginAnimation(this._mesh, 1);
  }

  _createGlowAnimation() {
    const keys = [];
    if (this._isOnGoal) {
      keys.push({ frame: 0, value: this._mesh.material.emissiveColor });
      keys.push({ frame: 10, value: new BABYLON.Color3(0.13, 0.13, 0.0) });
    } else {
      keys.push({ frame: 0, value: this._mesh.material.emissiveColor });
      keys.push({ frame: 5, value: new BABYLON.Color3(0.0, 0.0, 0.0) });
    }
    const anim = new BABYLON.Animation("glow", "material.emissiveColor", 30,
      BABYLON.Animation.ANIMATIONTYPE_COLOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setKeys(keys);
    return anim;
  }

  _settings_onOptionChanged(key_, value_) {
    if (key_ === "sound_effects_volume")
      this._dropSound.setVolume(value_ / 100);
  }
}
