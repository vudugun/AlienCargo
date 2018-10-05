import { MainScreen } from "./main_screen.js";

export class World {
  constructor() {
    this._canvas = document.getElementById("render_canvas");
    this._engine = new BABYLON.Engine(this._canvas, true);
    this._mainScreen = new MainScreen(this._engine);
    this._initCallbacks();
    this._initEvents();
  }

  initAsync() {
    this._engine.loadingUIText = "Loading...";
    return this._mainScreen.initAsync();
  }

  run() {
    this._mainScreen.run();
  }

  stop() {
    this._mainScreen.stop();
  }

  dispose() {
    this._disposeEvents();    
    this._mainScreen.dispose();
    this._mainScreen = null;
    this._engine.dispose();
    this._engine = null;
  }

  _initCallbacks() {
    this._window_onResizeCallback = () => { this._engine.resize() };
  }

  _initEvents() {
    window.addEventListener("resize", this._window_onResizeCallback);
  }

  _disposeEvents() {
    window.removeEventListener("resize", this._window_onResizeCallback);
  }
}
