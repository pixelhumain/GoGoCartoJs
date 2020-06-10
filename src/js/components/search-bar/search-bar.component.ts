import { AppDataType, AppModes, AppStates } from '../../app.module';
import { App } from '../../gogocarto';
import { removeDiactrics } from '../../utils/string-helpers';
import { Option, ViewPort } from '../../classes/classes';
import { GeocodeResult } from '../../modules/geocoder.module';

interface CustomJQuery extends JQuery {
  gogoAutocomplete(options: JQueryUI.AutocompleteOptions): JQuery;
  gogoAutocomplete(methodName: 'search', value?: string): void;
}

interface SearchResult {
  type: string;
  value: any;
}

interface AutocompleteItem {
  label: string;
  subLabel?: string;
  type: string;
  value: any;
  icon?: string;
}

export class SearchBarComponent {
  searchInput(): CustomJQuery {
    return $('.search-bar') as CustomJQuery;
  }

  private locationMarker: L.Marker;
  private locationIcon: L.DivIcon = L.divIcon({ className: 'marker-location-position' });
  private currSearchText = '';

  initialize(): void {
    $.widget('custom.gogoAutocomplete', $.ui.autocomplete, {
      _resizeMenu: () => {
        // Intentionally left empty
      },
      _renderItem: (ul, item) => {
        const li = $('<li>').addClass(`search-bar-autocomplete-result-item ${item.type}`);
        const wrapper = $('<div>').addClass('search-bar-autocomplete-result-item-wrapper');
        if (item.icon) {
          wrapper.append(`<div class="icon ${item.icon}"></div>`);
        }
        if ('element' === item.type) {
          wrapper.addClass('nested');
        }

        wrapper.append(`<div class="label">${item.label}</div>`);

        if (item.subLabel) {
          wrapper.append(`<div class="subLabel">${item.subLabel}</div>`);
        }

        return li.append(wrapper).appendTo(ul);
      },
    });

    this.searchInput().gogoAutocomplete({
      appendTo: '.autocomplete-container',
      classes: {
        'ui-autocomplete': 'search-bar-autocomplete-results-container gogo-section-content',
      },
      position: {
        at: 'left bottom+5',
      },
      source: ({ term }, response) => {
        this.beforeSearch();
        this.searchTerm(term, (elementsResults, optionsResults) => {
          this.searchLoading(true);
          this.setAutocompleteItems(term, elementsResults, optionsResults, response);
        });
      },
      focus: (event) => event.preventDefault(),
      select: (event, ui) => {
        this.beforeSearch();
        switch (ui.item.type) {
          case 'search_geocoded':
            this.searchGeocoded(ui.item.value); break;
          case 'option':
            this.searchOption(ui.item.value); break;
          case 'search_elements':
            this.searchElements(ui.item.value.term, ui.item.value.results); break;
          case 'element':
            this.searchElement(ui.item.value); break;
        }
        event.preventDefault();
      },
    });

    this.searchInput().keypress((e) => {
      // Enter pressed
      if (e.keyCode === 13) {
        this.handleSearchAction();
      }
    });
    this.searchInput().click(() => this.searchInput().gogoAutocomplete('search'));
    $('.search-bar-icon, .search-bar-btn').click(() => this.handleSearchAction());

    $('#btn-close-search-result').click(() => this.resetElementsSearchResult());

    $('.search-geolocalize').tooltip();
    $('.search-geolocalize').click(() => this.geolocateUser());

    $('#search-overlay-mobile .overlay').click(() => this.hideMobileSearchBar());
  }

