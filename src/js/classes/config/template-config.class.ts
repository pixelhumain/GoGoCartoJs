export enum TemplateNames {
  ElementBody,
  ElementHeader,
  MarkerPopup
}

export class TemplateConfig
{
  content : string;
  isMarkdown : boolean = true;
  type : string; // string or url
  name : TemplateNames;

  constructor($data : any, $name : TemplateNames)
  {
    this.content = $data.content;
    this.type = $data.type;
    this.isMarkdown = $data.isMarkdown;
    this.name = $name;
  }

  isUrl() { return this.type == "url"; }
}