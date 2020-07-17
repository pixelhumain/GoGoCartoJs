import { App } from '../gogocarto';
import { AppModes, AppStates } from '../app.module';
import { capitalize, unslugify } from '../utils/string-helpers';
import { ViewPort } from '../classes/classes';

declare let $;

export class GeocodingManager {
  constructor() {
    App.geocoder.onGeocodeResult.do(() => {
      this.handleGeocodeResult();
      App.searchBarComponent.handleGeocodeResult();
    });
    App.geocoder.onGeolocalizationResult.do((viewPort: ViewPort) => {
      this.handleGeolocalizationResult(viewPort);
    });
  }

  handleGeocodeResult() {
    //console.log("handleGeocodeResult", App.geocoder.getLocation());
    $('#directory-spinner-loader').hide();

    if (App.state == AppStates.ShowDirections) {
      // we restart directions from App new start location
      App.setState(AppStates.ShowDirections, {
        id: App.stateManager.stateElementId,
      });
    } else {
      if (App.mode == AppModes.Map && App.state != AppStates.ShowElementAlone) {
        App.setState(AppStates.Normal);
      } else {
        const location = App.geocoder.getLocation() ? App.geocoder.getLocation() : App.boundsModule.defaultCenter;
        App.boundsModule.createBoundsFromLocation(location);
        App.elementsModule.clearCurrentsElement();
        App.elementsModule.updateElementsToDisplay(true);
        const address = App.geocoder.getLocationAddress();
        if (App.geocoder.getLocation())
          App.elementListComponent.setTitle(
            ` ${App.config.translate('around')} <i>${capitalize(unslugify(address))}</i>`
          );
      }

      App.documentTitleModule.updateDocumentTitle();
    }
  }

  handleGeolocalizationResult(viewPort) {
    if (App.mode == AppModes.Map) {
      App.setState(AppStates.Normal);
      App.mapComponent.panToLocation(viewPort.toLocation(), viewPort.zoom, false);
    } else {
      App.boundsModule.createBoundsFromLocation(viewPort.toLocation());
      App.elementsModule.clearCurrentsElement();
      App.elementsModule.updateElementsToDisplay(true);
      App.elementListComponent.setTitle(
        ` ${App.config.translate('around')} <i>${App.config.translate('my.position')}</i>`
      );
      // save the viewport if we go to map after
      App.mapComponent.setViewPort(viewPort);
    }
  }
}
