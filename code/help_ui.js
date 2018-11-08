import { Observable } from "./observable.js";
import { UI } from "./ui.js";
import { settings as $settings } from "./settings.js";

export class HelpUI extends UI {
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
  
  _initCallbacks() {
    this._settings_onOptionChangedCallback = this._settings_onOptionChanged.bind(this); 
    this._backButton_onPointerDownCallback = this._backButton_onPointerDown.bind(this);
    this._backButton_onPointerClickCallback = this._backButton_onPointerClick.bind(this);
  }

  _initEvents() {
    this.onBack = new Observable();
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
  }
  
  _createWidgets() {
    this._ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "help", true, this._screen.scene);
    this._ui.addControl(this._createMainPanelBackground());
    this._ui.addControl(this._createMainPanel());
    this._ui.addControl(this._createBackButtonBackground());
    this._ui.addControl(this._createBackButton());
  }

  _createMainPanelBackground() {
    const background = new BABYLON.GUI.Rectangle("background");
    background.width = "592px";
    background.height = "592px";
    background.background = "#000000";
    background.alpha = 0.50;
    background.thickness = 0;
    background.cornerRadius = 20;
    return background;
  }

  _createMainPanel() {
    const panel = new BABYLON.GUI.StackPanel("main_panel");
    panel.width = "592px";
    panel.height = "592px";
    panel.addControl(this._createInstructionsPanel());
    panel.addControl(this._createControlsPanel());
    panel.addControl(this._createShortcutsPanel());
    return panel;
  }

  _createInstructionsPanel() {
    const panel = new BABYLON.GUI.StackPanel("instructions_panel");
    panel.addControl(this._createInstructionsTitleLabel());
    panel.addControl(this._createInstructionsBodyLabel());
    return panel;
  }

  _createInstructionsTitleLabel() {
    const label = this._createTitleLabel("instructions_title_label");
    label.text = "Instructions";
    return label;
  }

  _createInstructionsBodyLabel() {
    const label = this._createBodyLabel("instructions_body_label");
    label.height = "80px";
    label.text = "Stack crates on goals and" + "\n" +
      "leave no empty goals";
    return label;
  }

  _createControlsPanel() {
    const panel = new BABYLON.GUI.StackPanel("controls_panel");
    panel.addControl(this._createControlsTitleLabel());
    panel.addControl(this._createControlsBodyLabel());
    return panel;
  }

  _createControlsTitleLabel() {
    const label = this._createTitleLabel("controls_title_label");
    label.text = "Controls";
    return label;
  }

  _createControlsBodyLabel() {
    const label = this._createBodyLabel("controls_body_label");
    label.height = "80px";
    label.text = "Move forklift with arrow keys" + "\n" +
      "Move forks with 1-2-3 keys";
    return label;
  }

  _createShortcutsPanel() {
    const panel = new BABYLON.GUI.StackPanel("shortcuts_panel");
    panel.addControl(this._createShortcutsTitleLabel());
    panel.addControl(this._createShortcutsBodyLabel());
    return panel;
  }

  _createShortcutsTitleLabel() {
    const label = this._createTitleLabel("shortcuts_title_label");
    label.text = "Shortcuts";
    return label;
  }

  _createShortcutsBodyLabel() {
    const label = this._createBodyLabel("shortcuts_body_label");
    label.height = "120px";
    label.text = "Esc: abort level" + "\n" +
      "R: restart level" + "\n" +
      "Space: next level";
    return label;
  }

  _createBackButtonBackground() {
    const background = new BABYLON.GUI.Rectangle("background");
    background.width = "152px";
    background.height = "56px";
    background.top = "8px";
    background.left = "8px";
    background.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    background.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    background.background = "#000000";
    background.alpha = 0.50;
    background.thickness = 0;
    background.cornerRadius = 20;
    return background;
  }

  _createBackButton() {
    const button = this._createButton("back_button", "Back");
    button.width = "136px";
    button.top = "16px";
    button.left = "16px";
    button.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button.onPointerDownObservable.add(this._backButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._backButton_onPointerClickCallback);
    return button;
  }

  _createTitleLabel(name_) {
    const label = new BABYLON.GUI.TextBlock(name_);
    label.height = "96px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#536c79";
    label.fontSize = 48;
    return label;
  }

  _createBodyLabel(name_) {
    const label = new BABYLON.GUI.TextBlock(name_);
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 24;
    return label;
  }

  _createButton(name_, text_) {
    const button = BABYLON.GUI.Button.CreateSimpleButton(name_, text_)
    button.fontFamily = "Native Alien Extended";
    button.fontSize = 18;
    button.height = "40px"
    button.color = "#000000";
    button.background = "#536c79";
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

  _backButton_onPointerDown() {
    this._clickSound.play();
  }

  _backButton_onPointerClick() {
    this.onBack.notify();
  }
}
