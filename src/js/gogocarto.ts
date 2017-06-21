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
	// only for debugging
	app;

	constructor(options)
	{
		this.init(options);
	}

	init(options)
	{	
	   App = new AppModule(); 
		 // only for debugging
	   this.app = App;

	   let layout = App.templateModule.render('layout', { mainCategory: options.taxonomy, openHoursCategory: options.openHours});    
	   $(options.containerId).append(layout);

	   App.categoryModule.createCategoriesFromJson(options.taxonomy, options.openHours);
	   if (App.categoryModule.options.length)
	   {
	   		let styles = App.templateModule.render('categories-styles', {'optionList':App.categoryModule.options});
	   		$('head').append(styles);
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
goGoCarto = function(options) { return new GoGoCartoModule(options); }