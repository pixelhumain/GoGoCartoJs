export class MenuFilter
{
  id : number;
  type : string;
  field : string;
  subtype : string;
  currentValue : any = {};
  expanded_by_default : boolean = true;
  options : any = {};

  constructor(data: any)
  {
    for(let field in data)
      this[field] = data[field];
  }
}