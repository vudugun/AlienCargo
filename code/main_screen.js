import { Maps } from "./maps.js";
import { Level } from "./level.js";
import { Assets } from "./assets.js";
import { WarehouseAspect } from "./warehouse_aspect.js";
import { SpaceAspect } from "./space_aspect.js";
import { MainUI } from "./main_ui.js";
import { OptionsUI } from "./options_ui.js";
import { HelpUI } from "./help_ui.js";
import { Screen } from "./screen.js";
import { LevelScreen } from "./level_screen.js";
import { settings as $settings } from "./settings.js";

const assets = {
  meshes: [ "environment" ],
  images: [ "warehouse_base.png" ],
  fonts: [ "Native Alien Extended" ],
  sounds: [ "music.mp3", "ambient_sound.mp3", "click.mp3" ],
  texts: [ "maps.json" ]
};

export class MainScreen extends Screen {
  constructor(engine_) {
    super(engine_);
    this._assets = new Assets(this._scene);
    this._ui = new MainUI(this);
    this._uiOptions = new OptionsUI(this);
    this._uiHelp = new HelpUI(this);
    this._maps = new Maps(this);
    this._levelScreen = new LevelScreen(this._engine);
    this._levelPack = $settings.getLevelPack();
    this._nextLevelNo = $settings.getBookmark(this._levelPack);
    this._initCallbacks();
    this._initEvents();
  }

  initAsync() {
    const promise = new Promise(async resolve => {
      await this._assets.loadAsync(assets);
      this._initMaps();
      this._createScene();
      this._createUI();
      this._playMusic();
      this._playAmbientSound();
      resolve();
    });
    return Promise.all([ promise, this._levelScreen.initAsync() ]);
  }

  dispose() {
    this._levelScreen.dispose();
    this._stopAmbientSound();
    this._stopMusic();
    this._disposeUI();
    this._disposeEvents();
    super.dispose();
  }

  _initCallbacks() {
    this._engine_onRenderLoopCallback = this._engine_onRenderLoop.bind(this);
    this._settings_onOptionChangedCallback = this._settings_onOptionChanged.bind(this);
    this._ui_onPlayCallback = this._ui_onPlay.bind(this);
    this._ui_onOptionsCallback = this._ui_onOptions.bind(this);
    this._ui_onHelpCallback = this._ui_onHelp.bind(this);
    this._ui_onNextLevelChangedCallback = this._ui_onNextLevelChanged.bind(this);
    this._uiOptions_onBackCallback = this._uiOptions_onBack.bind(this);
    this._uiHelp_onBackCallback = this._uiHelp_onBack.bind(this);
    this._levelScreen_onAbortCallback = this._levelScreen_onAbort.bind(this);
    this._levelScreen_onRestartCallback = this._levelScreen_onRestart.bind(this);
    this._levelScreen_onPlaybackCallback = this._levelScreen_onPlayback.bind(this);
    this._levelScreen_onLevelSolvedCallback = this._levelScreen_onLevelSolved.bind(this);
    this._levelScreen_onNextCallback = this._levelScreen_onNext.bind(this);
  }

  _initEvents() {
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
    this._ui.onPlay.add(this._ui_onPlayCallback);
    this._ui.onOptions.add(this._ui_onOptionsCallback);
    this._ui.onHelp.add(this._ui_onHelpCallback);
    this._ui.onNextLevelChanged.add(this._ui_onNextLevelChangedCallback);
    this._uiOptions.onBack.add(this._uiOptions_onBackCallback);
    this._uiHelp.onBack.add(this._uiHelp_onBackCallback);
    this._levelScreen.onAbort.add(this._levelScreen_onAbortCallback);
    this._levelScreen.onRestart.add(this._levelScreen_onRestartCallback);
    this._levelScreen.onPlayback.add(this._levelScreen_onPlaybackCallback);
    this._levelScreen.onLevelSolved.add(this._levelScreen_onLevelSolvedCallback);
    this._levelScreen.onNext.add(this._levelScreen_onNextCallback);
  }

  _disposeUI() {
    this._uiHelp.dispose();
    this._uiOptions.dispose();
    this._ui.dispose();
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
    this._ui.onPlay.remove(this._ui_onPlayCallback);
    this._ui.onOptions.remove(this._ui_onOptionsCallback);
    this._ui.onHelp.remove(this._ui_onHelpCallback);
    this._ui.onNextLevelChanged.remove(this._ui_onNextLevelChangedCallback);
    this._uiOptions.onBack.remove(this._uiOptions_onBackCallback);
    this._uiHelp.onBack.remove(this._uiHelp_onBackCallback);
    this._levelScreen.onAbort.remove(this._levelScreen_onAbortCallback);
    this._levelScreen.onRestart.remove(this._levelScreen_onRestartCallback);
    this._levelScreen.onPlayback.remove(this._levelScreen_onPlaybackCallback);
    this._levelScreen.onLevelSolved.remove(this._levelScreen_onLevelSolvedCallback);
    this._levelScreen.onNext.remove(this._levelScreen_onNextCallback);
  }

  get scene() {
    return this._scene;
  }

  get assets() {
    return this._assets;
  }

  run(fadeInDuration_ = 200) {
    this._ui.isVisible = true;
    this._ui.isEnabled = false;
    this._engine.runRenderLoop(this._engine_onRenderLoopCallback);
    this._fadeIn(fadeInDuration_, () => {
      this._ui.isEnabled = true;
    });
  }

  stop() {
    this._ui.isEnabled = false;
    this._engine.stopRenderLoop(this._engine_onRenderLoopCallback);
  }

  _initMaps() {
    this._maps.init();
  }

