import { Option } from '../modules/taxonomy/taxonomy.module';
import { App } from '../gogocarto';

class CategorySearchResult {
  option: Option;
  matchScore: number;
  searchTextLeft: string;
}

// Module no yet used. The goal of this module is to a generic search, throw places, elements and categories
export class SearchModule {
  constructor() {}

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
