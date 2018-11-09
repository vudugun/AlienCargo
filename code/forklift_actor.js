import { Actor } from "./actor.js";
import { settings as $settings } from "./settings.js";

export class ForkliftActor extends Actor {
  constructor(entity_, screen_) {
    super(entity_, screen_); // calls _initCallbacks(), _initEvents()
    this._createMesh();
    this._createRoot();
  }

  dispose() {
    this._disposeRoot();
    super.dispose(); // calls _disposeEvents()
  }

  initShadows(shadowGenerator_) {
    shadowGenerator_.addShadowCaster(this._mesh);
  }

  _initCallbacks() {
    super._initCallbacks();
    this._entity_onMoveForwardCallback = this._entity_onMoveForward.bind(this);
    this._entity_onMoveBackwardCallback = this._entity_onMoveBackward.bind(this);
    this._entity_onRotateCWCallback = this._entity_onRotateCW.bind(this);
    this._entity_onRotateCCWCallback = this._entity_onRotateCCW.bind(this);
    this._entity_onForksMoveCallback = this._entity_onForksMove.bind(this);
  }

  _initEvents() {
    super._initEvents();
    this._entity.onMoveForward.add(this._entity_onMoveForwardCallback);
    this._entity.onMoveBackward.add(this._entity_onMoveBackwardCallback);
    this._entity.onRotateCW.add(this._entity_onRotateCWCallback);
    this._entity.onRotateCCW.add(this._entity_onRotateCCWCallback);
    this._entity.onForksMove.add(this._entity_onForksMoveCallback);
  }

  _disposeEvents() {
    this._entity.onMoveForward.remove(this._entity_onMoveForwardCallback);
    this._entity.onMoveBackward.remove(this._entity_onMoveBackwardCallback);
    this._entity.onRotateCW.remove(this._entity_onRotateCWCallback);
    this._entity.onRotateCCW.remove(this._entity_onRotateCCWCallback);
    this._entity.onForksMove.remove(this._entity_onForksMoveCallback);
    super._disposeEvents();
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("forklift");
    const meshes = this._mesh.getChildMeshes(true);
    this._forksMesh = meshes[0];
    this._mastMesh = meshes[1];
    this._tractorLeftMesh = meshes[2];
    this._tractorRightMesh = meshes[3];
    this._initTransform();
    this._initMaterials();
  }

  _initTransform() {
    this._mesh.rotationQuaternion =
      BABYLON.Quaternion.Orientation(this._entity.orientation);
    this._tractorLeftMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    this._tractorRightMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
  }

  _initMaterials() {
    this._forksMesh.material.ambientColor.set(1.0, 1.0, 1.0);
    this._mastMesh.material.ambientColor.set(1.0, 1.0, 1.0);
    this._tractorLeftMesh.material.ambientColor.set(1.0, 1.0, 1.0);
    this._tractorRightMesh.material.ambientColor.set(1.0, 1.0, 1.0);
  }

  _createRoot() {
    this._root = new BABYLON.TransformNode("forklift_root");
    this._root.rotationQuaternion = BABYLON.Quaternion.Identity();
    this._root.parent = this._mesh.parent;
    this._mesh.parent = this._root;
  }

  _disposeRoot() {
    this._root.dispose();
  }

  _updateRoot() {
    const m1 = BABYLON.Matrix.Compose(this._root.scaling,
      this._root.rotationQuaternion, this._root.position);
    const m2 = BABYLON.Matrix.Compose(this._mesh.scaling,
      this._mesh.rotationQuaternion, this._mesh.position);
    const m3 = m2.multiply(m1);
    m3.decompose(this._root.scaling, this._root.rotationQuaternion,
      this._root.position);
    this._mesh.position.set(0, 0, 0);
    this._mesh.rotationQuaternion = BABYLON.Quaternion.Identity();
    this._mesh.scaling = BABYLON.Vector3.One();
  }

  _moveForklift(step_, frames_, onFinished_) {
    this._updateRoot();
    this._moveBy(this._mesh, step_, frames_, {
      group: "forklift",
      onFinished: onFinished_
    });
  }

  _rotateForklift(step_, frames_) {
    this._rotateBy(this._mesh, step_, frames_, { group: "forklift" });
  }

  _rotateTractor(angleLeft_, angleRight_, frames_) {
    const right = BABYLON.Vector3.Right();
    const stepLeft = BABYLON.Quaternion.RotationAxis(right, angleLeft_);
    const stepRight = BABYLON.Quaternion.RotationAxis(right, angleRight_);
    this._rotateBy(this._tractorLeftMesh, stepLeft, frames_, {
      group: "tractor_left" });
    this._rotateBy(this._tractorRightMesh, stepRight, frames_, {
      group: "tractor_right" });
  }

  _moveForks(step_, frames_) {
    this._moveBy(this._forksMesh, step_, frames_, { group: "forklift" });
  }

  _entity_onMoveForward(payloadIn_) {
    const step = BABYLON.Vector3.Forward();
    const frames = 9 - $settings.getOption("forklift_speed");
    this._moveForklift(step, frames, () => {
      if (payloadIn_) {
        this._mesh.computeWorldMatrix(true);
        this._forksMesh.computeWorldMatrix(true);
        payloadIn_.figure.parentMesh = this._forksMesh;
      }
    });
    this._rotateTractor(Math.PI, Math.PI, frames);
  }

  _entity_onMoveBackward(payloadOut_) {
    if (payloadOut_) {
      this._mesh.computeWorldMatrix(true);
      this._forksMesh.computeWorldMatrix(true);
      payloadOut_.figure.parentMesh = null;
    }
    const step = BABYLON.Vector3.Forward().negate();
    const frames = 9 - $settings.getOption("forklift_speed");
    this._moveForklift(step, frames);
    this._rotateTractor(-Math.PI, -Math.PI, frames);
  }

  _entity_onRotateCW() {
    this._updateRoot();
    const axis = BABYLON.Vector3.Up();
    const step = BABYLON.Quaternion.CW(axis);
    const frames = 8 - $settings.getOption("rotation_speed");
    this._rotateForklift(step, frames);
    this._rotateTractor(Math.PI / 2, -(Math.PI / 2), frames);
  }

  _entity_onRotateCCW() {
    this._updateRoot();
    const axis = BABYLON.Vector3.Up();
    const step = BABYLON.Quaternion.CCW(axis);
    const frames = 8 - $settings.getOption("rotation_speed");
    this._rotateForklift(step, frames);
    this._rotateTractor(-(Math.PI / 2), Math.PI / 2, frames);
  }

  _entity_onForksMove(from_, to_) {
    const delta = to_ - from_;
    const step = new BABYLON.Vector3(0, delta, 0);
    const frames = 7 - $settings.getOption("forks_speed");
    this._moveForks(step, frames);
  }
}
