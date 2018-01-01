import { App } from "../gogocarto";
import { AppModes, AppStates } from "../app.module";
import { capitalize, unslugify } from "../utils/string-helpers";
import { ViewPort } from "../classes/classes";

declare var $;

export class GeocodingManager
{
  constructor()
  {
    App.geocoder.onGeocodeResult.do( () => { this.handleGeocodeResult(); App.searchBarComponent.handleGeocodeResult(); });
    App.geocoder.onGeolocalizationResult.do( (viewPort : ViewPort) => { this.handleGeolocalizationResult(viewPort); });
  }

  handleGeocodeResult()
  {
    //console.log("handleGeocodeResult", App.geocoder.getLocation());
    $('#directory-spinner-loader').hide();

    if (App.state == AppStates.ShowDirections)  
    {
      // we restart directions from App new start location
      App.setState(AppStates.ShowDirections,{id: App.infoBarComponent.getCurrElementId() });
    }    
    else
    {
      if (App.mode == AppModes.Map)
      {
        App.setState(AppStates.Normal);          
      }
      else
      {
        let location = App.geocoder.getLocation() ? App.geocoder.getLocation() : App.boundsModule.defaultCenter;
        App.boundsModule.createBoundsFromLocation(location);
        App.elementsModule.clearCurrentsElement();
        App.elementsModule.updateElementsToDisplay(true);
        let address = App.geocoder.lastAddressRequest;
        if (App.geocoder.getLocation()) 
          App.elementListComponent.setTitle(' autour de <i>' + capitalize(unslugify(address))) + '</i>';
      }      

      App.documentTitleModule.updateDocumentTitle();
    }        
  }

  handleGeolocalizationResult(viewPort)
  {
    if (App.mode == AppModes.Map)
    {
      App.setState(AppStates.Normal);
      App.mapComponent.panToLocation(viewPort.toLocation(), viewPort.zoom, false);      
    }
    else
    {
      App.boundsModule.createBoundsFromLocation(viewPort.toLocation());
      App.elementsModule.clearCurrentsElement();
      App.elementsModule.updateElementsToDisplay(true);
      App.elementListComponent.setTitle(' autour de <i>ma position</i>');
      // save the viewport if we go to map after
      App.mapComponent.setViewPort(viewPort);
    }    
  }
}