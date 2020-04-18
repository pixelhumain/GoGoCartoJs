import { App } from '../../gogocarto';
import { parseArrayNumberIntoString, parseStringIntoArrayNumber } from '../../utils/parser-string-number';
import { slugify } from '../../utils/string-helpers';

declare let $: any;

export class FilterRoutingModule {
  loadFiltersFromString(string: string) {
    const splited = string.split('@');
    const mainOptionSlug = splited[0];

    let mainOptionId;
    if (mainOptionSlug == 'all') mainOptionId = 'all';
    else {
      const mainOption = App.taxonomyModule.getMainOptionBySlug(mainOptionSlug);
      mainOptionId = mainOption ? mainOption.id : 'all';
    }
    App.filtersComponent.setMainOption(mainOptionId);

    let filtersString: string;
    let addingMode: boolean;

    if (splited.length == 2) {
      filtersString = splited[1];

      if (filtersString[0] == '!') addingMode = false;
      else addingMode = true;

      filtersString = filtersString.substring(1);
    } else if (splited.length > 2) {
      console.error('Error spliting in loadFilterFromString');
    }

    const filters = parseStringIntoArrayNumber(filtersString);
    //console.log('filters', filters);
    if (!App.loadFullTaxonomy && mainOptionSlug != 'all') $('.main-categories').hide();

    if (filters.length > 0) {
      // console.log('addingMode', addingMode);

      if (mainOptionSlug == 'all') {
        if (App.loadFullTaxonomy) App.taxonomyModule.taxonomy.toggle(!addingMode, false);
        else {
          for (const option of App.taxonomyModule.taxonomy.options) {
            option.toggleVisibility(!addingMode);
          }
        }
      } else {
        for (const cat of App.taxonomyModule.getMainOptionBySlug(mainOptionSlug).subcategories)
          for (const option of cat.options) {
            if (App.loadFullTaxonomy) option.toggle(!addingMode, false);
            else option.toggleVisibility(!addingMode, true);
          }
      }

      for (const filterId of filters) {
        const option = App.taxonomyModule.getOptionByIntId(filterId);
        if (!option) console.log('Error loadings filters : ' + filterId);
        else {
          if (App.loadFullTaxonomy) option.toggle(addingMode, false);
          if (!App.loadFullTaxonomy) option.toggleVisibility(addingMode);
        }
      }

      if (App.loadFullTaxonomy) {
        if (App.config.menu.showOnePanePerMainOption)
          if (mainOptionSlug == 'all') App.taxonomyModule.taxonomy.updateState();
          else App.taxonomyModule.getMainOptionBySlug(mainOptionSlug).recursivelyUpdateStates();
        else App.taxonomyModule.taxonomy.recursivelyUpdateStates();
      }

      App.elementsModule.updateElementsToDisplay(true);
      //App.historyModule.updateCurrState();
    }
  }

  getFiltersToString(): string {
    const mainOptionId = App.currMainId;

    let mainOptionName;
    let checkArrayToParse, uncheckArrayToParse;

    if (mainOptionId == 'all' && App.config.menu.showOnePanePerMainOption) {
      mainOptionName = 'all';
      checkArrayToParse = App.taxonomyModule.taxonomy.checkedOptions.map((option) => option.intId);
      uncheckArrayToParse = App.taxonomyModule.taxonomy.disabledOptions.map((option) => option.intId);
    } else {
      let allOptions;

      if (App.config.menu.showOnePanePerMainOption) {
        const mainOption = App.taxonomyModule.getMainOptionById(mainOptionId);
        mainOptionName = slugify(mainOption.nameShort);
        allOptions = mainOption.allChildrenOptions;
      } else {
        mainOptionName = 'all';
        allOptions = App.taxonomyModule.options;
      }

      checkArrayToParse = allOptions.filter((option) => option.isChecked).map((option) => option.intId);
      uncheckArrayToParse = allOptions.filter((option) => option.isDisabled).map((option) => option.intId);
    }

    const checkedIdsParsed = parseArrayNumberIntoString(checkArrayToParse);
    const uncheckedIdsParsed = parseArrayNumberIntoString(uncheckArrayToParse);

    const addingMode = checkedIdsParsed.length < uncheckedIdsParsed.length;

    const addingSymbol = addingMode ? '+' : '!';

    const filtersString = addingMode ? checkedIdsParsed : uncheckedIdsParsed;

    if (!addingMode && filtersString == '') return mainOptionName;

    return mainOptionName + '@' + addingSymbol + filtersString;
  }
}
