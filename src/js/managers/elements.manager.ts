import { App } from '../gogocarto';
import { AppModes, AppDataType } from '../app.module';
import { ElementsToDisplayChanged } from '../modules/elements/elements.module';

export class ElementsManager {
  constructor() {
    App.ajaxModule.onNewElements.do((result) => {
      this.handleNewElementsReceivedFromServer(result);
    });
    App.elementsJsonModule.onNewsElementsConverted.do((newElements) => {
      App.elementsModule.addElements(newElements);
    });
    App.elementsModule.onElementsToDisplayChanged.do((ElementsToDisplayChanged) => {
      this.handleElementsToDisplayChanged(ElementsToDisplayChanged);
    });
  }

  checkForNewElementsToRetrieve($getFullRepresentation = false) {
    if (App.dataType != AppDataType.All) return;
    if (App.config.data.elementsApiUrl) {
      this.retrieveMissingElementsViaApi($getFullRepresentation);
    }
  }

  private retrieveMissingElementsViaApi($getFullRepresentation: boolean) {
    // console.log("checkForNewelementToRetrieve, fullRepresentation", $getFullRepresentation);
    const result = App.boundsModule.calculateFreeBounds($getFullRepresentation);
    // console.log("checkForNewelementToRetrieve, calculateBounds", result);
    if (result.status == 'allRetrieved') {
      App.elementListComponent.handleAllElementsRetrieved();
      return; // nothing to do, all elements already retrieved
    } else if (result.status == 'included') {
      // We simulate the end of a successeful ajax request
      App.boundsModule.updateFilledBoundsWithBoundsReceived(
        result.expectedFillBounds,
        App.currMainId,
        $getFullRepresentation
      );
      this.handleNewElementsReceivedFromServer({
        data: [],
        fullRepresentation: $getFullRepresentation,
      });
      return;
    }

    // Normal behaviour, getting missing elements via Ajax request
    const freeBounds = result.freeBounds;
    const expectedFilledBounds = result.expectedFillBounds;
    if (freeBounds && freeBounds.length > 0)
      App.ajaxModule.getElementsInBounds(freeBounds, $getFullRepresentation, expectedFilledBounds);
  }

  handleNewElementsReceivedFromServer(result) {
    const elementsJson = result.data || result['@graph'] || result;
    if (result.mapping) App.elementJsonParser.compactMapping = result.mapping;
    const elements = App.elementsJsonModule.convertJsonElements(elementsJson, true, result.fullRepresentation);
    // console.log("new Elements length", elements);

    // on add markerClusterGroup after first elements received
    if (elements.newElementsLength > 0 || (App.mode == AppModes.List && result.fullRepresentation)) {
      App.elementsModule.updateElementsToDisplay(true);
    }

    App.filtersComponent.updateElementCount();
  }

  handleElementsToDisplayChanged(result: ElementsToDisplayChanged) {
    const start = new Date().getTime();

    // console.log("Display = " + result.elementsToDisplay.length + " / remove = " + result.elementsToRemove.length + " / add = " + result.newElements.length);

    if (App.mode == AppModes.List) {
      App.elementListComponent.update(result.elementsToDisplay);
      if (App.ajaxModule.allElementsReceived) App.elementListComponent.handleAllElementsRetrieved();
    } else {
      if (!App.mapComponent.isInitialized) {
        return;
      }

      if (App.config.map.useClusters) App.mapComponent.markersGroup.restoreUnclusters(true);

      // In some cases, markerCluster works faster clearing alls markers and adding them again
      if (result.elementsToRemove.length + result.newElements.length > result.elementsToDisplay.length) {
        App.mapComponent.clearMarkers();
        App.mapComponent.addMarkers(result.elementsToDisplay.map((e) => e.marker.getLeafletMarker()));
      } else {
        App.mapComponent.removeMarkers(result.elementsToRemove.map((e) => e.marker.getLeafletMarker()));
        App.mapComponent.addMarkers(result.newElements.map((e) => e.marker.getLeafletMarker()));
      }

      App.mapComponent.addFeatures(result.newElements.filter((e) => e.feature).map((e) => e.feature));
      App.mapComponent.removeFeatures(result.elementsToRemove.filter((e) => e.feature).map((e) => e.feature));

      if (App.config.map.useClusters) App.mapComponent.markersGroup.checkForUnclestering(App.map().getBounds());
    }

    const end = new Date().getTime();
    //console.log("ElementsToDisplayChanged in " + (end-start) + " ms");
  }
}
