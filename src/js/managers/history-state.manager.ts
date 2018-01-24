import { App } from "../gogocarto";
import { AppDataType, AppModes, AppStates } from "../app.module";
import { HistoryState, ViewPort } from "../classes/classes";
import * as Cookies from "../utils/cookies";
declare var $, L : any;

export class HistoryStateManager
{
  /*
  * Load initial state or state popped by window history manager
  */
  load(historystate : HistoryState, $backFromHistory = false)
  {
    if (historystate === null) return;  

    console.log("loadHistorystate", historystate);  

    if (historystate.dataType == AppDataType.SearchResults)
    {
      // force setting dataType before searchBarComponent to avoid history issues
      App.setDataType(historystate.dataType, true);
      App.searchBarComponent.searchElements(historystate.text, $backFromHistory);
      $('#directory-spinner-loader').hide();
    }  
    else
    {
      // check viewport and address from cookies
      if (App.config.map.saveViewportInCookies && !historystate.viewport && !historystate.address && historystate.state == AppStates.Normal) 
      {
        console.log("no viewport nor address provided, using cookies values");
        historystate.viewport = new ViewPort().fromString(Cookies.readCookie('viewport'));
        historystate.address = Cookies.readCookie('address');
        if (historystate.address) $('.search-bar').val(historystate.address);
      }    
    }    

    if (historystate.filters)
    {
      App.filterRoutingModule.loadFiltersFromString(historystate.filters);
    }
    else
    {
      App.filtersComponent.setMainOption('all');
    }    

    if (historystate.dataType == AppDataType.All && historystate.viewport && historystate.state != AppStates.ShowElementAlone)
    {      
      // if map not loaded we just set the mapComponent viewport without changing the
      // actual viewport of the map, because it will be done in
      // map initialisation
      App.mapComponent.setViewPort(historystate.viewport, App.mapComponent.isMapLoaded);

      // on list mode initialize bounds
      if (historystate.mode == AppModes.List)
      {
        App.boundsModule.createBoundsFromLocation(L.latLng(historystate.viewport.lat, historystate.viewport.lng));
      }

      $('#directory-spinner-loader').hide();  

      if (historystate.mode == AppModes.List )
      {
        let location = L.latLng(historystate.viewport.lat, historystate.viewport.lng);
      }  
    }  

    App.setMode(historystate.mode, $backFromHistory, false);
    
    // if address is provided we geolocalize
    // if no viewport and state normal we geocode on default location
    if (historystate.dataType == AppDataType.All && (historystate.address || (!historystate.viewport && historystate.state === AppStates.Normal))) 
    {
      if (historystate.address == "geolocalize")
      {
        App.searchBarComponent.geolocateUser();
      }
      else
      {
        App.geocoder.geocodeAddress(
          historystate.address, 
          (results) => 
          { 
            // if viewport is given, nothing to do, we already did initialization
            // with viewport
            if (historystate.viewport && historystate.mode == AppModes.Map) return;
            // fit bounds anyway so the mapcomponent will register App requested bounds for later
            App.mapComponent.fitBounds(App.geocoder.getBounds());
          },
          () => {
            // failure callback
            App.searchBarComponent.setValue("Erreur de localisation : " + historystate.address);
            if (!historystate.viewport) 
            {
              // geocode default location
              App.geocoder.geocodeAddress('');
            }
          }  
        );
      }      
    }

    if (historystate.id) 
    {
      setTimeout( () => { 
        App.setState(
          historystate.state,
          {
            id: historystate.id, 
            panToLocation: (historystate.viewport === null)
          },
          $backFromHistory);
        $('#directory-spinner-loader').hide();    
      }, 400);  
    }
    else
    {
      App.setState(historystate.state, null, $backFromHistory);    
    }    
  };    
}