  private setAutocompleteItems(
    term: string,
    elementsResults: SearchResult[],
    optionsResults: SearchResult[],
    response: (data: AutocompleteItem[]) => void
  ): void {
    let items: AutocompleteItem[] = [
      {
        label: App.config.translate('geographic.location'),
        type: 'search_geocoded',
        value: term,
        icon: 'gogo-icon-marker-symbol',
      },
    ];

    if (optionsResults.length > 0) {
      items = [
        ...items,
        ...optionsResults.slice(0, 10).map(({ type, value }) => ({
          type,
          value,
          label: `<span class="category-label">${App.config.translate('category')}</span>
                  <span class="category-name">${value.name}</span>`,
          icon: value.icon || 'gogo-icon-stamp-2',
        })),
      ];
    }

    if (elementsResults.length > 0) {
      items.push({
        label: `${App.config.translate('elements.containing')} <span class="search-term">${term}</span> (${
          elementsResults.length
        })`,
        type: 'search_elements',
        value: {
          term,
          results: {
            data: elementsResults.map((elementResult) => elementResult.value),
          },
        },
        icon: 'gogo-icon-database',
      });
      items = [
        ...items,
        ...elementsResults.slice(0, 4).map(({ type, value }) => {
          const elementItem: AutocompleteItem = {
            type,
            value,
            label: `<span class="element-name">${value.name}</span>`,
          };
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

          return elementItem;
        }),
      ];
    }

    response(items);
  }

  private searchTerm(
    term: string,
    callback: (
      elementsResults: SearchResult[],
      optionsResults: SearchResult[],
      locationsResults?: SearchResult[]
    ) => void,
    searchGeocoded = false
  ): void {
    let elementsResults: SearchResult[] | false,
      optionsResults: SearchResult[] | false,
      locationsResults: SearchResult[] | false = false;
    const resolveResults = ({
      elements = false,
      options = false,
      locations = false,
    }: {
      elements?: SearchResult[] | false;
      options?: SearchResult[] | false;
      locations?: SearchResult[] | false;
    }): void => {
      elementsResults = elements ? elements : elementsResults;
      optionsResults = options ? options : optionsResults;
      locationsResults = locations ? locations : locationsResults;

      if (elementsResults && optionsResults && !searchGeocoded) {
        callback(elementsResults, optionsResults);
      }

      if (elementsResults && optionsResults && locationsResults) {
        callback(elementsResults, optionsResults, locationsResults);
      }
    };

    const route = App.config.features.searchElements.url;
    if (route) {
      App.ajaxModule.sendRequest(route, 'get', { text: term }, ({ data: results }) => {
        resolveResults({
          elements: results.map((result) => ({
            type: 'element',
            value: result,
          })),
        });
      });
    } else {
      resolveResults({
        elements: this.searchInResults(
          term,
          App.config.data.elements,
          (element: any) => element.name
        ).map((element) => ({ type: 'element', value: element })),
      });
    }

    resolveResults({
      options: this.searchInResults(term, App.taxonomyModule.options, (option) => option.name)
        .filter((option) => option.displayInMenu)
        .map((option) => ({
          type: 'option',
          value: option,
        })),
    });

    if (searchGeocoded) {
      App.geocoder.geocodeAddress(term, (results: GeocodeResult[]) => {
        resolveResults({
          locations: results.map((location) => ({
            type: 'geocoded',
            value: location,
          })),
        });
      });
    }
  }

  private searchGeocoded(address: string): void {
    if (App.config.mode.autocompleteOnly) {
      let route = App.routerModule.generate('normal', { mode: 'carte', addressAndViewport: address });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchGeocoder', { 'value': address });
      return;
    }

    App.geocoder.geocodeAddress(
      address,
      (results: GeocodeResult[]) => {
        this.searchLoading(true);
        this.resetOptionSearchResult();
        this.resetElementsSearchResult(false);
        this.hideMobileSearchBar();

        this.displaySearchResultMarkerOnMap(L.latLng(results[0].getCoordinates()));
        App.mapComponent.fitBounds(App.geocoder.latLngBoundsFromRawBounds(results[0].getBounds()), true);
      },
      () => {
        this.searchLoading(true);
        $('.search-no-result').show();
      }
    );
  }

