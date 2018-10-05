export class Assets {
  constructor(scene_) {
    this._scene = scene_;
    this._promises = [];
    this._images = new Map();
    this._texts = new Map();
    this._assetsManager = new BABYLON.AssetsManager(this._scene);
  }

  loadAsync(assets_) {
    this._loadMeshes(assets_.meshes || []);
    this._loadImages(assets_.images || []);
    this._loadFonts(assets_.fonts || []);
    this._loadSounds(assets_.sounds || []);
    this._loadTexts(assets_.texts || []);
    this._promises.push(new Promise((resolve, reject) => {
      this._assetsManager.onTasksDoneObservable.add(() => { resolve(); });
      this._assetsManager.onTaskErrorObservable.add(task_ => {
        const error = task_.errorObject;
        console.error(error.message, error.exception);
        reject();
      });
      this._assetsManager.load();
    }));      
    return Promise.all(this._promises);
  }

  createMesh(name_) {
    const mesh = this._scene.getMeshByName(name_);
    const clone = mesh.clone(name_);
    clone.layerMask = 0x0FFFFFFF;
    for (const child of clone.getChildMeshes(false))
      child.layerMask = 0x0FFFFFFF;
    return clone;
  }

  getImage(name_) {
    return this._images.get(name_);
  }

  getSound(name_) {
    return this._scene.getSoundByName(name_);
  }

  getText(name_) {
    return this._texts.get(name_);
  }

  _loadMeshes(meshes_) {
    for (const name of meshes_) {
      const meshTask = this._assetsManager.addMeshTask("", "",
        "assets/meshes/gltf/", name + ".gltf");
      meshTask.onSuccess = task_ => {
        for (const mesh of task_.loadedMeshes)
          mesh.layerMask = 0x0;
      };
    };
  }

  _loadImages(images_) {
    for (const filename of images_) {
      const name = this._stripExtension(filename);
      const imageTask = this._assetsManager.addImageTask(
        filename, "assets/images/" + filename);
      imageTask.onSuccess = task_ => {
        this._images.set(name, task_.image);
      };
    }
  }

  _loadFonts(fonts_) {
    for (const name of fonts_) {
      const font = new FontFaceObserver(name);
      this._promises.push(font.load());
    }
  }

  _loadSounds(sounds_) {
    for (const filename of sounds_) {
      const name = this._stripExtension(filename);
      this._assetsManager.addSoundTask(
        "", name, "assets/sounds/" + filename);
    }
  }

  _loadTexts(texts_) {
    for (const filename of texts_) {
      const name = this._stripExtension(filename);
      const textTask = this._assetsManager.addTextFileTask(
        filename, "assets/texts/" + filename);
      textTask.onSuccess = task_ => {
        this._texts.set(name, task_.text);
      };
    }
  }

  _stripExtension(filename_) {
    return filename_.substring(0, filename_.lastIndexOf("."));
  }
}
