import { Observable } from "./observable.js";
import { UI } from "./ui.js";
import { settings as $settings } from "./settings.js";

export class OptionsUI extends UI {
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
      "options", true, this._screen.scene);
    this._ui.addControl(this._createMainPanelBackground());
    this._ui.addControl(this._createMainPanel());
    this._ui.addControl(this._createBackButtonBackground());
    this._ui.addControl(this._createBackButton());
  }

  _createMainPanelBackground() {
    const background = new BABYLON.GUI.Rectangle("background");
    background.width = "672px";
    background.height = "464px";
    background.background = "#000000";
    background.alpha = 0.50;
    background.thickness = 0;
    background.cornerRadius = 20;
    return background;
  }

  _createMainPanel() {
    const panel = new BABYLON.GUI.StackPanel("main_panel");
    panel.width = "672px";
    panel.height = "464px";
    panel.addControl(this._createMovementPanel());
    panel.addControl(this._createAudioPanel());
    return panel;
  }
  
  _createMovementPanel() {
    const panel = new BABYLON.GUI.StackPanel("movement_panel");
    panel.addControl(this._createMovementTitleLabel());
    panel.addControl(this._createMovementBodyPanel());
    return panel;
  }

  _createMovementTitleLabel() {
    const label = this._createTitleLabel("movement_title_label");
    label.text = "Movement";
    return label;
  }
  
  _createMovementBodyPanel() {
    const panel = new BABYLON.GUI.StackPanel("movement_body_panel");
    panel.addControl(this._createForkliftSpeedPanel());
    panel.addControl(this._createRotationSpeedPanel());
    panel.addControl(this._createForksSpeedPanel());
    return panel;
  }

  _createForkliftSpeedPanel() {
    const panel = new BABYLON.GUI.StackPanel("forklift_speed_panel");
    panel.isVertical = false;
    const label = this._createBodyLabel("forklift_speed_label");
    label.width = "320px";
    label.text = "Forklift speed:";
    this._forkliftSpeedSlider = this._createSpeedSlider(
      "forklift_speed_slider", 4, value_ => {
        $settings.setOption("forklift_speed", value_);
      });
    this._forkliftSpeedSlider.value =
      $settings.getOption("forklift_speed");
    panel.addControl(label);
    panel.addControl(this._forkliftSpeedSlider);
    return panel;
  }

  _createRotationSpeedPanel() {
    const panel = new BABYLON.GUI.StackPanel("rotation_speed_panel");
    panel.isVertical = false;
    const label = this._createBodyLabel("rotation_speed_label");
    label.width = "320px";
    label.text = "Rotation speed:";
    this._rotationSpeedSlider = this._createSpeedSlider(
      "rotation_speed_slider", 4, value_ => {
        $settings.setOption("rotation_speed", value_);
      });
    this._rotationSpeedSlider.value =
      $settings.getOption("rotation_speed");
    panel.addControl(label);
    panel.addControl(this._rotationSpeedSlider);
    return panel;
  }

  _createForksSpeedPanel() {
    const panel = new BABYLON.GUI.StackPanel("forks_speed_panel");
    panel.isVertical = false;
    const label = this._createBodyLabel("forks_speed_label");
    label.width = "320px";
    label.text = "Forks speed:";
    this._forksSpeedSlider = this._createSpeedSlider(
      "forks_speed_slider", 4, value_ => {
        $settings.setOption("forks_speed", value_);
      });
    this._forksSpeedSlider.value =
      $settings.getOption("forks_speed");
    panel.addControl(label);
    panel.addControl(this._forksSpeedSlider);
    return panel;
  }

  _createAudioPanel() {
    const panel = new BABYLON.GUI.StackPanel("audio_panel");
    panel.addControl(this._createAudioTitleLabel());
    panel.addControl(this._createAudioBodyPanel());
    return panel;
  }

  _createAudioTitleLabel() {
    const label = this._createTitleLabel("audio_title_label");
    label.text = "Audio";
    return label;
  }

  _createAudioBodyPanel() {
    const panel = new BABYLON.GUI.StackPanel("movement_body_panel");
    panel.addControl(this._createMusicVolumePanel());
    panel.addControl(this._createAmbientSoundVolumePanel());
    panel.addControl(this._createSoundEffectsVolumePanel());
    return panel;
  }

  _createMusicVolumePanel() {
    const panel = new BABYLON.GUI.StackPanel("music_volume_panel");
    panel.isVertical = false;
    // label
    const label = this._createBodyLabel("music_volume_label");
    label.width = "320px";
    label.text = "Music:";
    // slider
    this._musicVolumeSlider = this._createSoundSlider(
      "music_volume_slider", 100, value_ => {
        $settings.setOption("music_volume", value_);
      });
    this._musicVolumeSlider.value =
      $settings.getOption("music_volume");
    panel.addControl(label);
    panel.addControl(this._musicVolumeSlider);
    return panel;
  }

  _createAmbientSoundVolumePanel() {
    const panel = new BABYLON.GUI.StackPanel("ambient_sound_volume_panel");
    panel.isVertical = false;
    // label
    const label = this._createBodyLabel("ambient_sound_volume_label");
    label.width = "320px";
    label.text = "Ambient sound:";
    // slider
    this._ambientSoundVolumeSlider = this._createSoundSlider(
      "ambient_sound_volume_slider", 100, value_ => {
        $settings.setOption("ambient_sound_volume", value_);
      });
    this._ambientSoundVolumeSlider.value =
      $settings.getOption("ambient_sound_volume");
    panel.addControl(label);
    panel.addControl(this._ambientSoundVolumeSlider);
    return panel;
  }

  _createSoundEffectsVolumePanel() {
    const panel = new BABYLON.GUI.StackPanel("sound_effects_volume_panel");
    panel.isVertical = false;
    // label
    const label = this._createBodyLabel("sound_effects_volume_label");
    label.width = "320px";
    label.text = "Sound effects:";
    // slider
    this._soundEffectsVolumeSlider = this._createSoundSlider(
      "sound_effects_volume_slider", 100, value_ => {
        $settings.setOption("sound_effects_volume", value_);
      });
    this._soundEffectsVolumeSlider.value =
      $settings.getOption("sound_effects_volume");
    panel.addControl(label);
    panel.addControl(this._soundEffectsVolumeSlider);
    return panel;
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
    label.color = "#7092A3";
    label.fontSize = 48;
    return label;
  }

  _createBodyLabel(name_) {
    const label = new BABYLON.GUI.TextBlock(name_);
    label.height = "40px";
    label.fontFamily = "Native Alien Extended";
    label.color = "#ffffff";
    label.fontSize = 24;
    return label;
  }

  _createSpeedSlider(name_, maximum_, callback_) {
    const slider = new BABYLON.GUI.Slider(name_);
    slider.minimum = 0;
    slider.maximum = maximum_;
    slider.value = 0;
    slider.width = "288px";
    slider.height = "32px";
    slider.isThumbCircle = true;
    slider.borderColor = "#000000";
    slider.background = "#7092A3";
    slider.color = "#c0c000";
    slider.onValueChangedObservable.add(value_ => {
      slider.value = Math.round(value_);
      callback_(slider.value);
    });
    return slider;
  }

  _createSoundSlider(name_, maximum_, callback_) {
    const slider = new BABYLON.GUI.Slider(name_);
    slider.minimum = 0;
    slider.maximum = maximum_;
    slider.value = 0;
    slider.width = "288px";
    slider.height = "32px";
    slider.isThumbCircle = true;
    slider.borderColor = "#000000";
    slider.background = "#7092A3";
    slider.color = slider.background;
    slider.onValueChangedObservable.add(value_ => {
      slider.value = Math.round(value_);
      if (slider.value === 0)
        slider.color = slider.background;
      else
        slider.color = "#c0c000";
      callback_(slider.value);
    });
    return slider;
  }

  _createButton(name_, text_) {
    const button = BABYLON.GUI.Button.CreateSimpleButton(name_, text_)
    button.fontFamily = "Native Alien Extended";
    button.fontSize = 18;
    button.height = "40px"
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

  _backButton_onPointerDown() {
    this._clickSound.play();
  }

  _backButton_onPointerClick() {
    this.onBack.notify();
  }
}
