import { App } from '../gogocarto';
import { AppDataType, AppModes, AppStates } from '../app.module';
import { HistoryState, ViewPort } from '../classes/classes';
import * as Cookies from '../utils/cookies';
declare let $, L: any;

export class HistoryStateManager {
  lastHistoryState: HistoryState = null;
  /*
   * Load initial state or state popped by window history manager
   */
  load(historystate: HistoryState, $backFromHistory = false) {
    if (historystate === null) return;
    this.lastHistoryState = historystate;
    console.log('loadHistorystate', historystate);

    if (historystate.dataType == AppDataType.SearchResults) {
      // force setting dataType before searchBarComponent to avoid history issues
      App.setDataType(historystate.dataType, true);
      App.searchBarComponent.loadSearchElements(historystate.text, $backFromHistory);
      $('#directory-spinner-loader').hide();
    } else {
      // check viewport and address from cookies
      if (
        App.config.map.saveViewportInCookies &&
        !historystate.viewport &&
        !historystate.address &&
        historystate.state == AppStates.Normal
      ) {
        console.log(
          'no viewport nor address provided, using cookies values',
          Cookies.readCookie('viewport'),
          Cookies.readCookie('address')
        );
        if (Cookies.readCookie('viewport'))
          historystate.viewport = new ViewPort().fromString(Cookies.readCookie('viewport'));
        if (Cookies.readCookie('address')) historystate.address = Cookies.readCookie('address');
        if (historystate.address) $('.search-bar').val(historystate.address);
      }
    }

    if (historystate.filters) App.filterRoutingModule.loadFiltersFromString(historystate.filters);
    else App.filtersComponent.setMainOption('all');

    if (
      historystate.dataType == AppDataType.All &&
      historystate.viewport &&
      historystate.state != AppStates.ShowElementAlone
    ) {
      // if map not loaded we just set the mapComponent viewport without changing the
      // actual viewport of the map, because it will be done in
      // map initialisation
      App.mapComponent.setViewPort(historystate.viewport, App.mapComponent.isMapLoaded);

      // on list mode initialize bounds
      if (historystate.mode == AppModes.List) {
        App.boundsModule.createBoundsFromLocation(L.latLng(historystate.viewport.lat, historystate.viewport.lng));
      }

      $('#directory-spinner-loader').hide();

      if (historystate.mode == AppModes.List) {
        const location = L.latLng(historystate.viewport.lat, historystate.viewport.lng);
      }
    }

    App.setMode(historystate.mode, $backFromHistory, false);

    // if address is provided we geolocalize this address
    if (historystate.dataType == AppDataType.All && historystate.address && !historystate.id) {
      if (historystate.address == 'geolocalize') {
        App.searchBarComponent.geolocateUser();
      } else {
        App.geocoder.geocodeAddress(
          historystate.address,
          (results) => {
            // if viewport is given, nothing to do, we already did initialization with viewport
            if (historystate.viewport && historystate.mode == AppModes.Map) return;
            // fit bounds anyway so the mapcomponent will register App requested bounds for later
            App.mapComponent.fitBounds(App.geocoder.getBounds());
          },
          () => {
            // failure callback
            App.searchBarComponent.setValue('');
            if (!historystate.viewport) {
              App.mapComponent.fitDefaultBounds();
              App.component.toastMessage("Erreur, cette adresse n'a pas pu être localisée : " + historystate.address);
            }
          }
        );
      }
    }

    if (
      !historystate.viewport &&
      !historystate.address &&
      (App.config.data.elementsApiUrl || App.config.map.defaultBoundsProvided) &&
      historystate.state != AppStates.ShowElementAlone
    ) {
      console.log('fit default bounds no viewport no address');
      App.mapComponent.fitDefaultBounds();
    }

    if (historystate.id) {
      setTimeout(() => {
        App.setState(
          historystate.state,
          {
            id: historystate.id,
            panToLocation: historystate.viewport === null,
          },
          $backFromHistory
        );
        $('#directory-spinner-loader').hide();
      }, 0);
    } else {
      App.setState(historystate.state, null, $backFromHistory);
    }
  }
}
