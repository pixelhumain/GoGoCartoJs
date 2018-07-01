import { App } from "../../gogocarto";
import { AppModule, AppStates, AppModes } from "../../app.module";
import { Element, ElementStatus, ElementModerationState } from "../../classes/classes";
declare var $;

export class ElementComponent
{
  element : Element;

  constructor(element : Element)
  {
    this.element = element;
  }

  // use template js to create the html representation of the element
  render() 
  {  
    if (!this.element.isFullyLoaded) { return; }

    this.element.update();  
    this.element.updateDistance();

    let optionsToDisplay = this.element.getIconsToDisplay();

    let rootCategoriesValues;
    if (this.element.status == ElementStatus.PendingModification && this.element.modifiedElement)  
      rootCategoriesValues = this.element.modifiedElement.getRootCategoriesValues();
    else
      rootCategoriesValues = this.element.getRootCategoriesValues();
    
    let html = App.templateModule.render('element', 
    {
      element : this.element, 
      showDistance: App.geocoder.getLocation() ? true : false,
      listingMode: App.mode == AppModes.List, 
      optionsToDisplay: optionsToDisplay,
      mainOptionToDisplay: optionsToDisplay[0], 
      otherOptionsToDisplay: optionsToDisplay.slice(1),  
      currOptionsValues: this.element.getCurrOptionsValues().filter( (oV) => oV.option.displayInInfoBar).sort( (a,b) => a.isFilledByFilters ? -1 : 1),      
      rootCategoriesValues : rootCategoriesValues,
      editUrl : App.config.features.edit.url + this.element.id,
      ElementStatus: ElementStatus,
      ElementModerationState: ElementModerationState,
      isIframe : App.isIframe,
      isMapMode : App.mode == AppModes.Map,
      config : App.config,
      smallWidth : App.mode == AppModes.Map && App.infoBarComponent.isDisplayedAside(),
      allowedStamps : App.stampModule.allowedStamps
    });
          
    return html;
  };
}