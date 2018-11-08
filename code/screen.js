export class Screen {
  constructor(engine_) {
    this._engine = engine_;
    this._initScene();
    this._initPostProcess();
  }
  
  dispose() {
    this._disposePostProcess();
    this._disposeScene();
  }
  
  _initScene() {
    this._scene = new BABYLON.Scene(this._engine);
  }
  
  _initPostProcess() {
    const url = "./assets/shaders/fade";
    this._fadePostProcess = new BABYLON.PostProcess("fade_in", url,
      [ "fadeLevel" ], null, 1.0, null, 0, this._engine);
  }
  
  _disposePostProcess() {
    this._fadePostProcess.dispose();
  }
  
  _disposeScene() {
    this._scene.dispose();
    this._scene = null;
  }
  
  _fadeIn(duration_, onFinished_ = () => {}) {
    let startTime = null;
    let fadeLevel = 0.0;
    const callback = () => {
      const elapsed = Date.now() - startTime;
      fadeLevel = Math.min(elapsed / duration_, 1.0)
    }
    this._fadePostProcess.onApply = effect => {
      if (!startTime) {
        startTime = Date.now();
        this._scene.registerBeforeRender(callback);
      }
      effect.setFloat("fadeLevel", fadeLevel);
    };	
    this._fadePostProcess.onAfterRender = () => {
      if (fadeLevel === 1.0) {
        this._scene.unregisterBeforeRender(callback);
        this._scene.activeCamera.detachPostProcess(this._fadePostProcess);
        onFinished_();
      }
    };
    this._scene.activeCamera.attachPostProcess(this._fadePostProcess);
  }

  _fadeOut(duration_, onFinished_ = () => {}) {
    let startTime = null;
    let fadeLevel = 1.0;
    const callback = () => {
      const elapsed = Date.now() - startTime;
      fadeLevel = Math.max(1.0 - elapsed / duration_, 0.0);
    }
    this._fadePostProcess.onApply = effect => {
      if (!startTime) { 
        startTime = Date.now();
        this._scene.registerBeforeRender(callback);
      }
      effect.setFloat("fadeLevel", fadeLevel);
    };	
    this._fadePostProcess.onAfterRender = () => {
      if (fadeLevel === 0.0) {
        this._scene.unregisterBeforeRender(callback);
        this._scene.activeCamera.detachPostProcess(this._fadePostProcess);
        onFinished_();
      }
    };
    this._scene.activeCamera.attachPostProcess(this._fadePostProcess);
  }
}
