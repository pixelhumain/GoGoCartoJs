/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
/// <reference types="leaflet" />

declare let window;
declare var $;

// MANAGERS
import { ModeManager, AppModes } from "./managers/mode.manager";
export { AppModes } from "./managers/mode.manager";
import { StateManager, AppStates } from "./managers/state.manager";
export { AppStates } from "./managers/state.manager";

// MODULES
import { GeocoderModule, GeocodeResult } from "./modules/geocoder.module";
import { FilterModule } from "./modules/filter.module";
import { FilterRoutingModule } from "./modules/filter-routing.module";
import { ElementsModule, ElementsChanged } from "./modules/elements.module";
import { DisplayElementAloneModule } from "./modules/display-element-alone.module";
import { AjaxModule } from "./modules/ajax.module";
import { CategoriesModule } from './modules/categories.module';
import { DirectionsModule } from "./modules/directions.module";
import { RouterModule } from "./modules/router.module";
import { LoginModule } from "./modules/login.module";
import { TemplateModule } from "./modules/template.module";
import { HistoryModule } from './modules/history.module';
import { BoundsModule } from './modules/bounds.module';

// COMPONENTS
import { AppComponent } from './app.component';
import { ElementListComponent } from "./components/element-list.component";
import { InfoBarComponent } from "./components/info-bar.component";
import { SearchBarComponent } from "./components/search-bar.component";
import { DirectoryMenuComponent } from "./components/directory-menu.component";
import { FiltersComponent } from "./components/filters.component";
import { GoGoControlComponent } from "./components/gogo-controls.component";
import { MapComponent } from "./components/map/map.component";
import { BiopenMarker } from "./components/map/biopen-marker.component";

import { capitalize, unslugify } from "./utils/string-helpers";
import { Element, HistoryState, ViewPort } from "./classes/classes";
import { GoGoConfig } from "./classes/gogo-config.class";
import * as Cookies from "./utils/cookies";

import { App } from "./gogocarto";

export enum AppDataType 
{
	All,
	SearchResults
}

/*
* App Module. Main module of the App
*
* AppModule creates all others modules, and deals with theirs events
*/
export class AppModule
{		
	readonly config : GoGoConfig;
	readonly isIframe : boolean = false;
	readonly loadFullTaxonomy : boolean = true;

	modeManager = new ModeManager();
	stateManager = new StateManager();

	component = new AppComponent();
	geocoder = new GeocoderModule();
	filterModule = new FilterModule();
	filterRoutingModule = new FilterRoutingModule();
	elementsModule = new ElementsModule();
	displayElementAloneModule = new DisplayElementAloneModule();
	directionsModule : DirectionsModule = new DirectionsModule();
	ajaxModule = new AjaxModule();
	boundsModule : BoundsModule;
	routerModule = new RouterModule();
	templateModule = new TemplateModule();
	loginModule : LoginModule;

	infoBarComponent = new InfoBarComponent();
	mapComponent  = new MapComponent();
	searchBarComponent = new SearchBarComponent();
	elementListComponent = new ElementListComponent();
	historyModule = new HistoryModule();
	categoryModule = new CategoriesModule();
	directoryMenuComponent = new DirectoryMenuComponent();
	filtersComponent = new FiltersComponent();	
	gogoControlComponent = new GoGoControlComponent();	
	
	private dataType_ : AppDataType = AppDataType.All;

	// when click on marker it also triger click on map
	// when click on marker we put isClicking to true during
	// few milliseconds so the map don't do anything is click event
	private isClicking_ = false;

	constructor($config : any, $isIframe = false, $loadFullTaxonomy = true)
	{
		this.config = new GoGoConfig($config);
		this.isIframe = $isIframe;
		this.loadFullTaxonomy = $loadFullTaxonomy;
		
		this.loginModule = new LoginModule(this.config.security.userRole, this.config.security.userEmail);

  	this.infoBarComponent.onHide.do( ()=> { this.handleInfoBarHide(); });

		this.ajaxModule.onNewElements.do( (result) => { this.handleNewElementsReceivedFromServer(result); });
	
		this.elementsModule.onElementsChanged.do( (elementsChanged)=> { this.handleElementsChanged(elementsChanged); });
	
		this.geocoder.onGeocodeResult.do( () => { this.handleGeocodeResult(); this.searchBarComponent.handleGeocodeResult(); });
		this.geocoder.onGeolocalizationResult.do( (viewPort : ViewPort) => { this.handleGeolocalizationResult(viewPort); });

		this.mapComponent.onIdle.do( () => { this.handleMapIdle();  });
		this.mapComponent.onClick.do( () => { this.handleMapClick(); });		

		this.boundsModule = new BoundsModule(this.config);

		Cookies.createCookie('firstVisit', 'done');
	}

