import { Figure } from "./figure.js";

export class GoalFigure extends Figure {
  constructor(entity_, screen_) {
    super(entity_, screen_);
    this._initImages();
    this._createMesh();
  }

  initShadows(_shadowGenerator) {
    this._mesh.receiveShadows = true;
  }

  _initImages() {
    this._baseImage = this._screen.assets.getImage("goal_base");
    this._decalImage = this._screen.assets.getImage("goal_decal");
    this._scrapesMask = this._screen.assets.getImage("scrapes_mask");
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("goal");  
    this._mesh.material = this._mesh.material.clone();
    this._initTransform();
    this._initMaterials();
  }

  _initTransform() {
    this._mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
  }

  _initMaterials() {
    const matGoal = this._mesh.material;
    matGoal.albedoTexture = this._createAlbedoTexture();
    matGoal.ambientColor.set(0.15, 0.15, 0.15);
  }

  _createAlbedoTexture() {
    const { width, height } = this._baseImage;
    const texture = new BABYLON.DynamicTexture(
      "", { width, height }, this._screen.scene);
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(this._decalImage, 0, -height + 1);
    ctx.globalCompositeOperation = "destination-out";
    const sw = 128, sh = 128, tw = 512, th = 512;
    const sx = this._entity.location.c % (width / sw) * sw;
    const sy = this._entity.location.r % (height / sh) * sh;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(this._scrapesMask, sx, sy, sw, sh, 0, -th, tw, th);
    ctx.restore();
    ctx.globalCompositeOperation = "color-burn";
    ctx.drawImage(this._baseImage, 0, -height + 1);
    ctx.restore();
    texture.update();
    return texture;
  }
}