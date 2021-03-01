import { Element } from '../../classes/classes';
import { App } from '../../gogocarto';
import { Event } from '../../classes/event.class';
import { slugify, parseUriId } from '../../utils/string-helpers';

export interface ElementsConverted {
  newElementsLength: number;
  elementsUpdatedLength: number;
  newElements: Element[];
  elementsConverted: Element[];
}

export class ElementsJsonModule {
  elementsCreatedCount = 0;
  onNewsElementsConverted = new Event<Element[]>();

  convertJsonElements(elementList: any[], checkIfAlreadyExist = true, isFullRepresentation = true) {
    if (!elementList)
      return {
        newElementsLength: [],
        elementsUpdatedLength: 0,
        newElements: [],
        elementsConverted: [],
      };

    let element: Element, elementJson;
    const newElements: Element[] = [];
    let elementsConverted: Element[] = [];
    const start = new Date().getTime();

    this.cheksIdsAndCreateOnesIfNeeded(elementList);

    const newElementsJson = elementList.filter((obj) => App.elementsModule.everyElementsId.indexOf(obj.id) < 0);
    let elementsToUpdateJson = [];
    if (isFullRepresentation) {
      elementsToUpdateJson = elementList.filter((obj) => App.elementsModule.everyElementsId.indexOf(obj.id) >= 0);
      let j = elementsToUpdateJson.length;
      while (j--) {
        elementJson = elementsToUpdateJson[j];
        element = App.elementById(elementJson.id);
        element.updateWithJson(elementJson);
        elementsConverted.push(element);
      }
    }

    let i = newElementsJson.length;
    while (i--) {
      elementJson = newElementsJson[i];
      element = new Element(elementJson);
      element.initialize();
      newElements.push(element);
    }

    elementsConverted = elementsConverted.concat(newElements);

    const end = new Date().getTime();
    //console.log("AddJsonElements in " + (end-start) + " ms", elementJson);

    this.onNewsElementsConverted.emit(newElements);

    return {
      newElementsLength: newElementsJson.length,
      elementsUpdatedLength: elementsToUpdateJson.length,
      newElements: newElements,
      elementsConverted: elementsConverted,
    };
  }

  loadLocalElements() {
    if (Array.isArray(App.config.data.elements)) {
      const elementJsonArray = App.config.data.elements;
      const result = this.convertJsonElements(elementJsonArray, true, true);
      if (!App.config.data.elementsApiUrl) App.ajaxModule.allElementsReceived = true;
      if (!App.config.map.defaultBoundsProvided && (!App.historyStateManager.lastHistoryState || !App.historyStateManager.lastHistoryState.viewport)) {
        console.log('fit to elements bounds');
        App.mapComponent.fitElementsBounds(result.elementsConverted);
      }
    }
  }

  // Fixing missing Ids, or convert URI ids as standard Ids
  cheksIdsAndCreateOnesIfNeeded(elementList) {
    elementList.forEach((e, index) => {
      let id = e[0] || e.id || e['@id'];
      if (!id && e.compactJson) id = e.compactJson[0]; // in compact way, id is the first element of an array
      if (!id || typeof id != 'string') id = 'generated' + this.elementsCreatedCount++;
      else id = parseUriId(id);
      e.id = id;
    });
  }
}
