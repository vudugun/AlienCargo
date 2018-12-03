import { UI } from "./ui.js";
import { settings as $settings } from "./settings.js";
import { Observable } from "./observable.js";

export class LevelSolvedUI extends UI {
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
    this._messageLabel.text = "Level " + number_ + " solved!";
  }

  set moves(moves_) {
    this._movesLabel.text = "Moves: " + moves_;
  }

  set time(time_) {
    const mins = String(Math.floor(time_ / 60));
    const secs = String(Math.floor(time_ % 60)).padStart(2, "0");
    this._timeLabel.text = "Time: " + mins + ":" + secs;
  }

  _initCallbacks() {
    this._settings_onOptionChangedCallback = this._settings_onOptionChanged.bind(this);  
    this._nextButton_onPointerDownCallback = this._nextButton_onPointerDown.bind(this);
    this._nextButton_onPointerClickCallback = this._nextButton_onPointerClick.bind(this);
  }

  _initEvents() {
    this.onNext = new Observable();
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
  }

  _createWidgets() {
    this._ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "level_solved", true, this._screen.scene);
    this._ui.addControl(this._createPanelBackground());
    this._ui.addControl(this._createPanel());
  }

  _createPanelBackground() {
    const background = new BABYLON.GUI.Rectangle("background");
    background.width = "152px";
    background.height = "208px";
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
    panel.height = "208px";
    panel.top = "8px";
    panel.left = "8px";
    panel.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    this._messageLabel = this._createMessageLabel();
    panel.addControl(this._messageLabel);
    this._movesLabel = this._createMovesLabel(); 
    panel.addControl(this._movesLabel);
    this._timeLabel = this._createTimeLabel(); 
    panel.addControl(this._timeLabel);
    panel.addControl(this._createNextButton());
    return panel;
  }

  _createMessageLabel() {
    const label = new BABYLON.GUI.TextBlock("message_label");
    label.height = "80px";
    label.top = "8px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffff00";
    label.fontSize = 24;
    label.text = "";
    label.textWrapping = true;
    return label;
  }

  _createMovesLabel() {
    const label = new BABYLON.GUI.TextBlock("moves_label");
    label.height = "36px";
    label.top = "16px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 18;
    label.text = "";
    return label;
  }

  _createTimeLabel() {
    const label = new BABYLON.GUI.TextBlock("time_label");
    label.height = "36px";
    label.top = "16px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 18;
    label.text = "";
    return label;
  }

  _createNextButton() {
    const button = this._createButton("next_button", "Next");
    button.onPointerDownObservable.add(this._nextButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._nextButton_onPointerClickCallback);
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

  _nextButton_onPointerDown() {
    this._clickSound.play();
  }

  _nextButton_onPointerClick() {
    this.onNext.notify();
  }
}
