import { Event } from '../classes/event.class';
import { AppModule, AppStates } from '../app.module';
import { Element } from '../classes/classes';

import { App } from '../gogocarto';
declare let $: any, L: any;
declare let Routing;

export class Request {
  constructor(public route: string, public data: any) {}
}

export class AjaxModule {
  onNewElements = new Event<any[]>();

  isRetrievingElements = false;

  currElementIdRetrieving: number;
  currBoundsRetrieving: L.LatLngBounds[];

  requestWaitingToBeExecuted = false;
  waitingRequestFullRepresentation: boolean = null;

  currRequest: Request = null;

  loaderTimer = null;

  allElementsReceived = false;

  constructor() {}

  sendRequest(route: string, method: string, data: any, callbackSuccess?, callbackFailure?) {
    // console.log("SendAjaxRequest to " + route, data);
    $.ajax({
      url: route,
      method: method,
      data: data,
      success: (response) => {
        if (response && callbackSuccess) callbackSuccess(response);
      },
      error: (response) => {
        // when working with cross domain, there is a bug the server return empty response (status code = 0)
        // even if the request has been completed
        if (response.status == 0 && callbackSuccess) callbackSuccess(response);
        else if (callbackFailure) callbackFailure(response.data);
      },
    });
  }

  getElementById(elementId, callbackSuccess?, callbackFailure?) {
    if (elementId == this.currElementIdRetrieving) return;
    this.currElementIdRetrieving = elementId;

    $.ajax({
      url: this.getSingleElementApiUrl(elementId),
      method: 'get',
      data: {},
      success: (response) => {
        if (response) {
          let elementJson;
          if (response.data) elementJson = Array.isArray(response.data) ? response.data[0] : response.data;
          else elementJson = response;

          if (callbackSuccess) callbackSuccess(elementJson);
        } else if (callbackFailure) callbackFailure(response);

        this.currElementIdRetrieving = null;
      },
      error: (response) => {
        if (callbackFailure) callbackFailure(response);
        this.currElementIdRetrieving = null;
      },
    });
  }

  getElementsInBounds($bounds: L.LatLngBounds[], getFullRepresentation = false, expectedFilledBounds: L.LatLngBounds) {
    if (this.currBoundsRetrieving && $bounds[0].equals(this.currBoundsRetrieving[0])) return;
    this.currBoundsRetrieving = $bounds;

    // if invalid location we abort
    if (!$bounds || $bounds.length == 0 || !$bounds[0]) {
      return;
    }

    const boundsResult = this.convertBoundsIntoParams($bounds);

    const bnds = boundsResult.boundsJson;
    const dataRequest: any = {
      bounds: boundsResult.boundsString,
      boundsJson: JSON.stringify(boundsResult.boundsJson),
      categories: App.currMainId != 'all' ? [App.currMainId] : null,
      fullRepresentation: getFullRepresentation,
      ontology: getFullRepresentation ? 'gogofull' : 'gogocompact',
      stampsIds: App.request.stampsIds,
    };
    let route;
    if (getFullRepresentation) route = App.config.data.elementsApiUrl;
    else route = App.config.data.elementsCompactApiUrl || App.config.data.elementsApiUrl;

    this.sendAjaxElementRequest(new Request(route, dataRequest), expectedFilledBounds);
  }

  private convertBoundsIntoParams($bounds: L.LatLngBounds[]) {
    let stringifiedBounds = '';
    const digits = 5;
    const boundsLessDigits = [];
    for (let bound of $bounds) {
      const southWest = L.latLng(
        L.Util.formatNum(bound.getSouthWest().lat, digits),
        L.Util.formatNum(bound.getSouthWest().lng, digits)
      );
      const nortEast = L.latLng(
        L.Util.formatNum(bound.getNorthEast().lat, digits),
        L.Util.formatNum(bound.getNorthEast().lng, digits)
      );
      bound = L.latLngBounds(southWest, nortEast);
      boundsLessDigits.push(bound);
      stringifiedBounds += bound.toBBoxString() + ';';
    }

    // some API endpoint needs a fixed number of bounds equals to 4
    if ($bounds.length < 4) {
      const emptyBound = L.latLngBounds(L.latLng(0, 0), L.latLng(0, 0));
      for (let i = $bounds.length; i < 4; i++) boundsLessDigits.push(emptyBound);
    }

    return { boundsString: stringifiedBounds, boundsJson: boundsLessDigits };
  }

  private getSingleElementApiUrl($elementId: any): string {
    let route = '';
    if (App.config.data.elementByIdUrl) {
      route = App.config.data.elementByIdUrl;
      if (route.indexOf('{ID}') > 0) route = route.replace('{ID}', $elementId.toString());
      else {
        if (route.slice(-1) != '/') route += '/';
        route += $elementId;
      }
    } else 
      route = App.config.data.elementsApiUrl + '/' + $elementId;
    return route;
  }

  private sendAjaxElementRequest($request: Request, $expectedFilledBounds = null) {
    if (this.allElementsReceived) {
      /*console.log("All elements already received");*/ return;
    }

    // console.log("Ajax send elements request ", $request);

    if (this.isRetrievingElements) {
      //console.log("Ajax isRetrieving");
      this.requestWaitingToBeExecuted = true;
      this.waitingRequestFullRepresentation = $request.data.fullRepresentation;
      return;
    }

    this.isRetrievingElements = true;
    this.currRequest = $request;
    // let start = new Date().getTime();

    $.ajax({
      url: $request.route,
      method: 'get',
      data: $request.data,
      beforeSend: () => {
        this.loaderTimer = setTimeout(function () {
          $('#directory-loading').show();
        }, 1500);
      },
      success: (response) => {
        if (typeof response == 'string') response = JSON.parse(response);
        if (response.data !== null) {
          // let end = new Date().getTime();
          console.log('Ajax receive ' + response.data.length + ' elements');

          response.fullRepresentation = response.ontology == 'gogocompact' ? false : true;

          if ($expectedFilledBounds)
            App.boundsModule.updateFilledBoundsWithBoundsReceived(
              $expectedFilledBounds,
              $request.data.categories,
              $request.data.fullRepresentation
            );

          if (response.allElementsSends || !App.config.data.requestByBounds) this.allElementsReceived = true;

          this.onNewElements.emit(response);
        }
      },
      complete: () => {
        this.isRetrievingElements = false;
        this.currBoundsRetrieving = null;
        clearTimeout(this.loaderTimer);
        setTimeout(() => $('#directory-loading').hide(), 250);
        if (this.requestWaitingToBeExecuted) {
          //console.log("REQUEST WAITING TO BE EXECUTED, fullRepresentation", this.waitingRequestFullRepresentation);
          App.elementsManager.checkForNewElementsToRetrieve(this.waitingRequestFullRepresentation);
          this.requestWaitingToBeExecuted = false;
        }
      },
    });
  }
}
