import { App } from "../gogocarto";
import { AppDataType } from "../app.module";
import { capitalize, unslugify } from "../utils/string-helpers";

export enum AppModes
{
  Map = 1,
  List = 2
}

export class ModeManager
{
  private mode_ : AppModes = null;

  /*
  * Change App mode
  */
  setMode($mode : AppModes, $backFromHistory : boolean = false, $updateTitleAndState = true)
  {
    App.elementsModule.clearCurrentsElement();
    App.elementListComponent.clear();

    if ($mode == AppModes.Map) this.setMapMode();
    else this.setListMode();

    // if previous mode wasn't null 
    let oldMode = this.mode_;
    this.mode_ = $mode;

    // update history if we need to
    if (oldMode != null && !$backFromHistory) App.historyModule.pushNewState();

    App.gogoControlComponent.updatePosition();
    
    setTimeout( () => App.elementsModule.updateElementsToDisplay(true) , 300);

    if ($updateTitleAndState)
    {
      App.documentTitleModule.updateDocumentTitle();  

      // after clearing, we set the current state again
      if ($mode == AppModes.Map) App.setState(App.state, {id : App.stateManager.stateElementId});  
    }
  }

  private setMapMode()
  {
    App.mapComponent.show();
    App.elementListComponent.hide();        

    App.mapComponent.init();    

    if (App.mapComponent.isMapLoaded) App.boundsModule.extendBounds(0, App.mapComponent.getBounds());
  }

  private setListMode()
  {
    App.mapComponent.hide();
    App.elementListComponent.show();        

    // console.log("list mode", App.geocoder.getLocation());      

    if (App.dataType == AppDataType.All)
    {
      let centerLocation : L.LatLng;
      let address = App.geocoder.lastAddressRequest;

      if (App.mapComponent.isInitialized) {
        centerLocation = App.mapComponent.getCenter();
        App.elementListComponent.setTitle(' autour du centre de la carte');
      }
      else if (App.geocoder.getLocation()) {          
        centerLocation = App.geocoder.getLocation();
        App.elementListComponent.setTitle(' autour de <i>' + capitalize(unslugify(address)) + '</i>');
      }
      else {
        centerLocation = App.boundsModule.defaultCenter;
        App.elementListComponent.setTitle('');
      }         

      App.boundsModule.createBoundsFromLocation(centerLocation);
      App.elementsManager.checkForNewElementsToRetrieve(true);
    }
    else if (App.dataType == AppDataType.SearchResults)
    {
      App.elementsModule.updateElementsToDisplay(true,false);
      App.elementListComponent.setTitle('');
    }      
  }

  get mode() { return this.mode_; }
}