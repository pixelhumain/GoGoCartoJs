import { Geocoded } from 'universal-geocoder';
import { App } from '../../gogocarto';
import { AppDataType, AppModes, AppStates } from '../../app.module';
import { Option, ViewPort } from '../../classes/classes';

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
  private locationShape: L.GeoJSON;
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
        App.search.searchTerm(term, (elementsResults, optionsResults, locationsResults) => {
          this.searchLoading(true);
          this.setAutocompleteItems(term, elementsResults, optionsResults, locationsResults, response);
        });
      },
      focus: (event) => event.preventDefault(),
      select: (event, ui) => {
        this.beforeSearch();
        switch (ui.item.type) {
          case 'search_geocoded':
            this.searchGeocoded(ui.item.value);
            break;
          case 'geocoded':
            this.showGeocoded(ui.item.value);
            break;
          case 'option':
            this.searchOption(ui.item.value);
            break;
          case 'search_elements':
            this.searchElements(ui.item.value.term, ui.item.value.results);
            break;
          case 'element':
            this.searchElement(ui.item.value);
            break;
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
    locationsResults: SearchResult[],
    response: (data: AutocompleteItem[]) => void
  ): void {
    let items: AutocompleteItem[] = [];

    if (App.config.isFeatureAvailable('searchPlace') && !App.config.search.canAutocomplete) {
      items = [
        ...items,
        {
          label: App.config.translate('geographic.location'),
          type: 'search_geocoded',
          value: term,
          icon: 'gogo-icon-marker-symbol',
        },
      ];
    }

    if (locationsResults.length > 0) {
      items = [
        ...items,
        ...locationsResults.slice(0, 4).map(({ type, value }: { type: string; value: Geocoded }) => ({
          type,
          value,
          label: `<span class="geocoded-name">${
            value.getFormattedAddress() ||
            value.getStreetName() ||
            value.getSubLocality() ||
            value.getLocality() ||
            value.getRegion() ||
            value.getCountry()
          }</span>`,
          icon: 'gogo-icon-marker-symbol',
        })),
      ];
    }

    if (optionsResults.length > 0) {
      items = [
        ...items,
        ...optionsResults.slice(0, 10).map(({ type, value }: { type: string; value: Option }) => ({
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

  private searchGeocoded(address: string): void {
    if (App.config.mode.autocompleteOnly) {
      const route = App.routerModule.generate('normal', { mode: 'carte', addressAndViewport: address });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchGeocoder', { value: address });
      return;
    }
    
    App.geocoder.geocodeAddress(
      address,
      (results) => {
        this.showGeocoded(results[0]);
      },
      () => {
        this.searchLoading(true);
        $('.search-no-result').show();
      }
    );
  }

  private showGeocoded(result: Geocoded): void {
    if (App.config.mode.autocompleteOnly) {
      let address = (result as any).getDisplayName() // seems an error in universal gecoder, getFormatedAddress does not work
      const route = App.routerModule.generate('normal', { mode: 'carte', addressAndViewport: address });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchGeocoder', { value: address });
      return;
    } else {
      this.searchLoading(true);
      this.resetOptionSearchResult();
      this.resetElementsSearchResult(false);
      this.hideMobileSearchBar();
      let geojson = (result as any).shape
      if (geojson && geojson.type == "Polygon") {
        console.log("geojson", geojson)
        this.locationShape = L.geoJSON(geojson, {
          style: function (feature) {
            return {color: App.config.colors.primary, fillOpacity: 0.05, opacity: .7};
          }
        }).addTo(App.map())
      } else {
        this.displaySearchResultMarkerOnMap(L.latLng(<number>result.getCoordinates().latitude, <number>result.getCoordinates().longitude));
      }
      App.mapComponent.fitBounds(App.geocoder.latLngBoundsFromRawBounds(result.getBounds()), true);
    }
  }

  searchOption(option: Option): void {
    if (App.config.mode.autocompleteOnly) {
      const route = App.routerModule.generate('search_option', { name: option.name, id: option.id });
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
      const route = App.routerModule.generate('search', { mode: 'liste', text: term });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchElements', { value: term });
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
      const route = App.routerModule.generate('show_element', { name: element.name, id: element.id });
      this.searchInput().trigger('searchRoute', route);
      this.searchInput().trigger('searchElement', { name: element.name, id: element.id });
      return;
    }

    this.searchLoading(true);
    this.resetOptionSearchResult();
    this.resetSearchResult(false);
    this.hideMobileSearchBar();
    App.elementsJsonModule.convertJsonElements([element], true, true); // add it so it can retrieved again by it's ID
    App.setState(AppStates.ShowElement, { id: element.id, mapPan: true });
  }

  // Handle forced search action by user (input key enter pressed, icon click)
  private handleSearchAction(): void {
    const searchTerm = this.searchInput().val();

    this.beforeSearch();
    App.search.searchTerm(
      searchTerm,
      (elementsResults, _, locationsResults) => {
        this.searchLoading(true);
        if (locationsResults.length > 0) {
          const matchingLocations: Geocoded[] = locationsResults
            .map((locationResult) => locationResult.value)
            .filter(
              (location: Geocoded) =>
                App.search.compareResult(searchTerm, location.getLocality()) ||
                App.search.compareResult(searchTerm, location.getRegion())
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
        if (App.config.isFeatureAvailable('searchPlace')) {
          this.searchGeocoded(searchTerm);
        }
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
        { data: App.search.searchInResults(text, App.elementsModule.allElements(), (element: any) => element.name) },
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

  resetSearchResult(resetValue = true): void {
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
    if (this.locationShape) {
      this.locationShape.remove();
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
