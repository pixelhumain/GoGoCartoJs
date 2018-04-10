declare var $ : any;
import { App } from "../../gogocarto";
import { Element } from "../../classes/classes";
import { getCurrentElementIdShown, getCurrentElementInfoBarShown } from "../element/element-menu.component";
import { AjaxModule } from "../../modules/ajax.module";

export class StampComponent
{
  private dom;

  private elementId;
  private element : Element;

  private stampId;
  private value : boolean = false; // whether the stamp is activated for this element or not  

  constructor(dom : any)
  {
    this.dom = $(dom);
    this.stampId =   this.dom.data('stamp-id');
    this.elementId = this.dom.data('element-id');
    this.element = App.elementById(this.elementId);
    this.setValue(this.element.stamps.indexOf(this.stampId) > -1, false);
    this.dom.click(() => this.handleClick());    
  }

  handleClick()
  {
    let route = App.config.features.stamp.url;
    let data = { elementId: this.elementId, stampId: this.stampId, value: !this.value };

    App.ajaxModule.sendRequest(route, 'post', data, (response) =>
    { 
      if (response.data) this.element.stamps = response.data;
      if (response.success) this.setValue(!this.value);      
    });     
  }

  setValue(value : boolean, $animate = true)
  {
    this.value = value;
    this.element.update(true);
    this.dom.toggleClass("filled", value); 
    if ($animate && this.value) this.element.marker.animateDrop();  
  }
}