/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

import { Event } from "../utils/event";
import { slugify, capitalize } from "../commons/commons";
import { AppModule, AppStates, AppModes, AppDataType } from "../app.module";
import { Element } from "../classes/element.class";
import { ViewPort } from "../components/map/map.component";
import * as Cookies from "../utils/cookies";

import { App } from "../gogocarto";
declare let $;
declare let Routing;

$(document).ready(function()
{	
   // Gets history state from browser
   window.onpopstate = (event : PopStateEvent) =>
   {
	  //console.log("\n\nOnpopState ", event.state.filters);
	  let historystate : HistoryState = event.state;
	  if (!historystate) return;
	  // transform jsonViewport into ViewPort object (if we don't do so,
	  // the ViewPort methods will not be accessible)
	  historystate.viewport = $.extend(new ViewPort(), event.state.viewport);
	  App.loadHistoryState(event.state, true);
	};
});

export class HistoryState
{
	mode: AppModes;
	state : AppStates;
	dataType : AppDataType;
	address : string;
	viewport : ViewPort;
	id : number;
	text : string;
	filters : string;

	parse($historyState : any) : HistoryState
	{
		this.mode = $historyState.mode == 'Map' ? AppModes.Map : AppModes.List;
		this.state = parseInt(AppStates[$historyState.state]);
		this.dataType = parseInt(AppDataType[$historyState.dataType]);
		this.address = $historyState.address;
		this.viewport = typeof $historyState.viewport === 'string' ? new ViewPort().fromString($historyState.viewport) : $historyState.viewport;
		this.id = $historyState.id;
		this.text = $historyState.text;
		this.filters = $historyState.filters;
		return this;
	}
}

export class HistoryModule
{

	constructor() { }  

	updateCurrState(options?)
	{
		//console.log("Update Curr State");
		if (!history.state) { console.log("curr state null");this.pushNewState();return;}
		this.updateHistory(false, options);
	};

	pushNewState(options?)
	{
		//console.log("Push New State");

		if (history.state === null) this.updateHistory(false, options);
		else this.updateHistory(true, options);
		
	};

	private updateHistory($pushState : boolean, $options? : any)
	{
		if (App.mode == undefined) return;

		$options = $options || {};
		let historyState = new HistoryState;
		historyState.mode = App.mode;
		historyState.state = App.state;
		historyState.dataType = App.dataType;
		historyState.address = App.geocoder.getLocationSlug();
		historyState.viewport = App.mapComponent.viewport;
		historyState.id = App.infoBarComponent.getCurrElementId() || $options.id;
		historyState.filters = App.filterRoutingModule.getFiltersToString();
		historyState.text = App.searchBarComponent.getCurrSearchText();
		// if ($pushState) console.log("NEW Sate", historyState.filters);
		// else console.log("UPDATE State", historyState.filters);

		let route = this.generateRoute(historyState);

		if (!route) return;

		if ($pushState)
		{
			history.pushState(historyState, '', route);
			//console.log("Pushing new state", historyState);
		}
		else 
		{
			//console.log("Replace state", historyState);
			history.replaceState(historyState, '', route);
		}

		Cookies.createCookie('viewport',historyState.viewport);
		Cookies.createCookie('address',historyState.address);
	};

	private generateRoute(historyState : HistoryState)
	{
		let route;
		let mode = App.mode == AppModes.Map ? 'carte' : 'liste';
		let address = historyState.address;
		let viewport = historyState.viewport;
		let addressAndViewport = '';
		if (address) addressAndViewport += address;
		// in Map Mode we add viewport
		// in List mode we add viewport only when no address provided
		if (viewport && (App.mode == AppModes.Map || !address)) addressAndViewport += viewport.toString();

		if (App.dataType == AppDataType.SearchResults)
		{
			route = App.routerModule.generate('search', { mode :  mode, text : historyState.text });	
		}		
		else if (App.mode == AppModes.List)
		{
			// in list mode we don't care about state
			route = App.routerModule.generate('normal', { mode :  mode, addressAndViewport: addressAndViewport });	
		}
		else
		{
			switch (App.state)
			{
				case AppStates.Normal:	
					route = App.routerModule.generate('normal', { mode :  mode, addressAndViewport: addressAndViewport });	
					break;

				case AppStates.ShowElement:	
				case AppStates.ShowElementAlone:
				case AppStates.ShowDirections:
					if (!historyState.id) return;
					let element = App.elementById(historyState.id);
					if (!element) return;		

					if (App.state == AppStates.ShowDirections)
					{
						route = App.routerModule.generate('show_directions', { name :  capitalize(slugify(element.name)), id : element.id, addressAndViewport: addressAndViewport });	
					}	
					else
					{
						route = App.routerModule.generate('show_element', { name :  capitalize(slugify(element.name)), id : element.id, addressAndViewport: addressAndViewport });	
					}						
					break;		
			}		
		}

		if (historyState.filters) route += '?cat=' + historyState.filters;

		return route;
	};
}