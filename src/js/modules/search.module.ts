import { App } from '../gogocarto';
import { GeocodeResult } from '../modules/geocoder.module';
import { Option } from '../modules/taxonomy/taxonomy.module';
import { removeDiactrics } from '../utils/string-helpers';

interface SearchResult {
  type: string;
  value: any;
}

class CategorySearchResult {
  option: Option;
  matchScore: number;
  searchTextLeft: string;
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
            App.config.data.elements,
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
      App.geocoder.geocodeAddress(term, (results: GeocodeResult[]) => {
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

  searchInsideCategory($text: string): CategorySearchResult[] {
    if (!$text) return null;

    const regexpr = this.getSearchRegExprFromString($text);

    const results = [];
    const searchOptionsResult = App.taxonomyModule.options.forEach((option) => {
      const result = this.getOptionMatchResult(option, $text, regexpr);
      if (result) results.push(result);
    });

    if (results.length == 0) {
      console.log('no matching');
      return null;
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  }

  private getSearchRegExprFromString($text): string {
    $text = this.stripBeginAndEndSpaces($text);
    const keywords = this.explodeWords($text);
    let regexpr = '';
    keywords.forEach((value, index) => (regexpr += (index == 0 ? '' : '|') + value));
    return regexpr;
  }

  private getOptionMatchResult($option, $text, $regexpr): CategorySearchResult {
    let matchs = $option.name.match(new RegExp($regexpr, 'gi'));
    const matchsShort = $option.nameShort.match(new RegExp($regexpr, 'gi'));

    if (matchs == null && matchsShort == null) return null;

    let matchScore = matchs ? matchs.join().length / $option.name.length : 0;
    const matchShortScore = matchsShort ? matchsShort.join().length / $option.nameShort.length : 0;
    matchs = matchScore > matchShortScore ? matchs : matchsShort;
    matchScore = matchScore > matchShortScore ? matchScore : matchShortScore;

    const textLeft = this.getRemainingStringAfterMatch($text, matchs);

    return {
      option: $option,
      matchScore: matchScore,
      searchTextLeft: textLeft,
    };
  }

  private getRemainingStringAfterMatch($text, $matchs): string {
    let textLeft = $text;
    textLeft = this.removeWords(textLeft, $matchs);
    textLeft = this.stripBeginAndEndSpaces(textLeft);
    return textLeft;
  }

  private stripBeginAndEndSpaces($text: string) {
    return $text.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  private explodeWords($text: string) {
    return $text.split(/[\s,]+/);
  }

  private removeWords($text: string, $words: string[]): string {
    for (const word of $words) $text = $text.replace(new RegExp(word, 'ig'), '');
    return $text;
  }
}
