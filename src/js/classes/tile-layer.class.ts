export class TileLayer
{
  name : string = '';
  url : string = '';
  attribution : string;

  constructor(name : string, url : string, attribution? : string) { 
    this.name = name; 
    this.url = url; 
    this.attribution = attribution || '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
}