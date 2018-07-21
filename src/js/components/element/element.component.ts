  import { App } from "../../gogocarto";
import { AppModule, AppStates, AppModes } from "../../app.module";
import { Element, ElementStatus, ElementModerationState } from "../../classes/classes";
import { ImagesComponent } from './images.component';
import { ElementMenuComponent } from "./element-menu.component";
import { ModerationComponent } from '../element/moderation.component';
import { InteractiveSectionComponent } from './interactive-section.component';
declare var $;

export class ElementComponent
{
  element : Element;  
  imagesComponent : ImagesComponent;
  menuComponent : ElementMenuComponent;
  moderationComponent : ModerationComponent;
  interactiveComponent : InteractiveSectionComponent;

  constructor(element : Element)
  {
    this.element = element;
  }

  // use template js to create the html representation of the element
  // then this html representation is inserted in the dom by another component (like info-bar, or list component)
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
      currOptionsValues: this.element.getCurrDeepestOptionsValues().filter( (oV) => oV.option.displayInInfoBar).sort( (a,b) => a.isFilledByFilters ? -1 : 1),      
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

  get dom() { return $(`#element-info-${this.element.id}`); }

  // once the html rendered is inserted in the dom, we need to call this method to initializ various interactions and subcomponents
  initialize()
  {
    this.imagesComponent = new ImagesComponent(this.dom, this.element);    
    this.menuComponent = new ElementMenuComponent(this.dom.find('.menu-element'), this.element);
    this.moderationComponent = new ModerationComponent(this.dom.find('.interactive-section'), this.element);
    this.interactiveComponent = new InteractiveSectionComponent(this.dom.find('.interactive-section'), this.element);

    this.dom.find('.send-mail-btn').click( () => App.sendEmailComponent.open(this.element));

    // SHOW LONG DESCRIPTION BUTTON
    this.dom.find('.show-more-description').click( function() 
    { 
      let descriptionMore = $(this).siblings('.description-more');
      let textButton = descriptionMore.is(":visible") ? "Afficher plus" : "Afficher moins";
      descriptionMore.toggle();    
      $(this).text(textButton);
    });

    // INIT TABS (for admin section)
    setTimeout( () => { this.dom.find('.info-bar-tabs').tabs(); }, 100);
  }

  addFlashMessage(message) { this.interactiveComponent.addFlashMessage(message); }
}