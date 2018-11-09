import { World } from "./world.js";
import { override } from "./override.js";
import { settings as $settings } from "./settings.js";

window.DEBUG = true;

let world = null;

window.addEventListener("load", () => {
    override();
    $settings.load();
    world = new World();
    world.initAsync().then(() => { world.run(); });
  });

window.addEventListener("unload", () => {
    world.stop();
    world.dispose();
    world = null;
    $settings.save();
  });
