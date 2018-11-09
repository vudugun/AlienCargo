import { Observable } from "./observable.js";
import { Location } from "./location.js";
import { Floor } from "./floor.js";
import { Goal } from "./goal.js";
import { Crate } from "./crate.js";
import { Forklift } from "./forklift.js";
import { Assets } from "./assets.js";
import { FloorFigure } from "./floor_figure.js";
import { GoalFigure } from "./goal_figure.js";
import { CrateFigure } from "./crate_figure.js";
import { ForkliftActor } from "./forklift_actor.js";
import { WarehouseAspect } from "./warehouse_aspect.js";
import { SpaceAspect } from "./space_aspect.js";
import { LevelUI } from "./level_ui.js";
import { LevelSolvedUI } from "./level_solved_ui.js";
import { Screen } from "./screen.js";
import { Keyboard } from "./keyboard.js";
import { settings as $settings } from "./settings.js";

const assets = {
  meshes: [ "figures", "environment" ],
  images: [ "warehouse_base.png", "digits.png", "scrapes_mask.png",
    "goal_base.png", "goal_decal.png" ],
  fonts: [ "Native Alien Extended" ],
  sounds: [ "click.mp3", "drop.mp3", "level_solved.mp3", "game_solved.mp3" ]
};

export class LevelScreen extends Screen {
  constructor(engine_) {
    super(engine_);
    this._assets = new Assets(this._scene);
    this._ui = new LevelUI(this);
    this._uiLevelSolved = new LevelSolvedUI(this);
    this._keyboard = new Keyboard();
    this._level = null;
    this._figures = [];
    this._forklift = null;
    this._startTime = null;
    this._playbackMoves = [];
    this._initCallbacks();
    this._initEvents();
  }

  initAsync() {
    return new Promise(async resolve => {
      await this._assets.loadAsync(assets);
      this._createScene();
      this._createUI();
      resolve();
    });
  }

  dispose() {
    this._disposeUI();
    this._disposeEvents();
    super.dispose();
  }

  _initCallbacks() {
    this._engine_onRenderLoopCallback = this._engine_onRenderLoop.bind(this);
    this._settings_onOptionChangedCallback = this._settings_onOptionChanged.bind(this);
    this._forklift_onIdleCallback = this._forklift_onIdle.bind(this);
    this._ui_onAbortCallback = this._ui_onAbort.bind(this);
    this._ui_onRestartCallback = this._ui_onRestart.bind(this);
    this._uiLevelSolved_onNextCallback = this._uiLevelSolved_onNext.bind(this);
  }

  _initEvents() {
    this.onAbort = new Observable();
    this.onRestart = new Observable();
    this.onPlayback = new Observable();
    this.onLevelSolved = new Observable();
    this.onNext = new Observable();
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
    this._ui.onAbort.add(this._ui_onAbortCallback);
    this._ui.onRestart.add(this._ui_onRestartCallback);
    this._uiLevelSolved.onNext.add(this._uiLevelSolved_onNextCallback);
  }

  _disposeUI() {
    this._ui.dispose();
    this._uiLevelSolved.dispose();
  }

  _disposeFigures() {
    this._forklift.onIdle.remove(this._forklift_onIdleCallback);
    this._forklift = null;
    for (const figure of this._figures)
      figure.dispose();
    this._figures = [];
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
    this._ui.onAbort.remove(this._ui_onAbortCallback);
    this._ui.onRestart.remove(this._ui_onRestartCallback);
    this._uiLevelSolved.onNext.remove(this._uiLevelSolved_onNextCallback);
  }

  get scene() {
    return this._scene;
  }

  get assets() {
    return this._assets;
  }

  runFirst(level_) {
    this._level = level_;
    this._createFigures();
    this._warehouseAspect.level = this._level.number;
    this._engine.runRenderLoop(this._engine_onRenderLoopCallback);
    this._fadeIn(200, () => {
      this._ui.isVisible = true
      this._ui.level = this._level.number;
      this._ui.fadeIn(200, () => {
        this._ui.isEnabled = true;
        this._trackKeyboardOnRun();
        this._startTime = Date.now();
      });
    });
  }

  runNext(level_) {
    this._untrackKeyboard();
    this._uiLevelSolved.isEnabled = false;
    this._uiLevelSolved.fadeOut(200, () => {
      this._uiLevelSolved.isVisible = false;
      this._fadeOut(200, () => {
        this._stopPlayback();
        this._disposeFigures();
        this._level.dispose();
        this._level = level_;
        this._createFigures();
        this._warehouseAspect.level = this._level.number;
        this._engine.runRenderLoop(this._engine_onRenderLoopCallback);
        this._fadeIn(200, () => {
          this._ui.isVisible = true
          this._ui.level = this._level.number;
          this._ui.fadeIn(200, () => {
            this._ui.isEnabled = true;
            this._trackKeyboardOnRun();
            this._startTime = Date.now();
          });
        });
      });
    });
  }

