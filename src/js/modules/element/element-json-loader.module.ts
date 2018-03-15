import { Element, ElementBase, ElementStatus, PostalAddress } from "../../classes/classes";
import { capitalize, slugify, splitLongText } from "../../utils/string-helpers";
import { App } from "../../gogocarto";
declare var $, L;

export class ElementJsonParserModule
{
  load(elementJson : any, element : Element | ElementBase)
  {
    // when we get the compact json representation of the element from the server
    // the elementJson is a simple array with the more important element attribute
    if ($.isArray(elementJson) && elementJson.length >= 5)
      this.loadFromCompactJson(elementJson, element);
    else 
      this.loadFromFullJson(elementJson, element);
  }

  private loadFromCompactJson(elementJson : any, element : Element | ElementBase)
  {
    element.id = elementJson[0];      
    element.name = elementJson[1];
    element.position = L.latLng(elementJson[2], elementJson[3]);     
    App.elementOptionValuesModule.createOptionValues(elementJson[4], element);   
    element.status = elementJson.length >= 6 ? elementJson[5] : 1;  
    element.moderationState = elementJson.length >= 7 ? elementJson[6] : 0;         
  }

  private loadFromFullJson(elementJson : any, element : Element | ElementBase)
  {
    // if the element was not prefilled with the compact json representation
    // we ovewrite anyway all attributes (it can have changed !)
    element.id = elementJson.id;

    element.position = L.latLng(elementJson.latitude || elementJson.lat || elementJson.geo && elementJson.geo.latitude, 
                                elementJson.longitude || elementJson.lng || elementJson.long || elementJson.geo && elementJson.geo.longitude);
    element.name = elementJson.name || elementJson.title;
    element.status = elementJson.status == undefined ? 1 : elementJson.status;
    element.moderationState = elementJson.moderationState || 0;

    // update createOptionValue vene if element already exist
    App.elementOptionValuesModule.createOptionValues(elementJson.categories || elementJson.taxonomy || elementJson.tags || elementJson.optionValues, element);
    if (elementJson.categoriesDescriptions)
      App.elementOptionValuesModule.updateOptionsWithDescription(element, elementJson.categoriesDescriptions);

    if(elementJson.modifiedElement) 
    {
      element.modifiedElement = new ElementBase(elementJson.modifiedElement);
      let diffOptionValues = App.elementDiffModule.getDiffOptionValues(elementJson.categories, elementJson.modifiedElement.categories);
      App.elementOptionValuesModule.createOptionValues(diffOptionValues, element.modifiedElement);   
    }
    
    element.description = elementJson.description || elementJson.abstract || elementJson.label && elementJson.label["@value"];
    element.description = capitalize(element.description || '') ;
    element.longDescription = elementJson.descriptionMore;
    element.longDescription = capitalize(element.longDescription || ''); 
    this.checkForMergeDescriptions(element);
    this.checkForSplitDescription(element);

    element.address = new PostalAddress(elementJson.address);

    // element.reports = element.createObjectArrayFromJson(VoteReport, elementJson.reports);
    // element.contributions = element.createObjectArrayFromJson(Contribution, elementJson.contributions);
    // element.votes = element.createObjectArrayFromJson(VoteReport, elementJson.votes);

    element.reports = elementJson.reports;
    element.contributions = elementJson.contributions;
    element.pendingContribution = elementJson.pendingContribution;
    element.votes = elementJson.votes;

    element.commitment = elementJson.commitment || '';
    element.telephone = App.elementFormaterModule.getFormatedTel(elementJson.telephone);  
    element.website = elementJson.website || elementJson.site;
    element.email = elementJson.email || elementJson.contact || '';
    element.openHours = elementJson.openHours;
    App.elementFormaterModule.calculateFormatedOpenHours(element);
    element.openHoursMoreInfos = elementJson.openHoursMoreInfos || elementJson.openHoursString; 
    element.image = elementJson.image;
    
    element.searchScore = elementJson.searchScore;

    element.isFullyLoaded = true
  }

  private createObjectArrayFromJson(klass, elementsJson)
  {
    elementsJson = elementsJson || [];
    let result = [];
    for(let elementJson of elementsJson)
    {
      result.push(new klass(elementJson));
    }
    return result;
  } 

  // if the description and longDescription are small, we can merge them into one single description
  private checkForMergeDescriptions(element)
  {
    if ( element.status != ElementStatus.PendingModification &&
         element.status != ElementStatus.ModifiedElement &&
         element.longDescription.length > 0 && 
         (element.description.length + element.longDescription.length) < 300)
    {
      if (element.description.length > 0) element.description = element.description + '<br /> ';
      element.description += element.longDescription;
      element.longDescription = '';
    }
  }

  private checkForSplitDescription(element : ElementBase)
  {
    if ( element.status != ElementStatus.PendingModification &&
         element.status != ElementStatus.ModifiedElement)
    {
      if (element.description.length > 300) {        
        let result = splitLongText(element.description, 300, 80);
        element.description = result.first + " (Suite au dessous...)";
        if (element.longDescription) result.second += "</br>" + element.longDescription;
        element.longDescription = result.second;
      }

      if (element.longDescription.length > 600) {
        let result = splitLongText(element.longDescription, 500, 100);
        element.longDescriptionMore = result.first;
        element.longDescription = result.second;      
      }        
    }
  }
}