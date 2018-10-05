export class Location {
  constructor(r_, c_, h_) {
    this._r = r_;
    this._c = c_;
    this._h = h_;
  }

  static equal(lhs_, rhs_) {
    if (lhs_ === null && rhs_ === null)
      return true;
    if (lhs_ !== null && rhs_ !== null)
      return lhs_.r === rhs_.r && lhs_.c === rhs_.c && lhs_.h === rhs_.h;
    return false;
  }

  get r() { return this._r; }
  get c() { return this._c; }
  get h() { return this._h; }

  dr(n_) { return new Location(this.r + n_, this.c, this.h); }
  dc(n_) { return new Location(this.r, this.c + n_, this.h); }
  dh(n_) { return new Location(this.r, this.c, this.h + n_); }
  
  sr(r_) { return new Location(r_, this.c, this.h); }
  sc(c_) { return new Location(this.r, c_, this.h); }
  sh(h_) { return new Location(this.r, this.c, h_); }

  dd(d_) {
    switch (d_) {
      case "n": return this.dr(-1);
      case "e": return this.dc(+1);
      case "s": return this.dr(+1);
      case "w": return this.dc(-1);
      case "u": return this.dh(+1);
      case "d": return this.dh(-1);
      default:
        console.error("Unknown direction: " + d_);
        break;
    }
  }
}