  abort(onFinished_ = () => {}) {
    this._untrackKeyboard();
    this._ui.isEnabled = false;
    this._ui.fadeOut(200, () => {
      this._ui.isVisible = false;
      this._fadeOut(200, () => {
        this._engine.stopRenderLoop(this._engine_onRenderLoopCallback);
        this._stopPlayback();
        this._disposeFigures();
        this._level.dispose();
        this._level = null;
        onFinished_();
      });
    });
  }

  restart() {
    this._untrackKeyboard();
    this._ui.isEnabled = false;
    this._fadeOut(200, () => {
      this._stopPlayback();
      this._disposeFigures();
      this._level.reset();
      this._createFigures();
      this._fadeIn(200, () => {
        this._ui.isEnabled = true;
        this._trackKeyboardOnRun()
        this._startTime = Date.now();
      });
    });
  }

  playback() {
    this._untrackKeyboard();
    this._ui.isEnabled = false;
    this._fadeOut(200, () => {
      this._disposeFigures();
      this._level.reset();
      this._createFigures();
      this._fadeIn(200, () => {
        this._ui.isEnabled = true;
        this._trackKeyboardOnPlayback()
        this._startTime = Date.now();
        this._startPlayback();
      });
    });
  }

  handleLevelSolved() {
    this._untrackKeyboard();
    this._ui.isEnabled = false;
    this._ui.fadeOut(200, () => {
      this._ui.isVisible = false;
      this._uiLevelSolved.level = this._level.number;
      this._uiLevelSolved.moves = this._level.moves.length;
      this._uiLevelSolved.time = (Date.now() - this._startTime) / 1000;
      this._uiLevelSolved.isVisible = true;
      this._levelSolvedSound.play();
      this._uiLevelSolved.fadeIn(200, () => {
        this._uiLevelSolved.isEnabled = true;
        this._trackKeyboardOnLevelSolved();
      });
    });
  }

  handleGameSolved(onFinished_ = () => {}) {
    this._untrackKeyboard();
    this._uiLevelSolved.isEnabled = false;
    this._uiLevelSolved.fadeOut(200, () => {
      this._uiLevelSolved.isVisible = false;
      this._fadeOut(2500, () => {
        this._disposeFigures();
        this._level.dispose();
        this._level = null;
        this._warehouseAspect.isVisible = false;
        this._fadeIn(2500, () => {
          this._gameSolvedSound.onEndedObservable.addOnce(() => {
            window.setTimeout(() => {
              this._fadeOut(2500, () => {
                this._warehouseAspect.isVisible = true;
                onFinished_();
              });
            }, 2500);
          });
          this._gameSolvedSound.play();
        });
      });
    });
  }

  _createScene() {
    this._scene.ambientColor.set(0.8, 0.8, 0.8);
    this._createSpace();
    this._createWarehouse();
    this._createLights();
    this._createShadowGenerator();
    this._createCamera();
    this._createSounds();
  }

  _createSpace() {
    this._spaceAspect = new SpaceAspect(this);
    this._spaceAspect.position.set(0, 0, 0);
  }

  _createWarehouse() {
    this._warehouseAspect = new WarehouseAspect(this);
    this._warehouseAspect.position.set(0, 2.8, 0);
  }

  _createLights() {
    // light1
    const pos1 = new BABYLON.Vector3(0, 12, 0);
    this._light1 = new BABYLON.PointLight("light1", pos1, this._scene);
    this._light1.intensity = 500;
    this._light1.shadowMinZ = 6;
    this._light1.shadowMaxZ = 12;
  }

  _createShadowGenerator() {
    this._shadowGenerator = new BABYLON.ShadowGenerator(1024, this._light1);
    this._shadowGenerator.usePercentageCloserFiltering = true;
    this._shadowGenerator.setDarkness(0.9);
  }

  _createCamera() {
    const pos1 = new BABYLON.Vector3(0, 3, 0);
    this._camera1 = new BABYLON.ArcRotateCamera("camera1", -(Math.PI / 2),
      Math.PI / 9, 10, pos1, this._scene);
  }

  _createSounds() {
    { // level solved
      this._levelSolvedSound = this._assets.getSound("level_solved");
      const volume = $settings.getOption("sound_effects_volume") / 100;
      this._levelSolvedSound.setVolume(volume);
    } { // game solved
      this._gameSolvedSound = this._assets.getSound("game_solved");
      const volume = $settings.getOption("sound_effects_volume") / 100;
      this._gameSolvedSound.setVolume(volume);
    }
  }

