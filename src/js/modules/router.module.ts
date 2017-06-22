import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";
import { HistoryState } from './history.module';
import { ViewPort } from '../components/map/map.component'; 

import { App } from "../gogocarto";

declare var routie: any, $;

export class RouterModule
{
	constructor()
	{
		routie({
			'gogocarto_normal /:mode/:addressAndViewport?': (mode, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = mode == 'carte' ? AppModes.Map : AppModes.List;
				initialState.state = AppStates.Normal;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);

				// timeout to let App variable being accesible
				setTimeout( () => { App.loadHistoryState(initialState); }, 0);				
			},
			'gogocarto_showElement /acteur/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.ShowElementAlone;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.id = id;

				// timeout to let App variable being accesible
				setTimeout( () => { App.loadHistoryState(initialState); }, 0);	
			},
			'gogocarto_showDirections /itineraire/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.ShowDirections;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.id = id;
			},
			'gogocarto_search /:mode/recherche/:text': (mode, text) =>
			{
				let initialState = new HistoryState();

				initialState.dataType = AppDataType.SearchResults;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.Normal;				
				initialState.text = text;
			}
		});		
	}

	loadInitialState()
	{
		//console.log("initial route", window.location.hash);
		routie.navigate(window.location.hash || '/carte');
	}

	generate(routeName : string, options? : any, absoluteUrl? : boolean)
	{
		// console.log("Generate", options);
		// console.log("result", routie.lookup(routeName, options));
		return '#' + routie.lookup(routeName, options);
	}

	private parseAddressViewport($addressViewport)
  {
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
}