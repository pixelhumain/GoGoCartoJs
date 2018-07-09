declare var $;
declare var nunjucks, goGoCarto;

import { AppModule, AppDataType, AppModes, AppStates } from './app.module';

import { initializePickAddress } from "./components/modals/pick-address.component";
import { initializeVoting } from "./components/modals/vote.component";
import { initializeReportingAndDeleting } from "./components/modals/reporting-deleting.component";
import { initializeSendingMail } from "./components/modals/send-email.component";
import { getQueryParams } from "./utils/params";

export var App : AppModule;

export class GoGoCartoModule
{
	private options;
	// DOM Container, can be a string (selector) or DOM object
	container : string | any = '';
	// only for debugging
	app: AppModule;

	constructor(container : string | any, options = {})
	{
		this.container = container;
		this.checkForDistantConfifuration(options);
	}

	/** 
	* Set the current user roles
	* Role is used to render specifically certain template and control
	* certain functionalities
	*/
	setUserRole($roles : string[] | string) { this.app.loginModule.setRoles($roles); }
	setUserRoles($roles : string[] | string) { this.app.loginModule.setRoles($roles); }

	setUserEmail($mail : string) { this.app.loginModule.setUserEmail($mail); }

	/** return the given hash to add to url so gogocarto app will open on specific element */
	getElementRouteHash($elementId, $elementName = 'find')
	{
		return this.app.routerModule.generate('show_element', { id: $elementId, name: $elementName });
	}

	showDirectoryMenu() { this.app.directoryMenuComponent.show(); }

	hideDirectoryMenu() { this.app.directoryMenuComponent.hide(); }

	private checkForDistantConfifuration(options : string|any)
	{		
		if ( typeof options === 'object') this.checkForDistantTaxonomy(options);
		else
			$.ajax({
			  url: options,
			  success: (data) =>  { 
			  	if ( typeof data === 'string') data = JSON.parse(data);
			  	this.checkForDistantTaxonomy(data); 
			  },
			  error: () => { console.error("Error while getting the configuration at url ", options)}
			});
	};

	private checkForDistantTaxonomy(options : any)
	{
		let taxonomy = options.data.taxonomy;
		if (!taxonomy || !options.data.elements)
		{
			console.warn("[GoGoCarto] You must provide a taxonomy and elements dataset (both url or Json object)");
			return;
		}

		if ( typeof taxonomy === 'object') this.init(taxonomy, options);
		else $.getJSON( taxonomy, (data) =>  { this.init(data, options); }); 	
	};

	private init(taxonomy, options)
	{	
		let urlParams : any = getQueryParams(window.location.search);
		let isIframe : boolean = urlParams.iframe ? urlParams.iframe == 1 : false;
		let fullTaxonomy : boolean = urlParams.fullTaxonomy ? urlParams.fullTaxonomy == 1 : true;

		App = new AppModule(options, isIframe, fullTaxonomy, urlParams);

		// only for debugging
		this.app = App;				

		App.taxonomyModule.createTaxonomyFromJson(taxonomy);

		let layout = App.templateModule.render('layout', 
		{ 
			rootCategories: App.taxonomyModule.rootCategories, 
			mainCategory: App.taxonomyModule.mainCategory, 
			isIframe: isIframe, 
			fullTaxonomy: fullTaxonomy,
			config: App.config,
			allowedStamps: App.stampModule.allowedStamps
		});
		   
		if ($(this.container).length == 0) console.warn('[GoGoCarto] The container "' + this.container + '" was not found');
		else $(this.container).append(layout);

		
		if (App.taxonomyModule.options.length)
		{
			let styles = App.templateModule.render('gogo-styles', {'optionList':App.taxonomyModule.options, 'config':App.config});
			let domToAddStyles = $('head').length ? $('head') : $('html');
			if (domToAddStyles.length) domToAddStyles.append(styles);
			else 	console.warn("[GoGoCarto] Cannot find Dom 'head' or 'html' to add styles");
		}		

		setTimeout( () => {		
			App.initialize();

			App.elementsModule.initialize();
			App.directoryMenuComponent.initialize();
			App.filtersComponent.initialize();
			App.boundsModule.initialize();	   
			App.elementListComponent.initialize();			
			App.searchBarComponent.initialize();			
			App.gogoControlComponent.initialize();
			App.directionsComponent.initialize();	
			App.mapControlsComponent.initialize();
			App.customPopupComponent.initialize();
			
			App.component.initialize();		
			
			initializePickAddress();
			initializeVoting();
			initializeReportingAndDeleting();
			initializeSendingMail();			

			App.routerModule.loadInitialState();

			// wait for initial state to be loaded
			setTimeout( () => App.elementsJsonModule.loadLocalElements(), 100);

			this.bindEvents();
		}, 0);	 
	}

	private bindEvents() 
	{
		this.app.mapManager.onMarkerClick.do( (id) => this.fireEvent('markerClick', {id: id}));
	}

	private fireEvent($eventName, $data) 
	{
		$(this.container).trigger($eventName, $data);
	}
}

// instanciate a GoGoCartoModule
goGoCarto = function(container, options) { return new GoGoCartoModule(container, options); }