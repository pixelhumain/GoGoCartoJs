export class Stamp {
  id: any;
  name = '';
  icon = '';
  elementIds: any[] = [];

  constructor($json) {
    this.id = $json.id || $json.name;
    this.name = $json.name;
    this.icon = $json.icon;
    this.elementIds = $json.elementIds;
  }
}
