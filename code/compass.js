export class Compass
{
  static getOpposite(d_) {
    switch (d_) {
      case "n": return "s";
      case "e": return "w";
      case "s": return "n";
      case "w": return "e";
      case "u": return "d";
      case "d": return "u";
      default:
        console.error("Unknown direction: " + d_);
        break;
    }
  }

  static getCW(d_) {
    switch (d_) {
      case "n": return "e";
      case "e": return "s";
      case "s": return "w";
      case "w": return "n";
      default:
        console.error("Unknown direction: " + d_);
        break;
    }
  }

  static getCCW(d_) {
    switch (d_) {
      case "n": return "w";
      case "e": return "n";
      case "s": return "e";
      case "w": return "s";
      default:
        console.error("Unknown direction: " + d_);
        break;
    }
  }
}
