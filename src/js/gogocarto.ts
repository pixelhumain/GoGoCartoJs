declare var $;
declare var nunjucks, goGoCarto;

import { AppModule, AppDataType, AppModes, AppStates } from './app.module';

import { HistoryState } from "./modules/history.module";
import { initializeElementMenu } from "./components/element-menu.component";
import { initializeVoting } from "./components/vote.component";
import { initializeReportingAndDeleting } from "./components/reporting-deleting.component";
import { getQueryParams } from "./commons/commons";
import { Roles } from "./modules/login.module";

export var App : AppModule;

export class GoGoCartoModule
{
	private options;
	private containerSelector : string = '';
	// only for debugging
	app: AppModule;

	constructor(containerSelector : string, options = {})
	{
		this.containerSelector = containerSelector;
		this.checkForDistantConfifuration(options);
	}

	/** 
	* Set the current user role : Anonymous (0), user (1), admin (2)
	* Role is used to render specifically certain template and control
	* certain functionalities
	*/
	setUserRole($role : Roles | string)
	{
		this.app.loginModule.setRole($role);
	}

	/** return the given hash to add to url so gogocarto app will open on specific element */
	getElementRouteHash($elementId, $elementName = 'find')
	{
		return this.app.routerModule.generate('show_element', { id: $elementId, name: $elementName });
	}

	private checkForDistantConfifuration(options : string|any)
	{
		if ( typeof options === 'object')
		{
			this.checkForDistantTaxonomy(options);
		}
		else
		{
		 	$.getJSON( options, (data) =>  { this.checkForDistantTaxonomy(data); }); 
		}		
	};

	private checkForDistantTaxonomy(options : any)
	{
		if (!options.data.taxonomy)
		{
			console.warn("[GoGoCarto] You must provide a taxonomy (url or Json object)");
			return;
		}

		if ( typeof options.data.taxonomy === 'object')
		{
			this.init(options.data.taxonomy, options);
		}
		else
		{
		 	$.getJSON( options.data.taxonomy, (data) =>  { this.init(data, options); }); 
		}		
	};

	private init(taxonomy, options)
	{	
		let urlParams : any = getQueryParams(window.location.search);
		let isIframe : boolean = urlParams.iframe ? urlParams.iframe == 1 : false;
		let fullTaxonomy : boolean = urlParams.fullTaxonomy ? urlParams.fullTaxonomy == 1 : true;

		App = new AppModule(options, isIframe);

		// only for debugging
		this.app = App;		

		let layout = App.templateModule.render('layout', 
		{ 
			mainCategory: taxonomy, 
			openHoursCategory: options.openHours, 
			isAdmin: App.loginModule.isAdmin(), 
			isIframe: isIframe, 
			fullTaxonomy: fullTaxonomy,
			config: App.config
		});
		   
		if ($(this.containerSelector).length == 0) console.warn('[GoGoCarto] The container "' + this.containerSelector + '" was not found');
		else $(this.containerSelector).append(layout);

		App.categoryModule.createCategoriesFromJson(taxonomy, options.openHours);
		if (App.categoryModule.options.length)
		{
			let styles = App.templateModule.render('gogo-styles', {'optionList':App.categoryModule.options, 'config':App.config});
			let domToAddStyles = $('head').length ? $('head') : $('html');
			if (domToAddStyles.length) domToAddStyles.append(styles);
			else 	console.warn("[GoGoCarto] Cannot find Dom 'head' or 'html' to add styles");
		}

		setTimeout( () => {
			App.elementModule.initialize();
			App.directoryMenuComponent.initialize();
			App.boundsModule.initialize();	   
			App.elementListComponent.initialize();
			App.routerModule.loadInitialState();
			App.searchBarComponent.initialize();
			App.component.initialize();
			
			initializeElementMenu();
			initializeVoting();
			initializeReportingAndDeleting();
		}, 0);	   
	}
}

// fill the global variable GoGoCarto with an instance of the GoGoCarto library
goGoCarto = function(container, options) { return new GoGoCartoModule(container, options); }