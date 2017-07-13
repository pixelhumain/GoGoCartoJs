import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";
import { HistoryState } from './history.module';
import { ViewPort } from '../components/map/map.component'; 

import { App } from "../gogocarto";

declare var routie: any, $;

export class RouterModule
{
	GETParams = { cat: ''};

	constructor()
	{
		routie({
			'normal /:mode/:addressAndViewport?': (mode, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = mode == 'carte' ? AppModes.Map : AppModes.List;
				initialState.state = AppStates.Normal;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.filters = this.GETParams.cat;

				// timeout to let App variable being accesible
				setTimeout( () => { App.loadHistoryState(initialState); }, 0);				
			},
			'show_element /acteur/:name/:id/:addressAndViewport?': (name, id, addressAndViewport = '') =>
			{
				let initialState = new HistoryState();
				let parsedAddressAndViewport = this.parseAddressViewport(addressAndViewport);

				initialState.dataType = AppDataType.All;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.ShowElementAlone;				
				initialState.address = parsedAddressAndViewport[0];
				initialState.viewport = new ViewPort().fromString(parsedAddressAndViewport[1]);
				initialState.id = id;
				initialState.filters = this.GETParams.cat;

				// timeout to let App variable being accesible
				setTimeout( () => { App.loadHistoryState(initialState); }, 0);	
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
				initialState.filters = this.GETParams.cat;

				// timeout to let App variable being accesible
				setTimeout( () => { App.loadHistoryState(initialState); }, 0);	
			},
			'search /:mode/recherche/:text': (mode, text) =>
			{
				let initialState = new HistoryState();

				initialState.dataType = AppDataType.SearchResults;
				initialState.mode = AppModes.Map;
				initialState.state = AppStates.Normal;				
				initialState.text = text;
				initialState.filters = this.GETParams.cat;

				// timeout to let App variable being accesible
				setTimeout( () => { App.loadHistoryState(initialState); }, 0);
			}
		});		
	}

	loadInitialState()
	{		
		// check GET parameters inside the hash
		let splited = window.location.hash.split('?');
		
		if (splited.length > 1) this.GETParams = this.parseGETparam();

		routie.navigate(splited[0] || '/carte');
		// let the hash being changed with a timeOut
		setTimeout(() => routie.reload(), 0);
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

  // obtain the GET parameters from the url ( ?=parameter=value), also inside the hash
  parseGETparam(param? : string) 
  {
		var vars = {};
		window.location.href.replace( window.location.hash.split('?')[0], '&' ).replace( 
			/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
			function( m, key, value ) { // callback
				vars[key] = value !== undefined ? value : '';
				return vars[key];
			}
		);

		if ( param ) {
			return vars[param] ? vars[param] : null;	
		}
		return vars;
	}
}