import { App } from '../gogocarto';
import { Element } from '../classes/classes';
import { AppStates, AppModes } from '../app.module';

export enum AppDataType {
  All,
  SearchResults,
}

export class DataTypeManager {
  private dataType_: AppDataType = AppDataType.All;

  setDataType($dataType: AppDataType, $backFromHistory = false, $searchResult = null) {
    //console.log("setDataType", AppDataType[$dataType]);
    this.dataType_ = $dataType;

    if ($dataType == AppDataType.SearchResults && $searchResult) {
      App.stateManager.setState(AppStates.Normal);
      const elements = App.elementsJsonModule.convertJsonElements($searchResult.data, true, true).elementsConverted;
      App.elementsModule.setSearchResultElement(elements);
      App.filtersComponent.setMainOption('all');

      if ($searchResult.data.length > 0) {
        App.setMode(AppModes.List);
        App.mapComponent.fitElementsBounds(elements);
      }
    }

    App.elementsModule.clearCurrentsElement();
    App.elementListComponent.clear();
    App.elementsModule.updateElementsToDisplay(true);
    App.elementsManager.checkForNewElementsToRetrieve();

    if (!$backFromHistory) App.historyModule.pushNewState();
    App.documentTitleModule.updateDocumentTitle();
  }

  get dataType() {
    return this.dataType_;
  }
}
