import { Element, ElementBase, ElementStatus, PostalAddress } from "../../classes/classes";
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";
declare var $, L;

export class ElementJsonParserModule
{
  load(elementJson : any, element : Element | ElementBase)
  {
    // when we get the compact json representation of the element from the server
    // the elementJson is a simple array with the more important element attribute
    if (!elementJson.id && $.isArray(elementJson) && elementJson.length >= 5)
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
    // we overide anyway all attributes (it can have changed !)
    element.id = elementJson.id;
    element.position = L.latLng(elementJson.geo.latitude, elementJson.geo.longitude);
    element.name = elementJson.name;
    element.status = elementJson.status == undefined ? 1 : elementJson.status;
    element.moderationState = elementJson.moderationState || 0;

    // update createOptionValue vene if element already exist
    App.elementOptionValuesModule.createOptionValues(elementJson.optionValues, element);
    
    if(elementJson.modifiedElement) 
    {
      element.modifiedElement = new ElementBase(elementJson.modifiedElement);
      let diffOptionValues = App.elementDiffModule.getDiffOptionValues(elementJson.optionValues, elementJson.modifiedElement.optionValues);
      App.elementOptionValuesModule.createOptionValues(diffOptionValues, element.modifiedElement);   
    }
    
    element.description = capitalize(elementJson.description) || '';
    element.descriptionMore = capitalize(elementJson.descriptionMore) || '';
    this.checkForMergeDescriptions(element);

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
    element.website = elementJson.website;
    element.email = elementJson.email || '';
    element.openHours = elementJson.openHours;
    element.openHoursMoreInfos =  elementJson.openHoursMoreInfos; 
    
    element.searchScore = elementJson.searchScore;

    element.isFullyLoaded = true;
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

  // if the description and descriptionMore are small, we can merge them into one single description
  private checkForMergeDescriptions(element)
  {
    if ( element.status != ElementStatus.PendingModification &&
         element.status != ElementStatus.ModifiedElement &&
         element.descriptionMore.length > 0 && 
         (element.description.length + element.descriptionMore.length) < 300)
    {
      element.description = element.description + '<br /> ' + element.descriptionMore;
      element.descriptionMore = '';
    }
  }
}