  _createUI() {
    this._ui.create();
    this._ui.isVisible = false;
    this._ui.isEnabled = false;
    this._ui.alpha = 0;
    this._createLevelSolvedUI();
  }

  _createLevelSolvedUI() {
    this._uiLevelSolved.create();
    this._uiLevelSolved.isVisible = false;
    this._uiLevelSolved.isEnabled = false;
    this._uiLevelSolved.alpha = 0;
  }

  _createFigures() {
    console.assert(this._figures.length === 0);
    const center = this._computeCenter();
    const grid = this._level.grid;
    for (let r = 0, n1 = grid.getRowCount(); r < n1; ++r) {
      for (let c = 0, n2 = grid.getColumnCount(r); c < n2; ++c) {
        for (let h = 0, n3 = grid.getHeight(r, c); h < n3; ++h) {
          const entity = grid.getRCH(r, c, h);
          const figure = this._createFigure(entity);
          if (figure) {
            figure.position = BABYLON.Vector3.fromLocationRCH(
              r - center.r, c - center.c, h);
            figure.initShadows(this._shadowGenerator);
            this._figures.push(figure);
          }
        }
      }
    }
  }

  _computeCenter() {
    const grid = this._level.grid;
    const rc = grid.getRowCount();
    let cc = 0;
    for (let r = 0; r < rc; ++r)
      cc = Math.max(cc, grid.getColumnCount(r));
    const r = (rc - 1) / 2;
    const c = (cc - 1) / 2;
    const h = 2;
    return new Location(r, c, h);
  }

  _createFigure(entity_) {
    switch (entity_.constructor) {
      case Floor:
        return new FloorFigure(entity_, this);
      case Goal:
        return new GoalFigure(entity_, this);
      case Crate:
        return new CrateFigure(entity_, this);
      case Forklift:
        console.assert(!this._forklift);
        this._forklift = new ForkliftActor(entity_, this);
        this._forklift.onIdle.add(this._forklift_onIdleCallback);
        return this._forklift;
      default:
        break;
    }
  }

  _engine_onRenderLoop() {
    this._scene.render();
  }

  _trackKeyboardOnRun() {
    this._keyboard.track(new Map([
      [ 38, () => { // arrow up
          if (this._forklift.idle)
            this._level.move("n");
        } ],
      [ 39, () => { // arrow right
          if (this._forklift.idle)
            this._level.move("e");
        } ],
      [ 40, () => { // arrow down
          if (this._forklift.idle)
            this._level.move("s");
        } ],
      [ 37, () => { // arrow left
          if (this._forklift.idle)
            this._level.move("w");
        } ],
      [ 49, () => { // 1
          if (this._forklift.idle)
            this._level.move("1");
        } ],
      [ 50, () => { // 2
          if (this._forklift.idle)
            this._level.move("2");
        } ],
      [ 51, () => { // 3
          if (this._forklift.idle)
            this._level.move("3");
        } ],
      [ 27, () => { // escape
          this.onAbort.notify();
        } ],
      [ 82, () => { // r
          this.onRestart.notify();
        } ],
      [ 80, () => { // p
          if (this._level.solution.moves.length > 0)
            this.onPlayback.notify();
        } ]
    ]));
  }

  _trackKeyboardOnPlayback() {
    this._keyboard.track(new Map([
      [ 27, () => { // escape
          this.onAbort.notify();
        } ],
      [ 82, () => { // r
          this.onRestart.notify();
        } ]
    ]));
  }

  _trackKeyboardOnLevelSolved() {
    this._keyboard.track(new Map([
      [ 32, () => { // space
          this.onNext.notify();
        } ]
    ]));
  }

  _untrackKeyboard() {
    this._keyboard.untrack();
  }

  _startPlayback() {
    this._playbackMoves = this._level.solution.moves.split(" ");
    this._advancePlayback();
  }

  _stopPlayback() {
    this._playbackMoves = [];
  }

  _advancePlayback() {
    this._level.move(this._playbackMoves.shift());
  }

  _isPlaybackInProgress() {
    return this._playbackMoves.length > 0;
  }

  _settings_onOptionChanged(key_, value_) {
    if (key_ === "sound_effects_volume") {
      this._levelSolvedSound.setVolume(value_ / 100);
      this._gameSolvedSound.setVolume(value_ / 100);
    }
  }

  _ui_onAbort() {
    this.onAbort.notify();
  }

  _ui_onRestart() {
    this.onRestart.notify();
  }

  _uiLevelSolved_onNext() {
    this.onNext.notify();
  }

  _forklift_onIdle() {
    if (this._level.isSolved()) {
      if (window.DEBUG)
        console.log(this._level.moves.join(" "));
      this.onLevelSolved.notify();
    } else if (this._isPlaybackInProgress()) {
      this._advancePlayback();
    } else {
      this._keyboard.performActions();
    }
  }
}
