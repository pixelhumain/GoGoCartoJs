import { AppModule, AppStates, AppDataType, AppModes } from '../../app.module';
import { HistoryState, ViewPort } from '../../classes/classes';

import { App } from '../../gogocarto';

declare let routie: any, $;

export class RouterModule {
  filtersSerializedParam = '';

  constructor() {
    routie({
      'geolocalize /:mode/autour-de-moi': (mode) => {
        const initialState = new HistoryState();

        initialState.dataType = AppDataType.All;
        initialState.mode = mode == 'carte' ? AppModes.Map : AppModes.List;
        initialState.state = AppStates.Normal;
        initialState.address = 'geolocalize';
        initialState.filters = this.filtersSerializedParam;

        this.startState(initialState);
      },
      'normal /:mode/:addressAndViewport?': (mode, addressAndViewport = '') => {
        const initialState = new HistoryState();
        const parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

        initialState.dataType = AppDataType.All;
        initialState.mode = mode == 'carte' ? AppModes.Map : AppModes.List;
        initialState.state = AppStates.Normal;
        initialState.address = parsedAddressAndViewport[0];
        initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
        initialState.filters = this.filtersSerializedParam;

        this.startState(initialState);
      },
      'show_element /fiche/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') => {
        const initialState = new HistoryState();
        const parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

        initialState.dataType = AppDataType.All;
        initialState.mode = AppModes.Map;
        initialState.state = AppStates.ShowElementAlone;
        initialState.address = parsedAddressAndViewport[0];
        initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
        initialState.id = id;
        initialState.filters = this.filtersSerializedParam;

        this.startState(initialState);
      },
      'show_directions /itineraire/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') => {
        const initialState = new HistoryState();
        const parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

        initialState.dataType = AppDataType.All;
        initialState.mode = AppModes.Map;
        initialState.state = AppStates.ShowDirections;
        initialState.address = parsedAddressAndViewport[0];
        initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
        initialState.id = id;
        initialState.filters = this.filtersSerializedParam;

        this.startState(initialState);
      },
      'search /:mode/rechercher/:text': (mode, text) => {
        const initialState = new HistoryState();

        initialState.dataType = AppDataType.SearchResults;
        initialState.mode = AppModes.List;
        initialState.state = AppStates.Normal;
        initialState.text = text;
        initialState.filters = this.filtersSerializedParam;

        this.startState(initialState);
      },
      'search_option /category/:name/:id': (mode, id) => {
        const initialState = new HistoryState();

        initialState.dataType = AppDataType.All;
        initialState.mode = AppModes.Map;
        initialState.state = AppStates.Normal;
        initialState.filters = this.filtersSerializedParam;

        this.startState(initialState);
        App.searchBarComponent.searchOption(App.taxonomyModule.getOptionById(id));
      },
    });
  }

  loadInitialState() {
    if (App.config.general.activateHistoryStateAndRouting) {
      // check GET parameters inside the hash
      const splited = window.location.hash.split('?cat=');

      if (splited.length > 1) this.filtersSerializedParam = splited[1];

      let routeHash = splited[0];

      // handle wrong hash
      if (!routeHash || routeHash == '#/' || routeHash == '#') routeHash = '/carte';
      routie.navigate(routeHash);

      // let the hash being changed with a timeOut
      setTimeout(() => routie.reload(), 10);
    } else {
      const initialHash = window.location.hash;
      // navigate to default route
      routie.navigate('/carte');
      setTimeout(() => routie.reload(), 10);
      // restore initial hash
      setTimeout(() => (window.location.hash = initialHash), 100);
    }
  }

  generate(routeName: string, options?: any) {
    return '#' + routie.lookup(routeName, options);
  }

  // address and viewport are joined into one string, seperated by "@"
  private parseAddressViewport($addressViewport) {
    // precaution in case GET param still in hash
    $addressViewport = $addressViewport.split('?')[0];

    const splited = $addressViewport.split('@');

    if (splited.length == 1) {
      return [$addressViewport, ''];
    } else {
      return splited;
    }
  }

  private startState(state: HistoryState) {
    App.historyStateManager.load(state);
  }
}
