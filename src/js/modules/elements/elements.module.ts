import { AppModule, AppStates, AppModes, AppDataType } from '../../app.module';
import { App } from '../../gogocarto';
declare let $;

import { Event } from '../../classes/event.class';
import { Element, ElementStatus } from '../../classes/classes';

export interface ElementsToDisplayChanged {
  elementsToDisplay: Element[];
  newElements: Element[];
  elementsToRemove: Element[];
}

export class ElementsModule {
  onElementsToDisplayChanged = new Event<ElementsToDisplayChanged>();

  private everyElements_: Element[][] = [];
  private everyElementsId_: string[] = [];

  // current visible elements
  private visibleElements_: Element[][] = [];
  private searchResultElements_: Element[] = [];

  firstElementsHaveBeendisplayed = false;

  initialize() {
    this.everyElements_['all'] = [];
    this.visibleElements_['all'] = [];
    for (const option of App.taxonomyModule.getMainOptions()) {
      this.everyElements_[option.id] = [];
      this.visibleElements_[option.id] = [];
    }
  }

  addElements(newElements: Element[]) {
    for (const element of newElements) {
      for (const mainId of element.mainOptionOwnerIds) {
        this.everyElements_[mainId].push(element);
      }
      this.everyElements_['all'].push(element);
      this.everyElementsId_.push(element.id);
    }

    App.favoriteModule.checkCookies();
    App.stampModule.checkForAddingStamps(newElements);
  }

  clearCurrentsElement() {
    const visibleElements = this.currVisibleElements();
    if (!visibleElements || !visibleElements.length) return;
    let l = visibleElements.length;
    while (l--) {
      visibleElements[l].isDisplayed = false;
    }
    App.mapComponent.clearMarkers();

    this.clearCurrVisibleElements();
  }

  // check elements in bounds and who are not filtered
  updateElementsToDisplay(checkInAllElements = true, filterHasChanged = false) {
    if (App.mode == AppModes.Map && !App.mapComponent.isMapLoaded) {
      return;
    }

    let elements: Element[] = [];

    // Getting the element array to work on
    if (
      (App.state == AppStates.ShowElementAlone || App.state == AppStates.ShowDirections) &&
      App.mode == AppModes.Map
    ) {
      elements = [App.DEAModule.getElement()];
    } else if (App.dataType == AppDataType.All) {
      if (checkInAllElements || this.visibleElements_.length === 0) {
        elements = this.currEveryElements();
      } else {
        elements = this.currVisibleElements();
      }
    } else if (App.dataType == AppDataType.SearchResults) {
      elements = this.searchResultElements_;
    }

    if (!elements) {
      return;
    }

    let i: number, element: Element;

    const newElements: Element[] = [];
    const elementsToRemove: Element[] = [];

    i = elements.length;
    const filterModule = App.filterModule;
    const currBounds = App.boundsModule.extendedBounds;
    const start = new Date().getTime();

    // console.log("updateElementsToDisplay. Nbre element à traiter : " + i, checkInAllElements);

    while (i--) {
      element = elements[i];

      if (!element) {
        break;
      }

      let elementInBounds = false;
      if (this.noNeedToCheckBounds()) {
        elementInBounds = true;
      } else {
        elementInBounds = currBounds && element.position && currBounds.contains(element.position);
      }

      if (elementInBounds && filterModule.checkIfElementPassFilters(element)) {
        if (!element.isDisplayed) {
          element.isDisplayed = true;
          this.currVisibleElements().push(element);
          newElements.push(element);
        }
      } else {
        if (element.isDisplayed) {
          element.isDisplayed = false;
          elementsToRemove.push(element);
          const index = this.currVisibleElements().indexOf(element);
          if (index > -1) {
            this.currVisibleElements().splice(index, 1);
          }
        }
      }
    }

    const end = new Date().getTime();
    const time = end - start;

    //window.console.log("UpdateElementsToDisplay en " + time + " ms");
    this.onElementsToDisplayChanged.emit({
      elementsToDisplay: this.currVisibleElements(),
      newElements: newElements,
      elementsToRemove: elementsToRemove,
    });

    this.updateElementsIcons(filterHasChanged);

    // strange bug, at initialization, some isolated markers are not displayed
    // refreshing the elementModule solve this...
    if (!this.firstElementsHaveBeendisplayed && this.currVisibleElements() && this.currVisibleElements().length > 0) {
      this.firstElementsHaveBeendisplayed = true;
      setTimeout(() => {
        this.updateElementsToDisplay(true);
      }, 100);
    }
  }

  private noNeedToCheckBounds() {
    return App.mode == AppModes.List && (App.dataType != AppDataType.All || App.ajaxModule.allElementsReceived);
  }

  updateElementsIcons(somethingChanged = false) {
    //console.log("UpdateCurrElements somethingChanged", somethingChanged);
    const start = new Date().getTime();

    const visibleElements = this.currVisibleElements();
    if (!visibleElements || !visibleElements.length) return;

    let l = visibleElements.length;
    let element: Element;
    while (l--) {
      element = visibleElements[l];
      if (somethingChanged) element.needToBeUpdatedWhenShown = true;

      // if domMarker not visible that's mean that marker is in a cluster
      if (element.marker.domMarker().is(':visible')) element.update();
    }
    const end = new Date().getTime();
    const time = end - start;
    //window.console.log("updateElementsIcons " + time + " ms");
  }

  setSearchResultElement(elements: Element[]) {
    this.searchResultElements_ = elements;
  }
  getSearchElements(): Element[] {
    return this.searchResultElements_;
  }

  get everyElements() {
    return this.everyElements_;
  }
  get everyElementsId() {
    return this.everyElementsId_;
  }
  get visibleElements() {
    return this.visibleElements_;
  }
  get searchResultElements() {
    return this.searchResultElements_;
  }

  currVisibleElements() {
    return this.visibleElements_[App.currMainId];
  }
  currEveryElements() {
    return this.everyElements_[App.currMainId];
  }
  setCurrVisibleElements(elements: Element[]) {
    this.visibleElements_[App.currMainId] = elements;
  }

  private clearCurrVisibleElements() {
    this.visibleElements_[App.currMainId] = [];
  }

  allElements() : Element[] {
    return this.everyElements_['all'];
  }

  getElementById(elementId): Element {
    for (let i = 0; i < this.allElements().length; i++) {
      if (this.allElements()[i].id == elementId) return this.allElements()[i];
    }
    return null;
  }
}
