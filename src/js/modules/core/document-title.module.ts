import { App } from "../../gogocarto";
import { AppDataType, AppStates, AppModes } from "../../app.module";
import { capitalize, unslugify } from "../../utils/string-helpers";

export class DocumentTitleModule
{
  updateDocumentTitle(options : any = {})
  {
    // console.log("updateDocumentTitle", App.stateManager.stateElementId);

    let title : string;
    let elementName : string;

    if ( (options && options.id) || App.stateManager.stateElementId)
    {
      let element = App.elementById(App.stateManager.stateElementId);
      if (!element) return;
      elementName = capitalize(element ? element.name : '');
    }

    if (App.dataType == AppDataType.SearchResults)
    {
      title = 'Recherche : ' + App.searchBarComponent.getCurrSearchText();
    }
    else if (App.mode == AppModes.List)
    {
      title = 'Liste des ' + App.config.text.elementPlural + this.getLocationAddressForTitle();
    }
    else
    {
      switch (App.state)
      {
        case AppStates.ShowElement:
          title = capitalize(App.config.text.element) + ' - ' + elementName;
          break;

        case AppStates.ShowElementAlone:
          title = capitalize(App.config.text.element) + ' - ' + elementName;
          break;

        case AppStates.ShowDirections:
          title = 'Itinéraire - ' + elementName;
          break;

        case AppStates.Normal:
          title = 'Carte des ' + App.config.text.elementPlural + this.getLocationAddressForTitle();
          break;
      }
    }

    document.title = title;
  };

  private getLocationAddressForTitle()
  {
    if (App.geocoder.getLocationAddress())
    {
      return " - " + App.geocoder.getLocationAddress();
    }
    return "";
  }
}