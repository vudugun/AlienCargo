import { Aspect } from "./aspect.js";

export class SpaceAspect extends Aspect {
  constructor(screen_) {
    super(screen_);
    this._createMesh();
    this._initCallbacks();
    this._initEvents();
  }

  dispose() {
    this._disposeEvents();
    super.dispose();
  }

  _createMesh() {
    this._mesh = this._screen.assets.createMesh("space");
    this._initAnimation();
  }

  _initAnimation() {
    const texture = this._mesh.material.emissiveTexture;
    texture.uOffset = Number.EPSILON; // WORKAROUND: zero does not work
    texture.vOffset = Number.EPSILON; // WORKAROUND: zero does not work
    const angle = Math.random() * Math.PI * 2;
    this._stepU = Math.sin(angle) / 200000;
    this._stepV = Math.cos(angle) / 200000;
  }

  _initCallbacks() {
    this._scene_onBeforeRenderCallback = this._scene_onBeforeRender.bind(this);
  }

  _initEvents() {
    this._screen.scene.registerBeforeRender(this._scene_onBeforeRenderCallback);
  }

  _disposeEvents() {
    this._screen.scene.unregisterBeforeRender(this._scene_onBeforeRenderCallback);
  }

  _scene_onBeforeRender() {
    const timeDelta = this._screen.scene.getEngine().getDeltaTime();
    const texture = this._mesh.material.emissiveTexture;
    texture.uOffset += timeDelta * this._stepU;
    texture.vOffset += timeDelta * this._stepV;
  }
}