  _createScene() {
    this._scene.ambientColor.set(0.9, 0.9, 0.9);
    this._createSpace();
    this._createWarehouse();
    this._createLights();
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
    const pos1 = new BABYLON.Vector3(0, 14, 0);
    this._light1 = new BABYLON.PointLight("light1", pos1, this._scene);
    this._light1.intensity = 750;
    this._light1.shadowMinZ = 8;
    this._light1.shadowMaxZ = 14;
  }

  _createCamera() {
    const pos1 = new BABYLON.Vector3(0, 3, 0);
    this._camera1 = new BABYLON.ArcRotateCamera("camera1", -(Math.PI / 2),
      Math.PI / 9, 10, pos1, this._scene);
  }

  _createSounds() {
    { // music
      this._music = this._assets.getSound("music");
      this._music.loop = true;
      const volume = $settings.getOption("music_volume") / 100;
      this._music.setVolume(volume);
    } { // ambient
      this._ambientSound = this._assets.getSound("ambient_sound");
      this._ambientSound.loop = true;
      const volume = $settings.getOption("ambient_sound_volume") / 100;
      this._ambientSound.setVolume(volume);
    }
  }

  _playMusic() {
    const volume = $settings.getOption("music_volume") / 100;
    if (volume > 0)
      this._music.play();
  }

  _stopMusic() {
    this._music.stop();
  }

  _playAmbientSound() {
    const volume = $settings.getOption("ambient_sound_volume") / 100;
    if (volume > 0)
      this._ambientSound.play();
  }

  _stopAmbientSound() {
    this._ambientSound.stop();
  }

  _createUI() {
    this._ui.create();
    this._ui.maxLevelNo = this._maps.getCount(this._levelPack);
    this._ui.nextLevelNo = $settings.getBookmark(this._levelPack);
    this._createUIOptions();
    this._createUIHelp();
  }

  _createUIOptions() {
    this._uiOptions.create();
    this._uiOptions.isVisible = false;
    this._uiOptions.isEnabled = false;
    this._uiOptions.alpha = 0;
  }

  _createUIHelp() {
    this._uiHelp.create();
    this._uiHelp.isVisible = false;
    this._uiHelp.isEnabled = false;
    this._uiHelp.alpha = 0;
  }

  _engine_onRenderLoop() {
    this._scene.render();
  }

  _computeNextLevel() {
    const levelCount = this._maps.getCount(this._levelPack);
    if (this._nextLevelNo === levelCount)
      return false;
    ++this._nextLevelNo;
    $settings.setBookmark(this._levelPack, Math.max(
      $settings.getBookmark(this._levelPack), this._nextLevelNo));
    this._ui.nextLevelNo = this._nextLevelNo;
    return true;
  }

  _settings_onOptionChanged(key_, value_) {
    if (key_ === "music_volume") {
      if (value_ > 0) {
        this._music.setVolume(value_ / 100);
        if (!this._music.isPlaying)
          this._music.play();
      } else {
        this._music.stop();
      }
    } else if (key_ === "ambient_sound_volume") {
      if (value_ > 0) {
        this._ambientSound.setVolume(value_ / 100);
        if (!this._ambientSound.isPlaying)
          this._ambientSound.play();
      } else {
        this._ambientSound.stop();
      }
    }
  }

  _ui_onPlay() {
    this._ui.isEnabled = false;
    this._fadeOut(200, () => {
      this._ui.isVisible = false;
      this.stop();
      const map = this._maps.get(this._levelPack, this._nextLevelNo);
      this._levelScreen.runFirst(new Level(map));
    });
  }

  _ui_onOptions() {
    this._ui.isEnabled = false;
    this._ui.fadeOut(200, () => {
      this._ui.isVisible = false;
      this._uiOptions.isVisible = true;
      this._uiOptions.fadeIn(200, () => {
        this._uiOptions.isEnabled = true;
      });
    });
  }

  _ui_onHelp() {
    this._ui.isEnabled = false;
    this._ui.fadeOut(200, () => {
      this._ui.isVisible = false;
      this._uiHelp.isVisible = true;
      this._uiHelp.fadeIn(200, () => {
        this._uiHelp.isEnabled = true;
      });
    });
  }

  _ui_onNextLevelChanged() {
    this._nextLevelNo = this._ui.nextLevelNo;
    if (!window.DEBUG) {
      this._nextLevelNo = Math.min(this._nextLevelNo,
        $settings.getBookmark(this._levelPack));
    }
    this._ui.nextLevelNo = this._nextLevelNo;
  }

  _uiOptions_onBack() {
    this._uiOptions.isEnabled = false;
    this._uiOptions.fadeOut(200, () => {
      this._uiOptions.isVisible = false;
      this._ui.isVisible = true;
      this._ui.fadeIn(200, () => {
        this._ui.isEnabled = true;
      });
    });
  }

  _uiHelp_onBack() {
    this._uiHelp.isEnabled = false;
    this._uiHelp.fadeOut(200, () => {
      this._uiHelp.isVisible = false;
      this._ui.isVisible = true;
      this._ui.fadeIn(200, () => {
        this._ui.isEnabled = true;
      });
    });
  }

  _levelScreen_onAbort() {
    this._levelScreen.abort(() => { this.run(); });
  }

  _levelScreen_onRestart() {
    this._levelScreen.restart();
  }

  _levelScreen_onPlayback() {
    this._levelScreen.playback();
  }

  _levelScreen_onLevelSolved() {
    this._levelScreen.handleLevelSolved();
  }

  _levelScreen_onNext() {
    if (this._computeNextLevel()) {
      const map = this._maps.get(this._levelPack, this._nextLevelNo);
      this._levelScreen.runNext(new Level(map));
    } else {
      this._levelScreen.handleGameSolved(() => { this.run(1000); });
    }
  }
}