  searchOption(option: Option): void {
    if (App.config.mode.autocompleteOnly) {
      let route = App.routerModule.generate('search_option', { name: option.name, id: option.id });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchCategory', { name: option.name, id: option.id });
      return;
    }

    this.searchLoading(true);
    this.resetOptionSearchResult(false);
    this.resetElementsSearchResult(false);
    this.hideMobileSearchBar();

    if (App.config.menu.showOnePanePerMainOption) {
      // Uncheck only the pane categories
      option.parentCategoryIds.forEach((parentCategoryId) => {
        const category = App.taxonomyModule.getCategoryById(parentCategoryId.id);
        if (category.isRootCategory) {
          return;
        }
        category.toggle(false, false);
      });
    } else {
      // Uncheck all categories
      App.taxonomyModule.categories.forEach((category) => category.toggle(false, false));
    }
    // Expand the related categories and check the mandatory sibling categories
    option.parentCategoryIds.forEach((parentCategoryId) => {
      App.taxonomyModule.getCategoryById(parentCategoryId.id).toggleChildrenDetail(true);
      parentCategoryId.mandatorySiblingIds.forEach((categoryId) =>
        App.taxonomyModule.getCategoryById(categoryId).toggle(true, false)
      );
    });
    // Expand the related options
    option.parentOptionIds.forEach((parentOptionId) =>
      App.filtersComponent.setOption(parentOptionId, false, false, true)
    );
    // Check the option
    App.filtersComponent.setOption(option.id, false, true, false, true);
  }

  private searchElements(term: string, searchResults, backFromHistory = false): void {
    if (App.config.mode.autocompleteOnly) {
      let route = App.routerModule.generate('search', { mode: 'liste', text: term });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchElements', { 'value': term });
      return;
    }

    this.searchLoading(true);
    this.resetOptionSearchResult();
    this.resetElementsSearchResult(false);
    this.hideMobileSearchBar();

    this.currSearchText = term;
    App.setDataType(AppDataType.SearchResults, backFromHistory, searchResults);
    this.showSearchResultLabel(searchResults.data.length);
    App.gogoControlComponent.updatePosition();
  }

  private searchElement(element): void {
    if (App.config.mode.autocompleteOnly) {
      let route = App.routerModule.generate('show_element', { name: element.name, id: element.id });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchElement', { name: element.name, id: element.id });
      return;
    }

    this.searchLoading(true);
    this.resetOptionSearchResult();
    this.resetSearchResult(false);
    this.hideMobileSearchBar();

    App.setState(AppStates.ShowElement, { id: element.id, mapPan: true });
  }

  private searchInResults<T>(searched: string, results: T[], toString: (result: T) => string): T[] {
    return results.filter((result) => {
      const noDiacriticsResult = removeDiactrics(toString(result)).toLowerCase();
      return noDiacriticsResult.includes(removeDiactrics(searched).toLowerCase());
    });
  }

  private compareResult(searched: string, result: string): boolean {
    return removeDiactrics(searched).toLowerCase() === removeDiactrics(result).toLowerCase();
  }

  // Handle forced search action by user (input key enter pressed, icon click)
  private handleSearchAction(): void {
    const searchTerm = this.searchInput().val();

    this.beforeSearch();
    this.searchTerm(
      searchTerm,
      (elementsResults, _, locationsResults) => {
        this.searchLoading(true);
        if (locationsResults.length > 0) {
          const matchingLocations: GeocodeResult[] = locationsResults
            .map((locationResult) => locationResult.value)
            .filter(
              (location: GeocodeResult) =>
                this.compareResult(searchTerm, location.getCity()) ||
                this.compareResult(searchTerm, location.getRegion())
            );
          if (matchingLocations.length > 0) {
            this.searchGeocoded(searchTerm);
            return;
          }
        }
        if (elementsResults.length > 0) {
          this.searchElements(searchTerm, {
            data: elementsResults.map((elementResult) => elementResult.value),
          });

          return;
        }

        // Fallback to geocoded search if no precise results found in locations or elements.
        this.searchGeocoded(searchTerm);
      },
      true
    );
  }

  public handleGeocodeResult(): void {
    this.setValue(App.geocoder.getLocationAddress());
  }

