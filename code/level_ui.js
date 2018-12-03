import { Observable } from "./observable.js";
import { UI } from "./ui.js";
import { settings as $settings } from "./settings.js";

export class LevelUI extends UI {
  constructor(screen_) {
    super(screen_);
    this._initCallbacks();
    this._initEvents();
  }

  create() {
    this._createWidgets();
    this._saveAlpha();
    this._createSounds();
  }

  dispose() {
    this._ui.dispose();
    this._disposeEvents();
  }

  set level(number_) {
    this._levelLabel.text = "Level: " + number_;
  }

  _initCallbacks() {
    this._settings_onOptionChangedCallback = this._settings_onOptionChanged.bind(this);  
    this._abortButton_onPointerDownCallback = this._abortButton_onPointerDown.bind(this);
    this._abortButton_onPointerClickCallback = this._abortButton_onPointerClick.bind(this);
    this._restartButton_onPointerDownCallback = this._restartButton_onPointerDown.bind(this);
    this._restartButton_onPointerClickCallback = this._restartButton_onPointerClick.bind(this);
  }

  _initEvents() {
    this.onAbort = new Observable();
    this.onRestart = new Observable();
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
  }
  
  _createWidgets() {
    this._ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "level", true, this._screen.scene);
    this._ui.addControl(this._createPanelBackground());
    this._ui.addControl(this._createPanel());
  }

  _createPanelBackground() {
    const background = new BABYLON.GUI.Rectangle("background");
    background.width = "152px";
    background.height = "144px";
    background.top = "8px";
    background.left = "8px";
    background.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    background.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    background.background = "#000000";
    background.alpha = 0.50;
    background.thickness = 0;
    background.cornerRadius = 10;
    return background;
  }

  _createPanel() {
    const panel = new BABYLON.GUI.StackPanel("panel");
    panel.width = "152px";
    panel.height = "144px";
    panel.top = "8px";
    panel.left = "8px";
    panel.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this._levelLabel = this._createLevelLabel();
    panel.addControl(this._levelLabel);
    panel.addControl(this._createAbortButton());
    panel.addControl(this._createRestartButton());
    return panel;
  }

  _createLevelLabel() {
    const label = new BABYLON.GUI.TextBlock("level_label");
    label.height = "40px";
    label.top = "8px";
    label.bottom = "8px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 24;
    label.text = "";
    return label;
  }

  _createAbortButton() {
    const button = this._createButton("abort_button", "Abort");
    button.onPointerDownObservable.add(this._abortButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._abortButton_onPointerClickCallback);
    return button;
  }

  _createRestartButton() {
    const button = this._createButton("restart_button", "Restart");
    button.onPointerDownObservable.add(this._restartButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._restartButton_onPointerClickCallback);
    return button;
  }

  _createButton(name_, text_) {
    const button = BABYLON.GUI.Button.CreateSimpleButton(name_, text_);
    button.fontFamily = "Native Alien Extended";
    button.fontSize = 18;
    button.height = "48px";
    button.paddingTop = "8px";
    button.paddingLeft = "8px";
    button.paddingRight = "8px";
    button.color = "#000000";
    button.background = "#7092A3";
    button.cornerRadius = 10;
    return button;
  }

  _createSounds() {
    this._clickSound = this._screen.assets.getSound("click");
    const volume = $settings.getOption("sound_effects_volume") / 100;
    this._clickSound.setVolume(volume);
  }

  _settings_onOptionChanged(key_, value_) {
    if (key_ === "sound_effects_volume")
      this._clickSound.setVolume(value_ / 100);
  }

  _abortButton_onPointerDown() {
    this._clickSound.play();
  }

  _abortButton_onPointerClick() {
    this.onAbort.notify();
  }

  _restartButton_onPointerDown() {
    this._clickSound.play();
  }

  _restartButton_onPointerClick() {
    this.onRestart.notify();
  }
}
