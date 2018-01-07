import { App } from "../gogocarto";
import { AppDataType, AppModes } from "../app.module";
import { Element } from "../classes/classes";

export enum AppStates 
{
  Normal,
  ShowElement,
  ShowElementAlone,
  ShowDirections
}

export class StateManager
{
  // curr state of the app
  private state_ : AppStates = null;  

  // somes states need a element id, we store it in this property
  private stateElementId_ : number = null;

  get state() { return this.state_; }
  get stateElementId() { return this.stateElementId_; }

  /*
  * Change App state
  */
  setState($newState : AppStates, options : any = {}, $backFromHistory : boolean = false) 
  {   
    //console.log("AppModule set State : " + AppStates[$newState]  +  ', options = ',options);
    
    let element;

    let oldStateName = this.state_;
    this.state_ = $newState;      

    if (oldStateName == AppStates.ShowDirections && App.directionsModule) 
      App.directionsModule.clear();

    if (oldStateName == AppStates.ShowElementAlone)  
    {
      App.elementsModule.clearCurrentsElement();
      App.displayElementAloneModule.end();  
    }  

    this.stateElementId_ = options ? options.id : null;
    
    switch ($newState)
    {
      case AppStates.Normal: this.setNormalState(); break;
      case AppStates.ShowElement: this.setShowElementState(element, options); break; 
      case AppStates.ShowElementAlone: this.setShowElementAloneState(element, options); break;
      case AppStates.ShowDirections: this.setShowDirectionsState(element, options);break;      
    }

    if (!$backFromHistory && App.dataType == AppDataType.All &&
       ( oldStateName !== $newState 
        || $newState == AppStates.ShowElement
        || $newState == AppStates.ShowElementAlone
        || $newState == AppStates.ShowDirections) )
      App.historyModule.pushNewState(options);

    App.documentTitleModule.updateDocumentTitle(options);
  };

  private setNormalState()
  {
    App.infoBarComponent.hide(false);
  }  

  private setShowElementState(element, options)
  {
    if (!options.id) return;
    element = App.elementById(options.id);

    if (App.mode == AppModes.List)
    {
      if (!App.mapComponent.isInitialized)
      {
        App.mapComponent.onMapReady.do(() => 
        {
          App.mapComponent.panToLocation(element.position, 14, false);
          App.infoBarComponent.showElement(options.id);
        });
      }
      else
      {
        App.mapComponent.panToLocation(element.position, 14, false);            
        App.infoBarComponent.showElement(options.id);
      }            

      App.setMode(AppModes.Map, false, false);
    } 
    else // AppMode
    {
      App.infoBarComponent.showElement(options.id);
    }
  }  

  private setShowElementAloneState(element, options)
  {
    if (!options.id) return;

    App.infoBarComponent.show();
    element = App.elementById(options.id);
    if (element)
    {
      App.DEAModule.begin(element.id, true);          
    }
    else
    {
      App.ajaxModule.getElementById(options.id,
        (elementJson) => {
          App.elementsJsonModule.convertJsonElements([elementJson], true, true);
          App.DEAModule.begin(elementJson.id, true);
          App.documentTitleModule.updateDocumentTitle(options);
          App.historyModule.pushNewState(options); 
        },
        (error) => 
        { 
          alert("Cet élément n'existe pas ou a été supprimé !"); 
          App.setState(AppStates.Normal);
        }
      );            
    }      
  }

  private setShowDirectionsState(element : Element, options)
  {
    let origin = App.geocoder.getLocation(); 
    // if no element, we get it from ajax 
    if (!element)
    {
      if (!options.id) return; 
      App.ajaxModule.getElementById(options.id, (elementJson) => 
      { 
        App.elementsJsonModule.convertJsonElements([elementJson], true, true);
        element = App.elementById(elementJson.id);
        App.documentTitleModule.updateDocumentTitle(options);  
        this.beginDirectionModule(element);                        
      },
      (error) => { /*TODO*/ alert("No element with App id"); }
      );               
    }

    this.beginDirectionModule(element)  
  }

  private beginDirectionModule(element)
  {
    let origin = App.geocoder.getLocation();
      
    if (element && origin)
      App.directionsModule.begin(origin, element);  
  }
}