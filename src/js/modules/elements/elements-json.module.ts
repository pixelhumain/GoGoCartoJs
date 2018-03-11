import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";
import { Event } from "../../classes/event.class";
import { slugify, parseUriId } from "../../utils/string-helpers";

export interface ElementsConverted
{ 
  newElementsLength : number;
  elementsUpdatedLength : number;
  newElements : Element[];
  elementsConverted : Element[]
}

export class ElementsJsonModule
{
  elementsCreatedCount : number = 0;
  onNewsElementsConverted = new Event<Element[]>();

  convertJsonElements(elementList : any[], checkIfAlreadyExist = true, isFullRepresentation : boolean = true) 
  {
    if (!elementList) return { 
      newElementsLength : [], 
      elementsUpdatedLength : 0, 
      newElements: [], 
      elementsConverted: [], 
    };

    let element : Element, elementJson;
    let newElements : Element[] = [];
    let elementsConverted : Element[] = [];
    let start = new Date().getTime();
    
    this.cheksIdsAndCreateOnesIfNeeded(elementList, isFullRepresentation);
    
    let newElementsJson = elementList.filter((obj) => App.elementsModule.everyElementsId.indexOf(obj.id) < 0 );
    let elementsToUpdateJson = [];

    if (isFullRepresentation)
    {      
      elementsToUpdateJson = elementList.filter((obj) => App.elementsModule.everyElementsId.indexOf(obj.id) >= 0 );
      let j = elementsToUpdateJson.length;
      while(j--)
      {
        elementJson = elementsToUpdateJson[j];
        element = App.elementById(elementJson.id);
        element.updateWithJson(elementJson);
        elementsConverted.push(element);
      }
    }

    let i = newElementsJson.length;
    while(i--)
    {
      elementJson = newElementsJson[i];
      element = new Element(elementJson);
      element.initialize();
      newElements.push(element);
    }

    elementsConverted = elementsConverted.concat(newElements);
    App.favoriteModule.checkCookies();

    let end = new Date().getTime();
    //console.log("AddJsonElements in " + (end-start) + " ms", elementJson);  

    this.onNewsElementsConverted.emit(newElements);

    return { 
      newElementsLength : newElementsJson.length, 
      elementsUpdatedLength : elementsToUpdateJson.length, 
      newElements: newElements, 
      elementsConverted: elementsConverted
    };
  };

  loadLocalElements()
  {
    if (!App.config.data.retrieveElementsByApi)
    {
      let elements = App.config.data.elements;
      let elementJsonArray = elements.length ? elements : elements.data;
      let result = this.convertJsonElements(elementJsonArray, true, true);
      App.ajaxModule.allElementsReceived = true;
      if (!App.config.map.defaultBoundsProvided && !App.historyStateManager.lastHistoryState.viewport) {
        console.log("fit to elements bounds");
        App.mapComponent.fitElementsBounds(result.elementsConverted);
      }
    }
  }

  // Fixing missing Ids, or convert URI ids as standard Ids
  cheksIdsAndCreateOnesIfNeeded(elementList, isFullRepresentation)
  {
    elementList.forEach( (e, index) =>  {
      let id = isFullRepresentation ? e.id || e["@id"] : e[0]; // in compact way, id is the first element of an array

      if (!id) id = this.elementsCreatedCount++;
      else id = parseUriId(id);
      e.id = id;      
    });
  }
}