	/*
	* Load initial state or state popped by window history manager
	*/
	loadHistoryState(historystate : HistoryState, $backFromHistory = false)
	{
		if (historystate === null) return;	

		console.log("loadHistorystate", historystate);	

		if (historystate.dataType == AppDataType.SearchResults)
		{
			// force setting dataType before searchBarComponent to avoid history issues
			this.setDataType(historystate.dataType, true);
			this.searchBarComponent.searchElements(historystate.text, $backFromHistory);
			$('#directory-spinner-loader').hide();
		}	
		else
		{
			// check viewport and address from cookies
			if (!historystate.viewport && !historystate.address && historystate.state == AppStates.Normal) 
			{
				console.log("no viewport nor address provided, using cookies values");
				historystate.viewport = new ViewPort().fromString(Cookies.readCookie('viewport'));
				historystate.address = Cookies.readCookie('address');
				if (historystate.address) $('.search-bar').val(historystate.address);
			}		
		}		

		if (historystate.filters)
		{
			this.filterRoutingModule.loadFiltersFromString(historystate.filters);
		}
		else
		{
			this.filtersComponent.setMainOption('all');
		}		

		if (historystate.dataType == AppDataType.All && historystate.viewport && historystate.state != AppStates.ShowElementAlone)
		{			
			// if map not loaded we just set the mapComponent viewport without changing the
			// actual viewport of the map, because it will be done in
			// map initialisation
			this.mapComponent.setViewPort(historystate.viewport, this.mapComponent.isMapLoaded);

			// on list mode initialize bounds
			if (historystate.mode == AppModes.List)
			{
				this.boundsModule.createBoundsFromLocation(L.latLng(historystate.viewport.lat, historystate.viewport.lng));
			}

			$('#directory-spinner-loader').hide();	

			if (historystate.mode == AppModes.List )
			{
				let location = L.latLng(historystate.viewport.lat, historystate.viewport.lng);
			}	
		}	

		this.setMode(historystate.mode, $backFromHistory, false);
		
		// if address is provided we geolocalize
		// if no viewport and state normal we geocode on default location
		if (historystate.dataType == AppDataType.All && (historystate.address || (!historystate.viewport && historystate.state === AppStates.Normal))) 
		{
			if (historystate.address == "geolocalize")
			{
				this.searchBarComponent.geolocateUser();
			}
			else
			{
				this.geocoder.geocodeAddress(
					historystate.address, 
					(results) => 
					{ 
						// if viewport is given, nothing to do, we already did initialization
						// with viewport
						if (historystate.viewport && historystate.mode == AppModes.Map) return;
						// fit bounds anyway so the mapcomponent will register this requested bounds for later
						this.mapComponent.fitBounds(this.geocoder.getBounds());
					},
					() => {
						// failure callback
						this.searchBarComponent.setValue("Erreur de localisation : " + historystate.address);
						if (!historystate.viewport) 
						{
							// geocode default location
							this.geocoder.geocodeAddress('');
						}
					}	
				);
			}			
		}

		if (historystate.id) 
		{
			setTimeout( () => { 
				this.setState(
					historystate.state,
					{
						id: historystate.id, 
						panToLocation: (historystate.viewport === null)
					},
					$backFromHistory);
				$('#directory-spinner-loader').hide();		
			}, 400);	
		}
		else
		{
			this.setState(historystate.state, null, $backFromHistory);		
		}		
	};		

	setDataType($dataType : AppDataType, $backFromHistory : boolean = false)
	{
		//console.log("setDataType", AppDataType[$dataType]);
		this.dataType_ = $dataType;
		this.elementsModule.clearCurrentsElement();	
		this.elementListComponent.clear();
		this.elementsModule.updateElementsToDisplay(true);		
		this.checkForNewElementsToRetrieve();	
		if (!$backFromHistory) this.historyModule.pushNewState();
		this.updateDocumentTitle();
	}

