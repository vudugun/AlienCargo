import { Observable } from "./observable.js";

export const settings = new class Settings {
  constructor() {
    this._bookmarks = new Map();
    this._options = new Map();
    this._initEvents();
  }

  load() {
    this._loadLevelPack();
    this._loadBookmarks();
    this._loadOptions();
  }

  save() {
    this._saveLevelPack();
    this._saveBookmarks();
    this._saveOptions();
  }

  getLevelPack() {
    return this._levelPack;
  }

  getBookmark(key_) {
    if (!this._bookmarks.has(key_))
      this._bookmarks.set(key_, 1);
    return this._bookmarks.get(key_);
  }

  setBookmark(key_, value_) {
    const changed = this.getBookmark(key_) !== value_;
    if (changed) {
      this._bookmarks.set(key_, value_);
      this.onBookmarkChanged.notify(key_, value_);
    }
  }

  getOption(key_) {
    return this._options.get(key_);
  }

  setOption(key_, value_) {
    const changed = this.getOption(key_) !== value_;
    if (changed) {
      this._options.set(key_, value_);
      this.onOptionChanged.notify(key_, value_);
    }
  }

  _initEvents() {
    this.onBookmarkChanged = new Observable();
    this.onOptionChanged = new Observable();
  }

  _loadLevelPack() {
    const storage = window.localStorage;
    this._levelPack = storage.getItem("level_pack") || "original";
  }

  _saveLevelPack() {
    const storage = window.localStorage;
    storage.setItem("level_pack", this._levelPack);
  }

  _loadBookmarks() {
    const storage = window.localStorage;
    let entries = storage.getItem("bookmarks");
    if (entries)
      entries = JSON.parse(entries);
    this._bookmarks = new Map(entries || []);
  }

  _saveBookmarks() {
    const storage = window.localStorage;
    const entries = [ ...this._bookmarks ];
    storage.setItem("bookmarks", JSON.stringify(entries));
  }

  _loadOptions() {
    const storage = window.localStorage;
    const entries = JSON.parse(storage.getItem("options"));
    this._options = new Map(entries || [
      [ "forklift_speed", 2 ],
      [ "rotation_speed", 2 ],
      [ "forks_speed", 2 ],
      [ "music_volume", 30 ],
      [ "ambient_sound_volume", 0 ],
      [ "sound_effects_volume", 50 ]
    ]);
  }

  _saveOptions() {
    const storage = window.localStorage;
    const entries = [ ...this._options ];
    storage.setItem("options", JSON.stringify(entries));
  }
}();