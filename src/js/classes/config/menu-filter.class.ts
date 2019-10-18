export class MenuFilter
{
  id : number;
  type : string;
  field : string;
  subtype : string;
  currentValue : any = {};
  expandedByDefault : boolean = true;
  options : any = {};

  constructor(data: any)
  {
    for(let field in data)
      this[field] = data[field];
  }
}