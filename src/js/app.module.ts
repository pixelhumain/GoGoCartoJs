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

// MANAGERS
import { ModeManager, AppModes } from "./managers/mode.manager";
export { AppModes } from "./managers/mode.manager";
import { StateManager, AppStates } from "./managers/state.manager";
export { AppStates } from "./managers/state.manager";
import { DataTypeManager, AppDataType } from "./managers/data-type.manager";
export { AppDataType } from "./managers/data-type.manager";
import { ElementsManager } from "./managers/elements.manager";
import { HistoryStateManager } from "./managers/history-state.manager";
import { GeocodingManager } from "./managers/geocoding.manager";
import { MapManager } from "./managers/map.manager";

// MODULES
import { GeocoderModule, GeocodeResult } from "./modules/geocoder.module";
import { FilterModule } from "./modules/filter.module";
import { FilterRoutingModule } from "./modules/filter-routing.module";
import { ElementsModule } from "./modules/elements/elements.module";
import { DisplayElementAloneModule } from "./modules/display-element-alone.module";
import { AjaxModule } from "./modules/ajax.module";
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { DirectionsModule } from "./modules/directions.module";
import { RouterModule } from "./modules/router.module";
import { LoginModule } from "./modules/login.module";
import { TemplateModule } from "./modules/template.module";
import { HistoryModule } from './modules/history.module';
import { BoundsModule } from './modules/bounds.module';
import { DocumentTitleModule } from './modules/document-title.module';
import { ElementJsonLoadedModule } from './modules/elements/element-json-loader.module';
import { ElementFormaterModule } from './modules/elements/formater.module';
import { ElementDiffModule } from './modules/elements/diff.module';
import { ElementIconsModule } from "./modules/elements/icons.module";
import { ElementOptionValuesModule } from "./modules/elements/option-values.module";

// COMPONENTS
import { AppComponent } from './app.component';
import { ElementListComponent } from "./components/list/element-list.component";
import { InfoBarComponent } from "./components/map/info-bar.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { DirectoryMenuComponent } from "./components/directory-menu/directory-menu.component";
import { FiltersComponent } from "./components/directory-menu/filters.component";
import { GoGoControlComponent } from "./components/gogo-controls.component";
import { MapComponent } from "./components/map/map.component";

import { GoGoConfig } from "./classes/gogo-config.class";

import { App } from "./gogocarto";
import * as Cookies from "./utils/cookies";

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
	dataTypeManager = new DataTypeManager();
	elementsManager : ElementsManager;
	historyStateManager = new HistoryStateManager();
	geocodingManager : GeocodingManager;
	mapManager : MapManager;
	
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
	documentTitleModule = new DocumentTitleModule();
	elementJsonLoader = new ElementJsonLoadedModule();
	elementFormaterModule = new ElementFormaterModule();
	elementDiffModule = new ElementDiffModule();
	elementIconsModule = new ElementIconsModule();
	elementOptionValuesModule = new ElementOptionValuesModule();

	component = new AppComponent();
	infoBarComponent = new InfoBarComponent();
	mapComponent  = new MapComponent();
	searchBarComponent = new SearchBarComponent();
	elementListComponent = new ElementListComponent();
	historyModule = new HistoryModule();
	categoryModule = new TaxonomyModule();
	directoryMenuComponent = new DirectoryMenuComponent();
	filtersComponent = new FiltersComponent();	
	gogoControlComponent = new GoGoControlComponent();	

	constructor($config : any, $isIframe = false, $loadFullTaxonomy = true)
	{
		this.config = new GoGoConfig($config);
		this.isIframe = $isIframe;
		this.loadFullTaxonomy = $loadFullTaxonomy;
		
		this.loginModule = new LoginModule(this.config.security.userRole, this.config.security.userEmail);
  	this.boundsModule = new BoundsModule(this.config);

		Cookies.createCookie('firstVisit', 'done');			
	}

	initialize()
	{
		this.elementsManager = new ElementsManager();
		this.geocodingManager = new GeocodingManager();
		this.mapManager = new MapManager();	
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
	get dataType() { return this.dataTypeManager.dataType; }
	setDataType($dataType : AppDataType, $backFromHistory : boolean = false) { this.dataTypeManager.setDataType($dataType, $backFromHistory); }
}