	handleMarkerClick(marker : BiopenMarker)
	{
		if ( this.mode != AppModes.Map) return;

		this.setTimeoutClicking();

		if (marker.isHalfHidden()) this.setState(AppStates.Normal);	

		this.setState(AppStates.ShowElement, { id: marker.getId() });		
	}

	handleMapIdle()
	{		
		if (this.mode != AppModes.Map)     return;

		// we need map to be loaded to get the radius of the viewport
		// and get the elements inside
		if (!this.mapComponent.isMapLoaded)
		{
			this.mapComponent.onMapLoaded.do(() => {this.handleMapIdle(); });
			return;
		}
		else
		{
			this.mapComponent.onMapLoaded.off(() => {this.handleMapIdle(); });
		}

		let updateInAllElementList = true;

		let zoom = this.mapComponent.getZoom();
		let old_zoom = this.mapComponent.getOldZoom();

		if (zoom != old_zoom && old_zoom != -1)  
		{
			if (zoom > old_zoom) updateInAllElementList = false;	   		
		}

		this.elementsModule.updateElementsToDisplay(updateInAllElementList);
		//this.elementsModule.updateElementsIcons(false);

		if (this.state == AppStates.Normal || this.state == AppStates.ShowElement) this.checkForNewElementsToRetrieve();

		if (this.dataType_ == AppDataType.All) this.historyModule.updateCurrState();
	};

	checkForNewElementsToRetrieve($getFullRepresentation = false)
	{
		if (this.dataType_ != AppDataType.All) return;

		// console.log("checkForNewelementToRetrieve, fullRepresentation", $getFullRepresentation);
		let result = this.boundsModule.calculateFreeBounds($getFullRepresentation);
		// console.log("checkForNewelementToRetrieve, calculateBounds", result);
		if (result.status == "allRetrieved") return; // nothing to do, all elements already retrieved
		else if (result.status == "included") 
		{
			// We simulate the end of an successeful ajax request 
			App.boundsModule.updateFilledBoundsWithBoundsReceived(result.expectedFillBounds, App.currMainId,  $getFullRepresentation);
			this.handleNewElementsReceivedFromServer({'data': [], 'fullRepresentation': $getFullRepresentation});
			return;
		}		

		let freeBounds = result.freeBounds;
		let expectedFilledBounds = result.expectedFillBounds;
		if (freeBounds && freeBounds.length > 0) this.ajaxModule.getElementsInBounds(freeBounds, $getFullRepresentation, expectedFilledBounds); 
	}

	handleMapClick()
	{
		if (this.isClicking_) return;

		//console.log("handle Map Click", AppStates[this.state]);
		
		if (this.state == AppStates.ShowElement || this.state == AppStates.ShowElementAlone)
		{
			this.infoBarComponent.hide(); 
			this.setState(AppStates.Normal);		
		}
		else if (this.state == AppStates.ShowDirections)
			this.setState(AppStates.ShowElement, { id : App.infoBarComponent.getCurrElementId() });		
		
		this.mapComponent.hideControlLayers();
	};

	handleGeocodeResult()
	{
		//console.log("handleGeocodeResult", this.geocoder.getLocation());
		$('#directory-spinner-loader').hide();

		if (this.state == AppStates.ShowDirections)	
		{
			// we restart directions from this new start location
			this.setState(AppStates.ShowDirections,{id: this.infoBarComponent.getCurrElementId() });
		}		
		else
		{
			if (this.mode == AppModes.Map)
			{
				this.setState(AppStates.Normal);					
			}
			else
			{
				let location = this.geocoder.getLocation() ? this.geocoder.getLocation() : this.boundsModule.defaultCenter;
				this.boundsModule.createBoundsFromLocation(location);
				this.elementsModule.clearCurrentsElement();
				this.elementsModule.updateElementsToDisplay(true);
				let address = App.geocoder.lastAddressRequest;
				if (this.geocoder.getLocation()) 
					App.elementListComponent.setTitle(' autour de <i>' + capitalize(unslugify(address))) + '</i>';
			}			

			this.updateDocumentTitle();
		}				
	}

	handleGeolocalizationResult(viewPort)
	{
		if (this.mode == AppModes.Map)
		{
			this.setState(AppStates.Normal);
			App.mapComponent.panToLocation(viewPort.toLocation(), viewPort.zoom, false);			
		}
		else
		{
			this.boundsModule.createBoundsFromLocation(viewPort.toLocation());
			this.elementsModule.clearCurrentsElement();
			this.elementsModule.updateElementsToDisplay(true);
			App.elementListComponent.setTitle(' autour de <i>ma position</i>');
			// save the viewport if we go to map after
			App.mapComponent.setViewPort(viewPort);
		}		
	}	

