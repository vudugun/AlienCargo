export function override() {
  const Up = BABYLON.Vector3.Up();

  BABYLON.Vector3.fromLocationRCH = function(r_, c_, h_) {
    return new BABYLON.Vector3(-c_, h_, -r_);
  };

  BABYLON.Quaternion.CW = function(axis_) {
    return BABYLON.Quaternion.RotationAxis(axis_, -(Math.PI / 2));
  }

  BABYLON.Quaternion.CCW = function(axis_) {
    return BABYLON.Quaternion.RotationAxis(axis_, Math.PI / 2);
  }

  BABYLON.Quaternion.Orientation = function(orientation_) {
    switch (orientation_) {
      case "n":
        return BABYLON.Quaternion.RotationAxis(Up, 0);
      case "e":
        return BABYLON.Quaternion.RotationAxis(Up, -(Math.PI / 2));
      case "s":
        return BABYLON.Quaternion.RotationAxis(Up, Math.PI);
      case "w":
        return BABYLON.Quaternion.RotationAxis(Up, Math.PI / 2);
      default:
        console.error("Unknown orientation: " + orientation_);
        break;
    }
  };
}
