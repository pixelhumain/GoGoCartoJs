import { AppDataType, AppModes, AppStates } from "../../app.module";
declare var $, L;
import { App } from "../../gogocarto";
import { ViewPort } from "../../classes/classes";

interface SearchResult
{
	type: string;
	value: any;
};

interface AutocompleteItem
{
	label: string;
	subLabel?: string;
	type: string;
	value: any;
	icon?: string;
}

export class SearchBarComponent
{
	searchInput()
	{
		return $('.search-bar');
	}

	locationMarker : L.Marker;
	locationIcon = L.divIcon({className: 'marker-location-position'});
	private currSearchText : string = '';

	constructor() {}

	initialize(): void
	{
		$.widget('custom.gogoAutocomplete', $.ui.autocomplete, {
			_resizeMenu: () => {},
			_renderItem: (ul, item) => {
				const li = $('<li>');
				if (item.icon) {
					li.append(`<div class="icon ${item.icon}"></div>`);
				}
				if (['element', 'option'].includes(item.type)) {
					li.addClass('nested');
				}

				li.append(`<div class="label">${item.label}</div>`);

				if (item.subLabel) {
					li.append(`<div class="subLabel">${item.subLabel}</div>`);
				}

				return li.appendTo(ul);
			}
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
				this.searchTerm(term, (elementsResults, optionsResults) => {
					this.searchLoading(true);
					this.setAutocompleteItems(term, elementsResults, optionsResults, response);
				});
			},
			select: (event, ui) => {
				this.beforeSearch();

				if ('search_geocoded' === ui.item.type) {
					this.searchGeocoded(ui.item.value);
				}
				if ('search_elements' === ui.item.type) {
					this.searchElements(ui.item.value.term, ui.item.value.results);
				}
				if ('element' === ui.item.type) {
					this.searchElement(ui.item.value);
				}

				event.preventDefault();
			}
		});

		this.searchInput().keyup((e) => {
			if (e.keyCode === 13) { // press enter
				this.handleSearchAction();
			}
		});
		this.searchInput().click(() => this.searchInput().gogoAutocomplete('search'));
		$('.search-bar-icon').click(() => this.handleSearchAction());

		$('#btn-close-search-result').click(() => this.clearElementSearchResult());

		$('.search-geolocalize').tooltip();
		$('.search-geolocalize').click(() => this.geolocateUser());

