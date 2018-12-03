import { Observable } from "./observable.js";
import { UI } from "./ui.js";
import { settings as $settings } from "./settings.js";

export class MainUI extends UI {
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

  set maxLevelNo(no_) {
    this._nextLevelSlider.maximum = no_;
  }

  get nextLevelNo() {
    return this._nextLevelSlider.value;
  }

  set nextLevelNo(no_) {
    this._nextLevelSlider.value = no_;
    this._nextLevelValue.text = String(no_);
  }

  _initCallbacks() {
    this._settings_onOptionChangedCallback = this._settings_onOptionChanged.bind(this);  
    this._playButton_onPointerDownCallback = this._playButton_onPointerDown.bind(this);  
    this._playButton_onPointerClickCallback = this._playButton_onPointerClick.bind(this);  
    this._optionsButton_onPointerDownCallback = this._optionsButton_onPointerDown.bind(this);  
    this._optionsButton_onPointerClickCallback = this._optionsButton_onPointerClick.bind(this);  
    this._helpButton_onPointerDownCallback = this._helpButton_onPointerDown.bind(this);  
    this._helpButton_onPointerClickCallback = this._helpButton_onPointerClick.bind(this);  
  }

  _initEvents() {
    this.onPlay = new Observable();
    this.onOptions = new Observable();
    this.onHelp = new Observable();
    this.onNextLevelChanged = new Observable();
    $settings.onOptionChanged.add(this._settings_onOptionChangedCallback);
  }

  _disposeEvents() {
    $settings.onOptionChanged.remove(this._settings_onOptionChangedCallback);
  }

  _createWidgets() {
    this._ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "main", true, this._screen.scene);
    this._ui.addControl(this._createTitle());
    this._ui.addControl(this._createCenterPanelBackground());
    this._ui.addControl(this._createCenterPanel());
    this._ui.addControl(this._createBottomPanel());
  }

  _createTitle() {
    const image = new BABYLON.GUI.Image("title", "assets/images/title.png");
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    image.width = "80%";
    image.height = "19%";
    image.top = "3%";
    return image;
  }

  _createCenterPanelBackground() {
    const background = new BABYLON.GUI.Rectangle("background");
    background.width = "400px";
    background.height = "344px";
    background.background = "#000000";
    background.alpha = 0.50;
    background.thickness = 0;
    background.cornerRadius = 20;
    return background;
  }

  _createCenterPanel() {
    const panel = new BABYLON.GUI.StackPanel("center_panel");
    panel.width = "400px";
    panel.height = "344px";
    panel.addControl(this._createPlayButtton());
    panel.addControl(this._createOptionsButtton());
    panel.addControl(this._createHelpButtton());
    return panel;
  }

  _createPlayButtton() {
    const button = this._createButton("play_button", "Play");
    button.onPointerDownObservable.add(this._playButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._playButton_onPointerClickCallback);
    return button;
  }

  _createOptionsButtton() {
    const button = this._createButton("options_button", "Options");
    button.onPointerDownObservable.add(this._optionsButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._optionsButton_onPointerClickCallback);
    return button;
  }

  _createHelpButtton() {
    const button = this._createButton("help_button", "Help");
    button.onPointerDownObservable.add(this._helpButton_onPointerDownCallback);
    button.onPointerClickObservable.add(this._helpButton_onPointerClickCallback);
    return button;
  }

  _createButton(name_, text_) {
    const button = BABYLON.GUI.Button.CreateSimpleButton(name_, text_)
    button.fontFamily = "Native Alien Extended";
    button.fontSize = 48;
    button.height = "108px";
    button.paddingTop = "16px";
    button.paddingLeft = "16px";
    button.paddingRight = "16px";
    button.color = "#000000";
    button.background = "#7092A3";
    button.cornerRadius = 10;
    return button;
  }
  
  _createBottomPanel() {
    const panel = new BABYLON.GUI.StackPanel("bottom_panel");
    panel.width = "90%";
    panel.height = "96px";
    panel.top = "-64px";
    panel.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    panel.addControl(this._createNextLevelPanel());
    this._nextLevelSlider = this._createLevelSlider()
    panel.addControl(this._nextLevelSlider);
    return panel;
  }

  _createNextLevelPanel() {
    const panel = new BABYLON.GUI.StackPanel("next_level_panel");
    panel.isVertical = false;
    panel.addControl(this._createNextLevelLabel());
    this._nextLevelValue = this._createNextLevelValue();
    panel.addControl(this._nextLevelValue);
    return panel;
  }

  _createNextLevelLabel() {
    const label = new BABYLON.GUI.TextBlock("next_level_label");
    label.text = "Next level:";
    label.width = "176px";
    label.height = "64px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 24;
    return label;
  }

  _createNextLevelValue() {
    const label = new BABYLON.GUI.TextBlock("next_level_value");
    label.width = "36px";
    label.height = "64px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 24;
    return label;
  }

  _createLevelSlider() {
    const slider = new BABYLON.GUI.Slider("level_slider");
    slider.minimum = 1;
    slider.maximum = 1;
    slider.value = 1;
    slider.width = "90%";
    slider.height = "32px";
    slider.isThumbCircle = true;
    slider.borderColor = "#000000";
    slider.background = "#7092A3";
    slider.color = "#c0c000";
    slider.onValueChangedObservable.add(value => {
      slider.value = Math.round(value);
      this.onNextLevelChanged.notify();
    });        
    return slider;
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

  _playButton_onPointerDown() {
    this._clickSound.play();
  }

  _playButton_onPointerClick() {
    this.onPlay.notify();
  }

  _optionsButton_onPointerDown() {
    this._clickSound.play();
  }

  _optionsButton_onPointerClick() {
    this.onOptions.notify();
  }
  
  _helpButton_onPointerDown() {
    this._clickSound.play();
  }

  _helpButton_onPointerClick() {
    this.onHelp.notify();
  }
}
