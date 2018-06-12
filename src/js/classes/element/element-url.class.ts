export class ElementUrl
{
  type : string = '';
  value: string = '';

  constructor($elementUrlJson)
  {
    if (typeof $elementUrlJson === 'string') $elementUrlJson = { key: '', value: $elementUrlJson };
    this.type = $elementUrlJson.type || '';
    this.value = $elementUrlJson.value || '';  
  }
}