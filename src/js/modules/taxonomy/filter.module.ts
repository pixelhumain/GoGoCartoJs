import { Option, Category, Element, ElementModerationState, MenuFilter } from '../../classes/classes';

import { App } from '../../gogocarto';
declare let $: any;

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
  }

  private filterDate(element: Element, filter: MenuFilter): boolean {
    const filterValue = filter.currentValue;
    const elementDate = this.parseDate(element.data[filter.field]);
    // Empty filter
    if (!filterValue || Object.keys(filterValue).length === 0) return true;
    // Empty value
    else if (!elementDate) return false;
    // RANGE
    else if (filterValue.startDate && filterValue.endDate)
      return (
        elementDate.getTime() <= this.parseDate(filterValue.endDate).getTime() &&
        elementDate.getTime() >= this.parseDate(filterValue.startDate).getTime()
      );
    // DATES
    else if (filterValue.dates)
      return (
        filterValue.dates.length == 0 ||
        filterValue.dates.some((date) => {
          return (
            date.getYear() == elementDate.getYear() &&
            date.getMonth() == elementDate.getMonth() &&
            date.getDate() == elementDate.getDate()
          );
        })
      );
    // MONTH
    else if (filterValue.month !== undefined && filterValue.year)
      return elementDate.getMonth() == filterValue.month && elementDate.getYear() == filterValue.year;
    // YEAR
    else if (filterValue.year) return elementDate.getYear() == filterValue.year;
    else return true;
  }

  private filterNumber(element: Element, filter: MenuFilter): boolean {
    const filterValue = filter.currentValue;
    const elementValue = element.data[filter.field];
    // Empty filter
    if (!filterValue || Object.keys(filterValue).length === 0) return true;
    // Empty value
    else if (!elementValue) return false;
    else if (filterValue.value != undefined) return elementValue == filterValue.value;
    if (filterValue.min != undefined && filterValue.max != undefined)
      return elementValue <= filterValue.max && elementValue >= filterValue.min;
    return true;
  }

  public parseDate(date) {
    let dateObject;
    if (typeof date == 'string') {
      // Convert "30/05/2012" to "2012-05-30"
      if (date.split('/').length == 3) {
        const splited = date.split('/');
        date = splited[2] + '-' + splited[1] + '-' + splited[0];
      }
      // Expect "2012-05-30" format
      dateObject = new Date(date);
    } else {
      dateObject = date;
    }
    return dateObject;
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
