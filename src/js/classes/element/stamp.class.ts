export class Stamp
{
  id : any;
  name : string = '';
  icon : string = '';
  elementIds : any[] = [];

  constructor($json)
  {
    this.id = $json.id || $json.name;
    this.name = $json.name;
    this.icon = $json.icon;  
    this.elementIds = $json.elementIds;  
  }
}