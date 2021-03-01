import { App } from '../gogocarto';
import { removeDiactrics } from '../utils/string-helpers';

interface SearchResult {
  type: string;
  value: any;
}

/**
 * Make generic search, through places, elements and categories.
 */
export class SearchModule {
  constructor() {}

  public searchTerm(
    term: string,
    callback: (
      elementsResults: SearchResult[],
      optionsResults: SearchResult[],
      locationsResults: SearchResult[]
    ) => void,
    forceSearchLocations = false
  ): void {
    const searchElements = App.config.isFeatureAvailable('searchElements');
    const searchOptions = App.config.isFeatureAvailable('searchCategories');
    const searchLocations =
      App.config.isFeatureAvailable('searchPlace') && (App.config.search.canAutocomplete || forceSearchLocations);

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

      if (elementsResults && optionsResults && locationsResults) {
        callback(elementsResults, optionsResults, locationsResults);
      }
    };

    if (searchElements) {
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
            App.elementsModule.allElements(),
            (element: any) => element.name
          ).map((element) => ({ type: 'element', value: element })),
        });
      }
    } else {
      resolveResults({ elements: [] });
    }

    if (searchOptions) {
      resolveResults({
        options: this.searchInResults(term, App.taxonomyModule.options, (option) => option.name)
          .filter((option) => option.displayInMenu)
          .map((option) => ({
            type: 'option',
            value: option,
          })),
      });
    } else {
      resolveResults({ options: [] });
    }

    if (searchLocations) {
      App.geocoder.geocodeAddress(term, (results) => {
        resolveResults({
          locations: results.map((location) => ({
            type: 'geocoded',
            value: location,
          })),
        });
      });
    } else {
      resolveResults({ locations: [] });
    }
  }

  public searchInResults<T>(searched: string, results: T[], toString: (result: T) => string): T[] {
    return results.filter((result) => {
      const noDiacriticsResult = removeDiactrics(toString(result)).toLowerCase();
      return noDiacriticsResult.includes(removeDiactrics(searched).toLowerCase());
    });
  }

  public compareResult(searched: string, result: string): boolean {
    return removeDiactrics(searched).toLowerCase() === removeDiactrics(result).toLowerCase();
  }
}
