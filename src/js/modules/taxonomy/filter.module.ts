import { Option, Category, Element, ElementModerationState, MenuFilter } from '../../classes/classes';
import { extendMoment } from 'moment-range';

import { App } from '../../gogocarto';
declare let $: any, moment;

moment = extendMoment(moment);

export class FilterModule {
  showOnlyFavorite_ = false;
  showOnlyPending_ = false;
  showOnlyModeration_ = false;

  constructor() {}

  showOnlyFavorite(bool: boolean) {
    this.showOnlyFavorite_ = bool;
  }

  showOnlyPending(bool: boolean) {
    this.showOnlyPending_ = bool;
  }

  showOnlyModeration(bool: boolean) {
    this.showOnlyModeration_ = bool;
  }

  checkIfElementPassFilters(element: Element): boolean {
    if (element.optionsValues.length == 0) return false;

    // FAVORITE, PENDING, MODERATION FILTERS
    if (this.showOnlyFavorite_) return element.isFavorite;
    if (
      this.showOnlyModeration_ &&
      (!element.needsModeration() || element.moderationState == ElementModerationState.PossibleDuplicate)
    )
      return false;
    if (App.config.isFeatureAvailable('pending')) {
      if (this.showOnlyPending_ && !element.isPending()) return false;
    } else {
      if (element.isPending()) return false;
    }

    // CUSTOM FILTERS (except taxonomy)
    for (const filter of App.config.menu.filters) {
      switch (filter.type) {
        case 'date':
          if (!this.filterDate(element, filter)) return false;
          break;
        case 'number':
          if (!this.filterNumber(element, filter)) return false;
          break;
      }
    }

    // TAXONOMY FILTER (at the end because it is the most costly operation)
    if (App.config.menu.filters.some((filter) => filter.type == 'taxonomy')) return this.filterTaxonomy(element);
    else return true;
  }

  private filterDate(element: Element, filter: MenuFilter): boolean {
    const filterValue = filter.currentValue;
    const elementDate = moment(element.data[filter.field]);
    let elementRange = null;
    if (filter.options.fieldEnd) {
      const elementEndDate = moment(element.data[filter.options.fieldEnd]);
      elementRange = moment.range(elementDate.startOf('day'), elementEndDate.endOf('day'));
    } else {
      elementRange = moment.range(elementDate.clone().startOf('day'), elementDate.clone().endOf('day'));
    }
    let targetRange = null;
    // Handle 3 digits years like 121 which actually equals to 2021
    if (filterValue.year && filterValue.year < 200) {
      filterValue.year = filterValue.year - 100 + 2000
    }
    // Empty filter
    if (!filterValue || Object.keys(filterValue).length === 0) return true;
    // Empty value
    else if (!elementDate) return false;    
    // RANGE
    else if (filterValue.startDate && filterValue.endDate)
      targetRange = moment.range(moment(filterValue.startDate).startOf('day'), moment(filterValue.endDate).endOf('day'))
    // DATES
    else if (filterValue.dates) {
      if (filterValue.dates.length == 0) return true;
      console.log(filterValue.dates)
      return filterValue.dates.some((date) => {
        return elementRange.overlaps(moment.range(moment(date).startOf('day'), moment(date).endOf('day')))
      });
    }
    // MONTH
    else if (filterValue.month !== undefined && filterValue.year)
      targetRange = moment.range(
        moment().month(filterValue.month).year(filterValue.year).startOf('month'),
        moment().month(filterValue.month).year(filterValue.year).endOf('month')
      )
    // YEAR
    else if (filterValue.year) 
      targetRange = moment.range(
        moment().year(filterValue.year).startOf('year'),
        moment().year(filterValue.year).endOf('year')
      )
    else 
      return true;
    
    return targetRange ? targetRange.overlaps(elementRange) : true
  }

  private filterNumber(element: Element, filter: MenuFilter): boolean {
    const filterValue = filter.currentValue;
    const elementValue = parseFloat(element.data[filter.field]);
    // Empty filter
    if (!filterValue || Object.keys(filterValue).length === 0) return true;
    // Empty value
    else if (!elementValue) return false;
    else if (filterValue.value != undefined) return elementValue == filterValue.value;
    if (filterValue.min != undefined && filterValue.max != undefined)
      return elementValue <= filterValue.max && elementValue >= filterValue.min;
    return true;
  }

  log = false;

  private filterTaxonomy(element: Element) {
    if (!App.config.menu.showOnePanePerMainOption) {
      const checkedMainOptions = App.taxonomyModule.taxonomy.nonDisabledOptions;
      if (checkedMainOptions.length == 1) return this.recursivelyCheckInOption(checkedMainOptions[0], element);
      else
        return checkedMainOptions.some(
          (mainOption) => element.haveOption(mainOption) || this.recursivelyCheckInOption(mainOption, element)
        );
    } else if (App.currMainId == 'all') {
      const mainOptionsChecked = App.taxonomyModule.getMainOptions().filter((child) => !child.isDisabled);
      const mainCategoryFilled = mainOptionsChecked.some((mainOption) => element.haveOption(mainOption));
      const otherCategoriesFilled = App.taxonomyModule.otherRootCategories.every((category) =>
        this.recursivelyCheckInCategory(category, element)
      );
      return mainCategoryFilled && otherCategoriesFilled;
    } else {
      const mainOption = App.taxonomyModule.getCurrMainOption();
      const mainOptionFilled = this.recursivelyCheckInOption(mainOption, element);
      const otherCategoriesFilled = App.taxonomyModule.otherRootCategories.every((category) =>
        this.recursivelyCheckInCategory(category, element)
      );
      return mainOptionFilled && otherCategoriesFilled;
    }
  }

  private recursivelyCheckInOption(option: Option, element: Element): boolean {
    if (this.log) console.log('Check for option ', option.name);

    let result;
    if (option.subcategories.length == 0 || (option.isDisabled && !option.isMainOption)) {
      if (this.log) console.log('No subcategories ');
      result = option.isChecked && element.haveOption(option);
    } else {
      result = option.subcategories.every((category) => this.recursivelyCheckInCategory(category, element));
    }
    if (this.log) console.log('Return ', result);
    return result;
  }

  private recursivelyCheckInCategory(category: Category, element: Element): boolean {
    if (this.log) console.log('--' + 'Category', category.name);

    if (!category.useForFiltering) return true;
    if (category.isDisabled && !category.isMandatory) return true;
    const checkedOptions = category.checkedOptions;
    let elementOptions = element.getOptionValueByCategoryId(category.id);
    if (App.config.menu.showOnePanePerMainOption)
      elementOptions = elementOptions.filter((optValue) => optValue.optionId != App.currMainId);

    // if this element don't have any option in this category, don't need to check
    if (elementOptions.length == 0 && this.log)
      console.log('--' + "Element don't have options in this category. Catgeoyr mandatory ? ", category.isMandatory);
    if (elementOptions.length == 0) return !category.isMandatory && category.isChecked;

    const isSomeOptionInCategoryCheckedOptions = elementOptions.some(
      (optionValue) => checkedOptions.indexOf(optionValue.option) > -1
    );

    if (this.log) console.log('--' + 'isSomeOptionInCategoryCheckedOptions', isSomeOptionInCategoryCheckedOptions);
    if (isSomeOptionInCategoryCheckedOptions) return true;
    else {
      if (this.log) console.log('--' + 'So we checked in suboptions', category.name);
      return elementOptions.some((optionValue) => this.recursivelyCheckInOption(optionValue.option, element));
    }
  }
}
