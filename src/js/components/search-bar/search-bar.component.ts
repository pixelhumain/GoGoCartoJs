import { AppDataType, AppModes } from "../../app.module";
declare var $, L;
import { App } from "../../gogocarto";
import { ViewPort } from "../../classes/classes";

export class SearchBarComponent
{
	searchInput() { return $('.search-bar'); }

	locationMarker : L.Marker;
	locationIcon = L.divIcon({className: 'marker-location-position'});
	private currSearchText : string = '';

	constructor() {}

	initialize()
	{
		$.widget('custom.gogoAutocomplete', $.ui.autocomplete, {
			_resizeMenu: function() {}
		});

		this.searchInput().gogoAutocomplete({
			appendTo: '.search-bar-container',
			classes: {
				'ui-autocomplete': 'search-bar-autocomplete-results-container'
			},
			position: {
				at: 'left bottom+5'
			},
			source: ({ term }, response) => {
				this.beforeSearch();

				interface SearchResult {
					label: string;
					type: string;
					value: any;
				};

				let elementsResults: Array<SearchResult>|false, optionsResults: Array<SearchResult>|false = false;
				const resolveResults = ({ elements = false, options = false }: { elements?: Array<SearchResult>|false, options?: Array<SearchResult>|false }) => {
					let results = [{ label: App.config.translate('search.by.geographic.location'), type: 'search_geocoded', value: term }];
					elementsResults = elements ? elements : elementsResults;
					optionsResults = options ? options : optionsResults;

					if (elementsResults && optionsResults) {
						if (elementsResults.length > 0) {
							results.push({ label: App.config.translate('search.by.elements'), type: 'search_elements', value: { term, results: { data: elementsResults.map(elementResult => elementResult.value) } } })
							results = [ ...results, ...elementsResults ];
						}

						this.searchLoading(true);

						response([ ...results, ...optionsResults ]);
					}
				}

				const route = App.config.features.searchElements.url;
				if (route) {
					App.ajaxModule.sendRequest(route, 'get', { text: term },
					({ data: results }) => {
						resolveResults({ elements: results.map(result => ({
							label: result.name,
							type: 'element',
							value: result,
						})) })
					});
				}

				resolveResults({
					options: App.taxonomyModule.options
						.filter(option => option.name.toLowerCase().includes(term.toLowerCase()))
						.map(option => ({ label: option.name, type: 'option', value: option }))
				});
			},
			select: (event, ui) => {
				this.beforeSearch();

				if ('search_geocoded' === ui.item.type) {
					App.geocoder.geocodeAddress(ui.item.value,
						() => {
							this.clearSearchResult(false);
							this.displaySearchResultMarkerOnMap(App.geocoder.getLocation());
							App.mapComponent.fitBounds(App.geocoder.getBounds(), true);
						},
						() => {
							this.searchLoading(true);
							$('.search-no-result').show();
						});
				}
				if ('search_elements' === ui.item.type) {
					this.searchLoading(true);
					this.currSearchText = ui.item.value.term;
					App.setDataType(AppDataType.SearchResults, false, ui.item.value.results);
					this.showSearchResultLabel(ui.item.value.results.length);
					App.gogoControlComponent.updatePosition();
					this.hideMobileSearchBar();
				}
				event.preventDefault();
			}
		});

		$('.search-bar-icon').click(() => this.handleSearchAction());

		$('#btn-close-search-result').click(() => this.clearElementSearchResult());

		$('.search-geolocalize').tooltip();
		$('.search-geolocalize').click(() => this.geolocateUser());

		$('#search-overlay-mobile .overlay').click( () => this.hideMobileSearchBar() );
	}

	// handle all validation by user (input key enter pressed, icon click...)
	private handleSearchAction()
	{
		this.beforeSearch();

		let searchText = this.searchInput().val();

		let searchType = 'place';
		if (searchText === 'element') {
			searchType = 'element';
		}
		switch (searchType)
    {
      case "place":
        App.geocoder.geocodeAddress(searchText,
          (result) => {
            this.clearSearchResult(false);
            this.displaySearchResultMarkerOnMap(App.geocoder.getLocation());
            App.mapComponent.fitBounds(App.geocoder.getBounds(), true);
          },
          () => {
						this.searchLoading(true);
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
	}

	geolocateUser()
	{
		this.beforeSearch();
		App.geocoder.geolocateUser((result: ViewPort) => {
			this.clearSearchResult();
			this.setValue("Geolocalisé");
			this.displaySearchResultMarkerOnMap(App.geocoder.getLocation());
		}, () => {
			this.searchLoading(true);
		});
	}

	searchElements($text : string, $backFromHistory = false)
	{
		this.setValue($text);
		this.currSearchText = $text;

		let route = App.config.features.searchElements.url;
		let data =  { text: $text };

		if (route) {
			App.ajaxModule.sendRequest(route, 'get', data,
			(searchResult) =>
			{
	      App.setDataType(AppDataType.SearchResults, $backFromHistory, searchResult);

	      this.searchLoading(true);
	      this.showSearchResultLabel(searchResult.data.length);
	 			App.gogoControlComponent.updatePosition();
	 			this.hideMobileSearchBar();
			},
			(error) =>
			{
				this.searchLoading(true);
				//App.geocoder.geocodeAddress('');
			});
		}
		else
		{
			// TODO search through already received elements.
		}
	}

	showMobileSearchBar() {
		$('#search-overlay-mobile').fadeIn(250);
		$('.search-bar-with-options-container').show();
		$('.search-bar').focus();
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
		{
			let mobileSearchBar = $('.search-bar-with-options-container');
			if(mobileSearchBar.parent('#search-overlay-mobile').length!=1)
				$('.search-bar-with-options-container').appendTo('#search-overlay-mobile').addClass('mobile gogo-section-content');
		}
		else
			$('.search-bar-with-options-container').removeClass('mobile gogo-section-content').prependTo('.directory-menu-header').show();
	}

	private searchLoading(stop: boolean = false): void
	{
		if (stop) {
			$('.search-bar-icon').removeClass('loading')
			return;
		}

		$('.search-bar-icon').addClass('loading');
	}

	showSearchResultLabel($number : number)
	{
		$('.search-result-number').text($number);
		$('.search-result-value').text(this.currSearchText);
		$('.search-results').show();
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
		this.searchLoading(true);
		this.clearLocationMarker();
		this.currSearchText = '';
		if (resetValue) {
			this.setValue("");
			App.elementListComponent.setTitle("");
		}
	}

	private clearLocationMarker(): void
	{
		if (this.locationMarker) {
			this.locationMarker.remove();
		}
	}

	setValue($value : string)
	{
		this.searchInput().val($value);
	}

	getCurrSearchText() { return this.currSearchText; }

	private beforeSearch()
	{
		$('.search-no-result').hide();
		this.searchLoading();
	}

	private displaySearchResultMarkerOnMap(location: L.LatLng)
	{
		if (!App.map()) return;
		this.locationMarker = new L.Marker(location, { icon: this.locationIcon }).addTo(App.map());
	}
}