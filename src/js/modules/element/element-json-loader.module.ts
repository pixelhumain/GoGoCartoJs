import { Element, ElementBase, ElementStatus, PostalAddress } from "../../classes/classes";
import { capitalize, slugify, splitLongText } from "../../utils/string-helpers";
import { App } from "../../gogocarto";
declare var $, L;

export class ElementJsonParserModule
{
  load(elementJson : any, element : Element | ElementBase)
  {
    // patch to handle compactJson stored inside a "compactJson" property (use with Semantic Bus)
    if (elementJson.compactJson) 
    {
      let id = elementJson.id;
      elementJson = elementJson.compactJson;
      elementJson.id = id;
    }

    // when we get the compact json representation of the element from the server
    // the elementJson is a simple array with the more important element attribute
    if ($.isArray(elementJson) && elementJson.length >= 5)
      this.loadFromCompactJson(elementJson, element);
    else 
      this.loadFromFullJson(elementJson, element);
  }

  private loadFromCompactJson(elementJson : any, element : Element | ElementBase)
  {
    element.id = elementJson.id; // the element has been modified before to fixs bad ids     
    element.name = capitalize(elementJson[1]);
    element.position = L.latLng(elementJson[2], elementJson[3]);     
    App.elementOptionValuesModule.createOptionValues(elementJson[4], element);   
    element.status = elementJson.length >= 6 ? elementJson[5] : 1;  
    element.moderationState = elementJson.length >= 7 ? elementJson[6] : 0;
  }

  private loadFromFullJson(elementJson : any, element : Element | ElementBase)
  {
    // MADATORY DATA
    element.id = elementJson.id || elementJson['@id'];
    element.position = L.latLng(elementJson.latitude || elementJson.lat || elementJson.geo && elementJson.geo.latitude, 
                                elementJson.longitude || elementJson.lng || elementJson.long || elementJson.geo && elementJson.geo.longitude);
    element.name = capitalize(elementJson.name || elementJson.title);
    element.address = new PostalAddress(elementJson.address);   
    this.createOptionsValues(elementJson, element);

    // OPTIONAL DATA
    element.status = elementJson.status == undefined ? 1 : elementJson.status;
    element.moderationState = elementJson.moderationState || 0;    
    element.searchScore = elementJson.searchScore;    
    element.isEditable = elementJson.editable || elementJson.isEditable || (element.status != 7 && element.status != -7);

    // SPECIFIC DATA
    element.openHours = elementJson.openHours;
    App.elementFormaterModule.calculateFormatedOpenHours(element);
    element.stamps = elementJson.stamps || [];    
    element.images = [];
    if(elementJson.image) element.images.push(elementJson.image);
    else if (elementJson.images) element.images = [].concat(elementJson.images);
    element.images = element.images.filter((imageUrl) => imageUrl.length > 0);    
   
    // CUSTOM DATA
    element.data = elementJson;    

    // ADMIN HISTORY DATA
    element.reports = elementJson.reports;
    element.contributions = elementJson.contributions;
    element.pendingContribution = elementJson.pendingContribution;
    element.votes = elementJson.votes;

    // PENDING ELEMENTS
    if(elementJson.modifiedElement && element.status != -5) 
    {
      let modifiedElement = new ElementBase(elementJson.modifiedElement); 

      // calcul and store diff optionsValues in modified element
      this.createOptionsValues(elementJson.modifiedElement, modifiedElement);      
      let diffOptionValues = App.elementDiffModule.getDiffOptionValues(element.optionsValues, modifiedElement.optionsValues);
      modifiedElement.optionsValues = diffOptionValues;

      element.modifiedElement = modifiedElement;
    }    
    
    element.isFullyLoaded = true
  }

  private createOptionsValues(elementJson : any, element : Element | ElementBase)
  {
    App.elementOptionValuesModule.createOptionValues(elementJson.categories || elementJson.taxonomy || elementJson.optionValues, element);
    if (elementJson.categoriesDescriptions)
      App.elementOptionValuesModule.updateOptionsWithDescription(element, elementJson.categoriesDescriptions);
  }
}