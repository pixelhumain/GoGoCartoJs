/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-08-31
 */
import { AppModule, AppStates, AppDataType, AppModes } from "../../app.module";
import { GeocodeResult } from "../../modules/geocoder.module";
declare var $;
import { App } from "../../gogocarto";
import { ViewPort } from "../../classes/classes";


export class SearchBarComponent
{
	placeholders = {
		default: "",
		place: "",
		element: ""
	}

	searchInput() { return $('.search-bar'); }

	private currSearchText : string = '';

	constructor() {}

	initialize()
	{		
		this.searchInput().keyup((e) =>
		{    
			if(e.keyCode == 13) { this.handleSearchAction(); } // press enter
		});

		$('.search-bar-icon').click(() => this.handleSearchAction());	

		$('.search-btn').click(() => this.handleSearchAction());
		$('.search-cancel-btn').click(() => this.clearLoader());

		$('#btn-close-search-result').click(() => this.clearElementSearchResult());	

		$('.search-geolocalize').tooltip();
		$('.search-geolocalize').click(() => this.geolocateUser());

		this.searchInput().on('click', (e) => { e.preventDefault();e.stopPropagation(); });
		this.searchInput().on('focus', () => { this.showSearchOptions(); });
		this.searchInput().on('keyup', () => this.showSearchOptions());

		this.placeholders = {
			default: "Recherchez un lieu, " + App.config.text.elementIndefinite + "...",
			place: "Entrez une adresse, un CP, une ville...",
			element: "Entrez le nom d'" + App.config.text.elementIndefinite
		}		

		this.updateSearchPlaceholder();

		$('.search-option-radio-btn').change( () => this.updateSearchPlaceholder() );

		$('#directory-content, .directory-menu-content, header').click( () => this.hideSearchOptions() );

		$('#search-overlay-mobile .overlay').click( () => this.hideMobileSearchBar() );
	}

	// handle all validation by user (input key enter pressed, icon click...)
	private handleSearchAction()
	{
		this.beforeSearch();

		let searchText = this.searchInput().val();

		switch (this.searchType()) 
    { 
      case "place": 
        App.geocoder.geocodeAddress(searchText, 
          (result) => { 
            this.clearSearchResult(false); 
            this.hideSearchOptions(); 
            App.mapComponent.fitBounds(App.geocoder.getBounds(), true); 
          },
          () => {
          	this.clearLoader();
          	$('.search-no-result').show();
          }); 
        break; 
      case "element": 
        let value = this.searchInput().val(); 
        if (value) 
          this.searchElements(searchText); 
        else 
          this.clearSearchResult(); 
        break; 
    } 
	}

	handleGeocodeResult()
	{
		this.setValue(App.geocoder.getLocationAddress());
		this.clearLoader();
	}	

	geolocateUser()
	{
		this.beforeSearch();
		App.geocoder.geolocateUser( (result:ViewPort) => 
		{
			this.clearSearchResult(true);
			this.setValue("Geolocalisé");
			this.hideSearchOptions();			
			this.clearLoader();
		});
	}	

	searchElements($text : string, $backFromHistory = false)
	{		
		this.setValue($text);
		this.currSearchText = $text;

		let route = App.config.features.search.url;
		let data =  { text: $text }; 

		App.ajaxModule.sendRequest(route, 'get', data,
		(searchResult) => 
		{
      App.setDataType(AppDataType.SearchResults, $backFromHistory, searchResult);       
 
      this.clearLoader();       
      this.showSearchResultLabel(searchResult.data.length);   
 			App.gogoControlComponent.updatePosition();
 			this.hideMobileSearchBar(); 			
		},
		(error) =>
		{
			//App.geocoder.geocodeAddress('');
		});
	}

	showMobileSearchBar() { 
		$('#search-overlay-mobile').fadeIn(250);
		$('.search-bar-with-options-container').show(); 
		App.gogoControlComponent.hide(0);
	}

	hideMobileSearchBar() { 
		// console.log("hide mobile search bar");
		$('#search-overlay-mobile').fadeOut(150);
		$('.search-bar-with-options-container.mobile').hide();
		App.gogoControlComponent.show(0);
	}

	update() {
		if (App.component.width() <= 600)
			$('.search-bar-with-options-container').hide().appendTo('#search-overlay-mobile').addClass('mobile');
		else
			$('.search-bar-with-options-container').removeClass('mobile').prependTo('.directory-menu-header').show();
	}

	showSearchOptions()
	{
		$('.search-options').slideDown(350);
		if (!this.isSearchOptionVisible()) 
			$('#directory-menu-main-container .directory-menu-header').addClass("expanded");

		this.updateSearchPlaceholder();
	}

	hideSearchOptions()
	{		
		$('#directory-menu-main-container .directory-menu-header').removeClass("expanded");
		this.searchInput().blur();
		this.updateSearchPlaceholder();
		$('#directory-menu-main-container .search-options').slideUp(250);
	}

	updateSearchPlaceholder()
	{
		let placeholder = '';
		if (!this.isSearchOptionVisible()) placeholder = this.placeholders.default;
		else
		{
			switch (this.searchType())
			{
				case "place":   placeholder = this.placeholders.place;   break;
				case "element": placeholder = this.placeholders.element; break;
			}
		}			

		this.searchInput().attr("placeholder", placeholder);
	}	

	showSearchResultLabel($number : number)
	{
		$('.search-result-number').text($number);
		$('.search-result-value').text(this.currSearchText);
		$('.search-results').show();
		$('.search-options').hide();
		$('#element-info-bar').addClass('with-search-result-header');
	}

	hideSearchResult()
	{
		$('.search-results').hide();
		$('#element-info-bar').removeClass('with-search-result-header');
		App.gogoControlComponent.updatePosition();
	}

	clearElementSearchResult() 
	{
		this.clearSearchResult();
		App.setMode(AppModes.Map);
	}

	clearSearchResult(resetValue = true)
	{
		App.setDataType(AppDataType.All);		
		this.hideSearchResult();		
		this.clearLoader();	
		this.currSearchText = '';
		if (resetValue) {
			this.setValue("");
			App.elementListComponent.setTitle("");
		}		
		setTimeout( () => { this.hideSearchOptions(); }, 200);		
	}

	setValue($value : string)
	{
		this.searchInput().val($value);
	}  

	getCurrSearchText() { return this.currSearchText; }

	isSearchOptionVisible() : boolean
	{
		return $('.search-options:visible').length;
	}

	private searchType() : string
	{
		return $('.search-option-radio-btn:checked').attr('data-name');
	}

	private clearLoader()
	{
		$('.search-btn').show();
		$('.search-cancel-btn').hide();
	}

	private beforeSearch()
	{
		$('.search-no-result').hide();
		$('.search-cancel-btn').show();
		$('.search-btn').hide();
	}
    
}