/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-08-31
 */
import { AppModule, AppStates, AppDataType, AppModes } from "../app.module";
import { GeocoderModule, GeocodeResult } from "../modules/geocoder.module";
declare var google, $;
import { App } from "../gogocarto";

import { Event } from "../utils/event";

export class SearchBarComponent
{
	domId;

	placeholders = {
		default: "",
		place: "",
		element: ""
	}

	domElement() { return $(`${this.domId}`); }

	private currSearchText : string = '';

	constructor(domId : string)
	{	
		this.domId = domId;		
	}

	initialize()
	{
		// handle all validation by user (enter press, icon click...)
		this.domElement().keyup((e) =>
		{    
			if(e.keyCode == 13) // press enter
			{ 			 
				this.handleSearchAction();
			}
		});

		this.domElement().parents().find('#search-bar-icon').click(() => this.handleSearchAction());	

		$('#search-btn').click(() => this.handleSearchAction());

		$('#search-cancel-btn').click(() => this.clearLoader());	

		$('#btn-close-search-result').click( () => this.clearSearchResult());	

		$('#search-type-select').material_select();

		this.domElement().on('focus', () => { this.showSearchOptions(); });

		this.domElement().on('keyup', () => this.showSearchOptions());

		this.placeholders = {
			default: "Recherchez un lieu, " + App.config.text.elementIndefinite + "...",
			place: "Entrez une adresse, un CP, une ville...",
			element: "Entrez le nom d'" + App.config.text.elementIndefinite
		}

		this.updateSearchPlaceholder();

		$('.search-option-radio-btn').change( () => this.updateSearchPlaceholder() );
	}

	handleGeocodeResult()
	{
		this.setValue(App.geocoder.getLocationAddress());
		this.clearLoader();
	}

	private clearLoader()
	{
		$('#search-btn').show();
		$('#search-cancel-btn').hide();
	}

	private handleSearchAction()
	{
		$('#search-cancel-btn').show();
		$('#search-btn').hide();

		// if directory menu take full width
		if ($('#directory-menu').width() == $('.gogocarto-container').width())
			App.component.hideDirectoryMenu();

		switch (this.searchType())
		{
			case "place":
				App.geocoder.geocodeAddress(this.domElement().val(),
					(result) => {
						this.clearSearchResult(false);
						this.hideSearchOptions();
						App.mapComponent.fitBounds(App.geocoder.getBounds(), true);
					});
				break;
			case "element":
				let value = this.domElement().val();
				if (value)
					this.searchElements(this.domElement().val());
				else
					this.clearSearchResult();
				break;
		}
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
			let result = App.elementModule.addJsonElements(searchResult.data, true, true);
			App.elementModule.setSearchResultElement(result.elementsConverted);
			App.setDataType(AppDataType.SearchResults, $backFromHistory);
			App.directoryMenuComponent.setMainOption('all');

			this.clearLoader();			
			this.showSearchResultLabel(searchResult.data.length);	

			if (searchResult.data.length > 0)
			{
				App.setMode(AppModes.List);
				App.mapComponent.fitElementsBounds(result.elementsConverted);
			}
			else
				App.mapComponent.fitDefaultBounds();
		},
		(error) =>
		{
			//App.geocoder.geocodeAddress('');
		});
	}

	showSearchOptions()
	{
		$('.search-options').slideDown(350);
		if (!this.isSearchOptionVisible()) 
			$('#directory-menu-main-container .directory-menu-header').addClass("expanded");

		this.updateSearchPlaceholder();
	}

	updateSearchPlaceholder()
	{
		let placeholder = ''
		if (!this.isSearchOptionVisible()) placeholder = this.placeholders.default;
		else
		{
			switch (this.searchType())
			{
				case "place":   placeholder = this.placeholders.place;   break;
				case "element": placeholder = this.placeholders.element; break;
			}
		}			

		this.domElement().attr("placeholder", placeholder);
	}

	hideSearchOptions()
	{
		$('.search-options').slideUp(350);
		$('#directory-menu-main-container .directory-menu-header').removeClass("expanded");
		this.domElement().blur();
		this.updateSearchPlaceholder();
	}

	showSearchResultLabel($number : number)
	{
		$('#search-result-number').text($number);
		$('.search-results').show();
		$('.search-options').hide();
	}

	hideSearchResultLabel()
	{
		$('.search-results').slideUp(350);
	}

	clearSearchResult(resetValue = true)
	{
		App.setDataType(AppDataType.All);		
		this.hideSearchResultLabel();		
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
		this.domElement().val($value);
	}  

	getCurrSearchText() { return this.currSearchText; }

	isSearchOptionVisible() : boolean
	{
		return $('#directory-menu-main-container .directory-menu-header').hasClass("expanded");
	}

	searchType() : string
	{
		return $('.search-option-radio-btn:checked').attr('data-name');
	}
    
}