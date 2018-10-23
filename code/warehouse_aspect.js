import { Aspect } from "./aspect.js";

export class WarehouseAspect extends Aspect {
  constructor(screen_) {
    super(screen_);
    this._initImages();
    this._createMesh();
  }

  set level(number_) {
    this._drawLevel(number_);
  }

  _initImages() {
    this._digits = this._screen.assets.getImage("digits");
    this._baseImage = this._screen.assets.getImage("warehouse_base");
    this._scrapesMask = this._screen.assets.getImage("scrapes_mask");
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("warehouse");
    const meshes = this._mesh.getChildMeshes(true);
    this._warehouseMesh = meshes[2];
    this._fanMesh = meshes[3];
    this._initMaterials();
    this._initAnimations();
  }

  _initMaterials() {
    const matWarehouse = this._warehouseMesh.material;
    this._albedoTexture = this._createAlbedoTexture();
    matWarehouse.albedoTexture = this._albedoTexture;
  }
  
  _createAlbedoTexture() {
    const { width, height } = this._baseImage;
    const texture = new BABYLON.DynamicTexture(
      "", { width, height }, this._screen.scene);
    const ctx = texture.getContext();
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(this._baseImage, 0, -height + 1);
    ctx.restore();
    texture.update();
    return texture;
  }

  _initAnimations() {
    this._fanMesh.animations = [];
    this._fanMesh.animations.push(this._createFanAnimation());
    this._screen.scene.beginAnimation(this._fanMesh, 0, 6, true);
  }

  _createFanAnimation() {
    const from = BABYLON.Vector3.Zero();
    const to = new BABYLON.Vector3(0, -Math.PI * 2, 0);
    const keys = [];
    keys.push({ frame: 0, value: from });
    keys.push({ frame: 6, value: to });
    const anim = new BABYLON.Animation("rotate", "rotation", 1,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys(keys);
    return anim;
  }

  _drawLevel(number_) {
    const ctx = this._albedoTexture.getContext();
    const { width, height } = this._albedoTexture.getSize();
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(1, -1);
    // digits
    const digit1 = Math.floor(number_ / 10 % 10);
    const digit2 = number_ % 10;
    this._drawDigit(ctx, digit1, 600, 624);
    this._drawDigit(ctx, digit2, 160, 624);
    // scrapes
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(this._scrapesMask, 0, -height + 1);
    // base
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(this._baseImage, 0, -height + 1);
    ctx.restore();
    //
    this._albedoTexture.update();
  }

  _drawDigit(ctx_, digit_, tx_, ty_) {
    const w = 256;
    const h = 256;
    const sx = (digit_ % 4) * w;
    const sy = Math.floor(digit_ / 4) * h;
    ctx_.drawImage(this._digits, sx, sy, w, h, tx_, -ty_, w, h);
  }
}
