import { App } from "../../gogocarto";
import { AppModes } from "../../app.module";
import { Element } from "../../classes/classes";
declare var L : any;

export class DirectionsModule
{
  begin(origin : L.LatLng, element : Element) 
  {
    if (!origin || !element) { console.log(`origin ${origin} element ${element}`); return;}

    if (App.mode == AppModes.List)
    {
      if (!App.mapComponent.isInitialized)
      {
        App.mapComponent.onMapReady.do(() => { this.beginCalculation(origin, element); });
      }           

      App.setMode(AppModes.Map, false, false);
    } 
      
    this.beginCalculation(origin, element);
  } 

  private beginCalculation = function (origin : L.LatLng, element : Element)
  {
    if (!App.mapComponent.isInitialized) return;

    App.DEAModule.begin(element.id, false);
    // wait for the info bar to open, so the map is resized at this final viewport
    // Then we can calculate route and fitbounds regarding routing result
    setTimeout( () => { App.directionsComponent.calculateRoute(origin, element); }, 400);     
  };
}