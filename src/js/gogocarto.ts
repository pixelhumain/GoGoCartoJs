declare var $;
declare var nunjucks, goGoCarto;

import { AppModule, AppDataType, AppModes, AppStates } from './app.module';

import { HistoryState } from "./modules/history.module";
import { initializeAppInteractions } from "./app-interactions";
import { initializeElementMenu } from "./components/element-menu.component";
import { initializeVoting } from "./components/vote.component";
import { initializeReportingAndDeleting } from "./components/reporting-deleting.component";

export class GoGoCartoOptions
{
	taxonomy
}

export var App : AppModule;

export class GoGoCartoModule
{
	private options;
	private containerSelector : string = '';
	// only for debugging
	app;

	constructor(containerSelector : string, options = {})
	{
		this.containerSelector = containerSelector;
		this.checkForDistantConfifuration(options);
	}

	checkForDistantConfifuration(options : string|any)
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

	checkForDistantTaxonomy(options : any)
	{
		if (!options.taxonomy)
		{
			console.warn("[GoGoCarto] You must provide a taxonomy (url or Json object)");
			return;
		}

		if ( typeof options.taxonomy === 'object')
		{
			this.init(options.taxonomy, options);
		}
		else
		{
		 	$.getJSON( options.taxonomy, (data) =>  { this.init(data, options); }); 
		}		
	};

	init(taxonomy, options)
	{	
	   App = new AppModule(options); 
		 // only for debugging
	   this.app = App;

	   let layout = App.templateModule.render('layout', { mainCategory: taxonomy, openHoursCategory: options.openHours });
	   	   
	   if ($(this.containerSelector).length == 0) console.warn('[GoGoCarto] The container "' + this.containerSelector + '" was not found');
	   else $(this.containerSelector).append(layout);

	   App.categoryModule.createCategoriesFromJson(taxonomy, options.openHours);
	   if (App.categoryModule.options.length)
	   {
	   		let styles = App.templateModule.render('categories-styles', {'optionList':App.categoryModule.options});
	   		let domToAddStyles = $('head').length ? $('head') : $('html');
	   		if (domToAddStyles.length) domToAddStyles.append(styles);
	   		else 	console.warn("[GoGoCarto] Cannot find Dom 'head' or 'html' to add styles");
	   }
	   
	   App.elementModule.initialize();
	   App.directoryMenuComponent.initialize();
	   App.boundsModule.initialize();	   

	   App.routerModule.loadInitialState();

	   initializeAppInteractions();
	   initializeElementMenu();
	   initializeVoting();
	   initializeReportingAndDeleting();
	}
}

// fill the global variable GoGoCarto with an instance of the GoGoCarto library
goGoCarto = function(container, options) { return new GoGoCartoModule(container, options); }