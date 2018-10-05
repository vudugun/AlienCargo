import { Figure } from "./figure.js";

export class FloorFigure extends Figure {
  constructor(entity_, screen_) {
    super(entity_, screen_);
    this._createMesh();
  }

  initShadows(_shadowGenerator) {
    this._mesh.receiveShadows = true;
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("floor");
    this._initTransform();
    this._initMaterials();
  }

  _initTransform() {
    this._mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
  }

  _initMaterials() {
    this._mesh.material.ambientColor.set(0.1, 0.1, 0.1);
  }
}
