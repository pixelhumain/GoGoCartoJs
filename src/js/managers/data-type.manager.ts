import { App } from "../gogocarto";
import { Element } from "../classes/classes";

export enum AppDataType 
{
  All,
  SearchResults
}

export class DataTypeManager
{
  private dataType_ : AppDataType = AppDataType.All;

  setDataType($dataType : AppDataType, $backFromHistory : boolean = false)
  {
    //console.log("setDataType", AppDataType[$dataType]);
    this.dataType_ = $dataType;
    App.elementsModule.clearCurrentsElement();  
    App.elementListComponent.clear();
    App.elementsModule.updateElementsToDisplay(true);    
    App.elementsManager.checkForNewElementsToRetrieve();  
    if (!$backFromHistory) App.historyModule.pushNewState();
    App.documentTitleModule.updateDocumentTitle();
  }

  get dataType() { return this.dataType_; }
}