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
import { StateManager, AppStates } from "./managers/state.manager";
import { DataTypeManager, AppDataType } from "./managers/data-type.manager";
import { ElementsManager } from "./managers/elements.manager";
import { HistoryStateManager } from "./managers/history-state.manager";
import { GeocodingManager } from "./managers/geocoding.manager";
import { MapManager } from "./managers/map.manager";

// MODULES
import { GeocoderModule, GeocodeResult } from "./modules/geocoder.module";
import { FilterModule } from "./modules/taxonomy/filter.module";
import { FilterRoutingModule } from "./modules/taxonomy/filter-routing.module";
import { ElementsModule } from "./modules/elements/elements.module";
import { ElementsJsonModule } from "./modules/elements/elements-json.module";
import { FavoriteModule } from "./modules/elements/favorite.module";
import { DisplayElementAloneModule } from "./modules/map/display-element-alone.module";
import { AjaxModule } from "./modules/ajax.module";
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { TaxonomySkosModule } from './modules/taxonomy/taxonomy-skos.module';
import { RouterModule } from "./modules/core/router.module";
import { LoginModule } from "./modules/login.module";
import { TemplateModule } from "./modules/core/template.module";
import { HistoryModule } from './modules/core/history.module';
import { BoundsModule } from './modules/bounds.module';
import { DocumentTitleModule } from './modules/core/document-title.module';
import { ElementJsonParserModule } from './modules/element/element-json-loader.module';
import { ElementFormaterModule } from './modules/element/formater.module';
import { ElementDiffModule } from './modules/element/diff.module';
import { ElementIconsModule } from "./modules/element/icons.module";
import { ElementOptionValuesModule } from "./modules/element/option-values.module";

// COMPONENTS
import { AppComponent } from './app.component';
import { ElementListComponent } from "./components/list/element-list.component";
import { InfoBarComponent } from "./components/map/info-bar.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { DirectoryMenuComponent } from "./components/directory-menu/directory-menu.component";
import { FiltersComponent } from "./components/directory-menu/filters.component";
import { GoGoControlComponent } from "./components/gogo-controls.component";
import { MapComponent } from "./components/map/map.component";
import { MapControlsComponent } from "./components/map/map-controls.component";
import { DirectionsComponent } from "./components/map/directions.component";

// OTHERS
import { GoGoConfig } from "./classes/config/gogo-config.class";
import { App } from "./gogocarto";
import * as Cookies from "./utils/cookies";

// EXPORT 
export { AppDataType } from "./managers/data-type.manager";
export { AppStates } from "./managers/state.manager";
export { AppModes } from "./managers/mode.manager";

/*
* App Module. Main module of the App*
* AppModule creates all others components and modules
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
	elementsJsonModule = new ElementsJsonModule();
	displayElementAloneModule = new DisplayElementAloneModule();
	ajaxModule = new AjaxModule();
	boundsModule : BoundsModule;
	routerModule = new RouterModule();
	templateModule = new TemplateModule();
	loginModule : LoginModule;	
	historyModule = new HistoryModule();
	taxonomyModule = new TaxonomyModule();
	taxonomySkosModule = new TaxonomySkosModule();
	documentTitleModule = new DocumentTitleModule();
	elementJsonParser = new ElementJsonParserModule();
	elementFormaterModule = new ElementFormaterModule();
	elementDiffModule = new ElementDiffModule();
	elementIconsModule = new ElementIconsModule();
	elementOptionValuesModule = new ElementOptionValuesModule();
	favoriteModule = new FavoriteModule();

	component : AppComponent;
	infoBarComponent = new InfoBarComponent();
	mapComponent  = new MapComponent();
	searchBarComponent = new SearchBarComponent();
	elementListComponent = new ElementListComponent();
	directoryMenuComponent = new DirectoryMenuComponent();
	filtersComponent = new FiltersComponent();	
	gogoControlComponent = new GoGoControlComponent();	
	directionsComponent = new DirectionsComponent();
	mapControlsComponent = new MapControlsComponent();

	constructor($config : any, $isIframe = false, $loadFullTaxonomy = true)
	{
		this.config = new GoGoConfig($config);
		this.isIframe = $isIframe;
		this.loadFullTaxonomy = $loadFullTaxonomy;
		
		this.loginModule = new LoginModule(this.config.security.userRoles, this.config.security.userEmail);
  	this.boundsModule = new BoundsModule(this.config);  	

		Cookies.createCookie('firstVisit', 'done');			
	}

	initialize()
	{
		this.component = new AppComponent();
		this.elementsManager = new ElementsManager();
		this.geocodingManager = new GeocodingManager();
		this.mapManager = new MapManager();	
	}

	// ---------------------------
	// Getters & Setters Shortcuts
	// ---------------------------

	map() : L.Map { return this.mapComponent? this.mapComponent.getMap() : null; };

	elements() { return this.elementsModule.currVisibleElements();  };

	elementById(id) { return this.elementsModule.getElementById(id);  };

	get DEAModule() { return this.displayElementAloneModule; }

	get currMainId() { return this.filtersComponent.currentActiveMainOptionId; }

	get state() { return this.stateManager.state; }

	setState($newState : AppStates, $options : any = {}, $backFromHistory : boolean = false)  { this.stateManager.setState($newState, $options, $backFromHistory)}

	get mode() { return this.modeManager.mode; }

	setMode($mode : AppModes, $backFromHistory : boolean = false, $updateTitleAndState = true) { this.modeManager.setMode($mode, $backFromHistory, $updateTitleAndState); }

	get dataType() { return this.dataTypeManager.dataType; }

	setDataType($dataType : AppDataType, $backFromHistory : boolean = false, $searchResult = null) { this.dataTypeManager.setDataType($dataType, $backFromHistory, $searchResult); }
}