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

	constructor(options)
	{
		this.init(options);
	}

	init(options)
	{	
	   App = new AppModule(); 

	   let layout = App.templateModule.render('layout', { mainCategory: options.taxonomy, openHoursCategory: options.openHours});    
	   $(options.containerId).append(layout);

	   App.categoryModule.createCategoriesFromJson(options.taxonomy, options.openHours);

	   App.elementModule.initialize();
	  
	   App.boundsModule.initialize();

	   let initialState = new HistoryState();
	   initialState.address = '';
	   initialState.dataType = AppDataType.All;
	   initialState.mode = AppModes.Map;
	   initialState.state = AppStates.Normal;
	   initialState.viewport = null;

	   App.loadHistoryState(initialState);

	   initializeAppInteractions();
	   initializeElementMenu();
	   initializeVoting();
	   initializeReportingAndDeleting();
	}
}

// fill the global variable GoGoCarto with an instance of the GoGoCarto library
goGoCarto = function(options) { return new GoGoCartoModule(options); }