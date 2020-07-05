export class MenuFilter
{
  id : number;
  type : string;
  field : string;
  subtype : string;
  currentValue : any = {};
  contracted : boolean = true; // only label visible, need to click to expand
  options : any = {};

  constructor(data: any)
  {
    for(let field in data)
      this[field] = data[field];
  }
}