		$('#search-overlay-mobile .overlay').click( () => this.hideMobileSearchBar() );
	}

	private setAutocompleteItems(term: string, elementsResults: SearchResult[], optionsResults: SearchResult[], response: (data: AutocompleteItem[]) => void): void
	{
		let items: AutocompleteItem[] = [{ label: App.config.translate('search.by.geographic.location'), type: 'search_geocoded', value: term, icon: 'gogo-icon-internet' }];

		if (elementsResults.length > 0) {
			items.push({ label: App.config.translate('search.by.elements'), type: 'search_elements', value: { term, results: { data: elementsResults.map(elementResult => elementResult.value) } }, icon: 'gogo-icon-database' })
			items = [ ...items, ...elementsResults.slice(0, 10).map(({ type, value }) => {
				const elementItem: AutocompleteItem = { type, value, label: value.name };
				if (value.address) {
					let subLabel = '';
					if (value.address.postalCode) {
						subLabel += value.address.postalCode;
					}
					if (value.address.addressLocality) {
						subLabel += (subLabel ? ' ' : '') + value.address.addressLocality;
					}
					if (subLabel) {
						elementItem.subLabel = subLabel;
					}
				}
				const element = App.elementsModule.getElementById(value.id);
				if (element) {
					const optionsToDisplay = element.getIconsToDisplay();
					if (optionsToDisplay.length > 0) {
						elementItem.icon = optionsToDisplay[0].option.icon;
					}
				}

				return elementItem;
			}) ];
		}

		response([ ...items, ...optionsResults.map(({ type, value }) => ({ type, value, label: value.name })) ]);
	}

	private searchTerm(term: string, callback: (elementsResults: SearchResult[], optionsResults: SearchResult[]) => void): void
	{
		let elementsResults: SearchResult[]|false, optionsResults: SearchResult[]|false = false;
		const resolveResults = ({ elements = false, options = false }: { elements?: SearchResult[]|false, options?: SearchResult[]|false }) => {
			elementsResults = elements ? elements : elementsResults;
			optionsResults = options ? options : optionsResults;

			if (elementsResults && optionsResults) {
				callback(elementsResults, optionsResults);
			}
		}

		const route = App.config.features.searchElements.url;
		if (route) {
			App.ajaxModule.sendRequest(route, 'get', { text: term },
			({ data: results }) => {
				resolveResults({ elements: results.map(result => ({
					type: 'element',
					value: result,
				})) })
			});
		}

		resolveResults({
			options: App.taxonomyModule.options
				.filter(option => option.name.toLowerCase().includes(term.toLowerCase()))
				.map(option => ({ type: 'option', value: option }))
		});
	}

	private searchGeocoded(address: string): void
	{
		App.geocoder.geocodeAddress(address,
			() => {
				App.setMode(AppModes.Map);
				this.clearSearchResult(false);
				this.displaySearchResultMarkerOnMap(App.geocoder.getLocation());
				App.mapComponent.fitBounds(App.geocoder.getBounds(), true);
			},
			() => {
				this.searchLoading(true);
				$('.search-no-result').show();
			});
	}

	private searchElements(term: string, searchResults, backFromHistory: boolean = false): void
	{
		this.searchLoading(true);
		this.currSearchText = term;
		App.setDataType(AppDataType.SearchResults, backFromHistory, searchResults);
		this.showSearchResultLabel(searchResults.length);
		App.gogoControlComponent.updatePosition();
		this.hideMobileSearchBar();
	}

	private searchElement(element): void
	{
		this.searchLoading(true);
		App.setState(AppStates.ShowElement, {id: element.id, mapPan: true});
	}

	// handle all validation by user (input key enter pressed, icon click...)
	private handleSearchAction(): void
	{
		const searchTerm = this.searchInput().val();

		this.beforeSearch();
		this.searchTerm(searchTerm, (elementsResults: SearchResult[], optionsResults: SearchResult[]) => {
			this.searchLoading(true);
			if (elementsResults.length > 0) {
				this.searchElement(elementsResults[0].value);
				return;
			}
			this.searchGeocoded(searchTerm);
		});
	}

	handleGeocodeResult(): void
	{
		this.setValue(App.geocoder.getLocationAddress());
	}

	geolocateUser(): void
	{
		this.beforeSearch();
		App.geocoder.geolocateUser((result: ViewPort) => {
			this.clearSearchResult();
			this.setValue(App.config.translate('geolocalized'));
			this.displaySearchResultMarkerOnMap(App.geocoder.getLocation());
		}, () => {
			this.searchLoading(true);
		});
	}

	public loadSearchElements(text : string, backFromHistory: boolean = false): void
	{
		this.setValue(text);
		this.currSearchText = text;

		let route = App.config.features.searchElements.url;
		let data =  { text };

		if (route) {
			App.ajaxModule.sendRequest(route, 'get', data,
			(searchResult) => this.searchElements(text, searchResult, backFromHistory),
			(error) => {
				this.searchLoading(true);
				//App.geocoder.geocodeAddress('');
			});
		} else {
			// TODO search through already received elements.
		}
	}

	showMobileSearchBar(): void
	{
		$('#search-overlay-mobile').fadeIn(250);
		$('.search-bar-with-options-container').show();
		$('.search-bar').focus();
		App.gogoControlComponent.hide(0);
	}

	hideMobileSearchBar(): void
	{
		// console.log("hide mobile search bar");
		$('#search-overlay-mobile').fadeOut(150);
		$('.search-bar-with-options-container.mobile').hide();
		App.gogoControlComponent.show(0);
	}

	update(): void
	{
		if (App.component.width() <= 600) {
			let mobileSearchBar = $('.search-bar-with-options-container');
			if (mobileSearchBar.parent('#search-overlay-mobile').length!=1) {
				$('.search-bar-with-options-container').appendTo('#search-overlay-mobile').addClass('mobile gogo-section-content');
			}
		} else {
			$('.search-bar-with-options-container').removeClass('mobile gogo-section-content').prependTo('.directory-menu-header').show();
		}
	}

	private searchLoading(stop: boolean = false): void
	{
		if (stop) {
			$('.search-bar-icon').removeClass('loading')
			return;
		}

		$('.search-bar-icon').addClass('loading');
	}

	showSearchResultLabel($number : number): void
	{
		$('.search-result-number').text($number);
		$('.search-result-value').text(this.currSearchText);
		$('.search-results').show();
		$('#element-info-bar').addClass('with-search-result-header');
	}

	hideSearchResult(): void
	{
		$('.search-results').hide();
		$('#element-info-bar').removeClass('with-search-result-header');
		App.gogoControlComponent.updatePosition();
	}

	clearElementSearchResult(): void
	{
		this.clearSearchResult();
		App.setMode(AppModes.Map);
	}

	clearSearchResult(resetValue: boolean = true): void
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

	setValue($value : string): void
	{
		this.searchInput().val($value);
	}

	getCurrSearchText(): string
	{
		return this.currSearchText;
	}

	private beforeSearch(): void
	{
		$('.search-no-result').hide();
		this.searchLoading();
	}

	private displaySearchResultMarkerOnMap(location: L.LatLng): void
	{
		if (!App.map()) {
			return;
		}
		this.locationMarker = new L.Marker(location, { icon: this.locationIcon }).addTo(App.map());
	}
}