  public geolocateUser(): void {
    this.beforeSearch();
    App.geocoder.geolocateUser(
      (viewport: ViewPort) => {
        this.resetOptionSearchResult();
        this.resetElementsSearchResult();
        this.setValue(App.config.translate('geolocalized'));
        this.displaySearchResultMarkerOnMap(L.latLng(viewport.toLocation()));
      },
      () => {
        this.searchLoading(true);
      }
    );
  }

  public loadSearchElements(text: string, backFromHistory = false): void {
    this.setValue(text);
    this.currSearchText = text;

    const route = App.config.features.searchElements.url;
    const data = { text };

    if (route) {
      App.ajaxModule.sendRequest(
        route,
        'get',
        data,
        (searchResult) => this.searchElements(text, searchResult, backFromHistory),
        () => {
          this.searchLoading(true);
          //App.geocoder.geocodeAddress('');
        }
      );
    } else {
      this.searchElements(
        text,
        { data: this.searchInResults(text, App.config.data.elements, (element: any) => element.name) },
        backFromHistory
      );
    }
  }

  public showMobileSearchBar(): void {
    $('#search-overlay-mobile').fadeIn(250);
    $('.search-bar-with-options-container').show();
    $('.search-bar').focus();
    App.gogoControlComponent.hide(0);
  }

  public hideMobileSearchBar(): void {
    $('#search-overlay-mobile').fadeOut(150);
    $('.search-bar-with-options-container.mobile').hide();
    App.gogoControlComponent.show(0);
  }

  lastComponentWidth = null;
  public update(): void {
    // prevent updating for nothing, because if you are typing something in the search bar
    // while the resize happen, it loose the focus
    if (App.component.width() == this.lastComponentWidth) return;

    if (App.component.width() <= 600) {
      const mobileSearchBar = $('.search-bar-with-options-container');
      if (mobileSearchBar.parent('#search-overlay-mobile').length != 1) {
        $('.search-bar-with-options-container')
          .appendTo('#search-overlay-mobile')
          .addClass('mobile gogo-section-content');
      }
    } else {
      $('.search-bar-with-options-container')
        .removeClass('mobile gogo-section-content')
        .prependTo('.directory-menu-header')
        .show();
    }
    this.lastComponentWidth = App.component.width();
  }

  private searchLoading(stop = false): void {
    if (stop) {
      $('.search-bar-icon').removeClass('loading');
      return;
    }

    $('.search-bar-icon').addClass('loading');
  }

  private showSearchResultLabel($number: number): void {
    $('.search-result-number').text($number);
    $('.search-result-value').text(this.currSearchText);
    $('.search-results').show();
    $('#element-info-bar').addClass('with-search-result-header');
  }

  private hideSearchResult(): void {
    $('.search-results').hide();
    $('#element-info-bar').removeClass('with-search-result-header');
    App.gogoControlComponent.updatePosition();
  }

  private resetOptionSearchResult(setAllOption = true): void {
    App.taxonomyModule.categories.forEach((category) => category.toggle(true, false));
    if (setAllOption) {
      App.filtersComponent.setMainOption('all');
    }
  }

  private resetElementsSearchResult(resetValue = true): void {
    this.resetSearchResult(resetValue);
    App.setMode(AppModes.Map, false, false);
    App.setState(AppStates.Normal);
  }

  private resetSearchResult(resetValue = true): void {
    App.setDataType(AppDataType.All);
    this.hideSearchResult();
    this.clearLocationMarker();
    this.currSearchText = '';
    if (resetValue) {
      this.setValue('');
      App.elementListComponent.setTitle('');
    }
  }

  private clearLocationMarker(): void {
    if (this.locationMarker) {
      this.locationMarker.remove();
    }
  }

  public setValue($value: string): void {
    this.searchInput().val($value);
  }

  public getCurrSearchText(): string {
    return this.currSearchText;
  }

  private beforeSearch(): void {
    $('.search-no-result').hide();
    this.searchLoading();
  }

  private displaySearchResultMarkerOnMap(location: L.LatLng): void {
    if (!App.map()) {
      return;
    }
    this.locationMarker = new L.Marker(location, {
      icon: this.locationIcon,
    }).addTo(App.map());
  }
}
