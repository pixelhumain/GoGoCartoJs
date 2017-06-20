declare var $;
declare var nunjucks;
declare var App : AppModule;

import { AppModule, AppDataType, AppModes, AppStates } from './app.module';

import { HistoryState } from "./modules/history.module";
import { initializeAppInteractions } from "./app-interactions";
import { initializeElementMenu } from "./components/element-menu.component";
import { initializeVoting } from "./components/vote.component";
import { initializeReportingAndDeleting } from "./components/reporting-deleting.component";

$(document).ready(function()
{
	$.getJSON( "http://localhost/GoGoCarto/web/app_dev.php/api/taxonomy", (data) => 
	{
		console.log("taxonomy", data);

		let carto = new GoGoCarto({
			'taxonomy' : data.mainCategory,
			'openHours' : data.openHours
		});
	});	
});

export class GoGoCartoOptions
{
	taxonomy
}

export class GoGoCarto
{
	private options;

	constructor(options)
	{
		nunjucks.configure('../src/views', { autoescape: true });
		let layout = nunjucks.render('layout.html.njk', { mainCategory: options.taxonomy });
		$('#gogocarto').append(layout);
		this.initializeAppModule(options);
	}

	/**
	* App initialisation
	*/
	initializeAppModule(options)
	{	
	   App = new AppModule();      

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