	handleNewElementsReceivedFromServer(result)
	{		
		let elementsJson = result.data;		
		
		let	elements = this.elementsModule.addJsonElements(elementsJson, true, result.fullRepresentation);
		//console.log("new Elements length", newElements.length);
		
		// on add markerClusterGroup after first elements received
		if (elements.newElementsLength > 0 || App.mode == AppModes.List) 
		{
			this.elementsModule.updateElementsToDisplay(true);	
		}
	}; 

	handleElementsChanged(result : ElementsChanged)
	{
		let start = new Date().getTime();

		if (this.mode == AppModes.List)
		{
			this.elementListComponent.update(result.elementsToDisplay);
		}
		else
		{
			if (!this.mapComponent.isInitialized) { return;}

			this.mapComponent.markerClustererGroup.restoreUnclusters(true);

			// console.log("Display = " + result.elementsToDisplay.length + " / remove = " + result.elementsToRemove.length + " / add = " + result.newElements.length);

			// In some cases, markerCluster works faster clearing alls markers and adding them again
			if (result.elementsToRemove.length + result.newElements.length > result.elementsToDisplay.length)
			{
				this.mapComponent.clearMarkers();
				this.mapComponent.addMarkers(result.elementsToDisplay.map( (e) => e.marker.getLeafletMarker()));
			}
			else
			{
				this.mapComponent.removeMarkers(result.elementsToRemove.map( (e) => e.marker.getLeafletMarker()));
				this.mapComponent.addMarkers(result.newElements.map( (e) => e.marker.getLeafletMarker()));
			}			

			this.mapComponent.markerClustererGroup.checkForUnclestering(this.map().getBounds());
		}	

		let end = new Date().getTime();
		//console.log("ElementsChanged in " + (end-start) + " ms");	
	}; 

	handleInfoBarHide()
	{
		this.setState(AppStates.Normal);
	};

	setTimeoutClicking() 
	{ 
		this.isClicking_ = true;
		let that = this;
		setTimeout(function() { that.isClicking_ = false; }, 100); 
	};

	updateDocumentTitle(options : any = {})
	{
		//console.log("updateDocumentTitle", this.infoBarComponent.getCurrElementId());

		let title : string;
		let elementName : string;

		if ( (options && options.id) || this.infoBarComponent.getCurrElementId()) 
		{
			
			let element = this.elementById(this.infoBarComponent.getCurrElementId());
			elementName = capitalize(element ? element.name : '');
		}

		if (this.dataType_ == AppDataType.SearchResults)
		{
			title = 'Recherche : ' + this.searchBarComponent.getCurrSearchText();	
		}
		else if (this.mode == AppModes.List)
		{		
			title = 'Liste des ' + App.config.text.elementPlural + ' ' + this.getLocationAddressForTitle();		
		}
		else
		{
			switch (this.state)
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
					title = 'Carte des ' + App.config.text.elementPlural + ' ' + this.getLocationAddressForTitle();			
					break;
			}
		}

		document.title = title;	
	};

	private getLocationAddressForTitle()
	{
		if (this.geocoder.getLocationAddress())
		{
			return "- " + this.geocoder.getLocationAddress();
		}
		return "- France";
	}


	// Getters shortcuts
	map() : L.Map { return this.mapComponent? this.mapComponent.getMap() : null; };
	elements() { return this.elementsModule.currVisibleElements();  };
	elementById(id) { return this.elementsModule.getElementById(id);  };
	isUserLogged() { return this.loginModule.isUserLogged(); }
	get DEAModule() { return this.displayElementAloneModule; }
	get currMainId() { return this.filtersComponent.currentActiveMainOptionId; }

	// private properties getters
	get state() { return this.stateManager.state; }
	setState($newState : AppStates, $options : any = {}, $backFromHistory : boolean = false)  { this.stateManager.setState($newState, $options, $backFromHistory)}
	get mode() { return this.modeManager.mode; }
	setMode($mode : AppModes, $backFromHistory : boolean = false, $updateTitleAndState = true) { this.modeManager.setMode($mode, $backFromHistory, $updateTitleAndState); }
	get dataType() { return this.dataType_; }
	
	get isClicking() { return this.isClicking_; }
}