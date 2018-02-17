import { AppModule, AppStates, AppDataType, AppModes } from "../../app.module";
import { HistoryState, ViewPort } from '../../classes/classes'; 

import { App } from "../../gogocarto";

declare var routie: any, $;

export class RouterModule
{
	filtersSerializedParam : string = '';

	constructor()
	{
		routie({
			'geolocalize /:mode/autour-de-moi': (mode) =>
			{
				let initialState = new HistoryState();

				initialState.dataType = AppDataType.All;
				initialState.mode = mode == 'carte' ? AppModes.Map : AppModes.List;
				initialState.state = AppStates.Normal;				
				initialState.address = 'geolocalize';
				initialState.filters = this.filtersSerializedParam;

				this.startState(initialState);			
			},
			'normal /:mode/:addressAndViewport?': (mode, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = mode == 'carte' ? AppModes.Map : AppModes.List;
				initialState.state = AppStates.Normal;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.filters = this.filtersSerializedParam;

				this.startState(initialState);
			},
			'show_element /fiche/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.ShowElementAlone;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.id = id;
				initialState.filters = this.filtersSerializedParam;

				this.startState(initialState);
			},
			'show_directions /itineraire/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.ShowDirections;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.id = id;
				initialState.filters = this.filtersSerializedParam;

				this.startState(initialState);	
			},
			'search /:mode/recherche/:text': (mode, text) =>
			{
				let initialState = new HistoryState();

				initialState.dataType = AppDataType.SearchResults;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.Normal;				
				initialState.text = text;
				initialState.filters = this.filtersSerializedParam;

				this.startState(initialState);
			}
		});		
	}

	loadInitialState()
	{		
		// check GET parameters inside the hash
		let splited = window.location.hash.split('?cat=');
		
		if (splited.length > 1) this.filtersSerializedParam = splited[1];

		let routeHash = splited[0];

		// handle wrong hash
		if (!routeHash || routeHash == '#/' || routeHash == '#') routeHash = '/carte';
		routie.navigate(routeHash);

		// let the hash being changed with a timeOut
		setTimeout(() => routie.reload(), 10);

		if (!App.config.general.activateHistoryStateAndRouting) {
			setTimeout(() => window.location.hash = "", 100);
		}
	}

	generate(routeName : string, options? : any, absoluteUrl? : boolean)
	{
		return '#' + routie.lookup(routeName, options);
	}

	// address and viewport are joined into one string, seperated by "@"
	private parseAddressViewport($addressViewport)
  {
    // precaution in case GET param still in hash
		$addressViewport = $addressViewport.split('?')[0];

    let splited = $addressViewport.split('@');

    if (splited.length == 1)
    {
        return [$addressViewport, ''];
    }
    else
    {
        return splited;
    }  
  }

  private startState(state : HistoryState)
  {
		App.historyStateManager.load(state);		
  }
}