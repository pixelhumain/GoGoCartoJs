import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";
import { Event } from "../../classes/event.class";
import { slugify } from "../../utils/string-helpers";

export interface ElementsConverted
{ 
  newElementsLength : number;
  elementsUpdatedLength : number;
  newElements : Element[];
  elementsConverted : Element[]
}

export class ElementsJsonModule
{
  onNewsElementsConverted = new Event<Element[]>();

  convertJsonElements(elementList : any[], checkIfAlreadyExist = true, isFullRepresentation : boolean = true) 
  {
    let element : Element, elementJson;
    let newElements : Element[] = [];
    let elementsConverted : Element[] = [];
    let start = new Date().getTime();

    if (isFullRepresentation)
      for (let elementJson of elementList)
        if (!elementJson.id) elementJson.id = (slugify(elementJson.name) + elementJson.geo.latitude).replace('.', '');

    let elementsIdsReceived = elementList.map( (e, index) =>  { return {
        id: isFullRepresentation ? e.id : e[0], // in compact way, id is the first element of an array
        index: index
    }});
    
    let newIds = elementsIdsReceived.filter((obj) => {return App.elementsModule.everyElementsId.indexOf(obj.id) < 0;});
    let elementToUpdateIds = [];

    if (isFullRepresentation)
    {      
      let elementToUpdateIds = elementsIdsReceived.filter((obj) => {return App.elementsModule.everyElementsId.indexOf(obj.id) >= 0;});
      let j = elementToUpdateIds.length;
      while(j--)
      {
        elementJson = elementList[elementToUpdateIds[j].index];
        element = App.elementById(elementJson.id);
        element.updateWithJson(elementJson);
        elementsConverted.push(element);
      }
    }

    let i = newIds.length;

    while(i--)
    {
      elementJson = elementList[newIds[i].index];
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
      newElementsLength : newIds.length, 
      elementsUpdatedLength : elementToUpdateIds.length, 
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
      this.convertJsonElements(elementJsonArray, true, true);
    }
  }
}