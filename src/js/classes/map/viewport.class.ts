export class ViewPort {
  constructor(public lat: number = 0, public lng: number = 0, public zoom: number = 0) {
    this.lat = lat || 0;
    this.lng = lng || 0;
    this.zoom = zoom || 0;
  }

  toString(): string {
    const digits = this.zoom > 14 ? 4 : this.zoom > 10 ? 3 : 2;
    return `@${this.lat.toFixed(digits)},${this.lng.toFixed(digits)},${this.zoom}z`;
  }

  fromString(string: string): null | ViewPort {
    if (!string) {
      return null;
    }

    const decode = string.split('@').pop().split(',');
    if (decode.length != 3) {
      console.log('ViewPort fromString erreur', string);
      return null;
    }
    this.lat = parseFloat(decode[0]) % 360;
    this.lng = parseFloat(decode[1]) % 360;
    this.zoom = parseInt(decode[2].slice(0, -1));

    //console.log("ViewPort fromString Done", this);

    return this;
  }

  toLocation(): L.LatLng {
    return L.latLng(this.lat, this.lng);
  }
}
