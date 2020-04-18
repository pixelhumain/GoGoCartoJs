import { Element, OptionValue } from '../../classes/classes';
import { capitalize } from '../../utils/string-helpers';
import { App } from '../../gogocarto';

export class ElementIconsModule {
  updateIconsToDisplay(element: Element) {
    this.checkForDisabledOptionValues(element);

    if (App.currMainId == 'all')
      element.iconsToDisplay = this.recursivelySearchIconsToDisplay(
        element.getOptionTree(),
        !App.config.menu.showOnePanePerMainOption
      );
    else element.iconsToDisplay = this.recursivelySearchIconsToDisplay(element.getCurrMainOptionValue());

    // in case of no OptionValue in this mainOption, we display the mainOption Icon
    if (element.iconsToDisplay.length == 0) {
      element.iconsToDisplay.push(element.getCurrMainOptionValue());
    }

    element.iconsToDisplay.sort((a, b) => {
      if (a.isFilledByFilters < b.isFilledByFilters) return 1;
      else if (a.isFilledByFilters > b.isFilledByFilters) return -1;
      else return a.index < b.index ? -1 : 1;
    });
    // console.log("Update element icons to display", element.iconsToDisplay, element);
  }

  private recursivelySearchIconsToDisplay(parentOptionValue: OptionValue, recursive = true): OptionValue[] {
    if (!parentOptionValue) return [];

    let resultOptions: OptionValue[] = [];
    for (const categoryValue of parentOptionValue.children) {
      for (const optionValue of categoryValue.children) {
        let result = [];
        if (recursive || optionValue.optionId == 'RootFakeOption') {
          result = this.recursivelySearchIconsToDisplay(optionValue, recursive) || [];
          resultOptions = resultOptions.concat(result);
        }

        if (result.length == 0 && optionValue.option.useIconForMarker) {
          resultOptions.push(optionValue);
        }
      }
    }

    return resultOptions;
  }

  private checkForDisabledOptionValues(element: Element) {
    this.recursivelyCheckForDisabledOptionValues(element.getOptionTree());
  }

  private recursivelyCheckForDisabledOptionValues(optionValue: OptionValue) {
    let isEveryCategoryContainsOneOptionNotdisabled = true;
    // console.log("checkForDisabledOptionValue : ", optionValue);

    for (const categoryValue of optionValue.children) {
      let isSomeOptionNotdisabled = false;
      for (const suboptionValue of categoryValue.children) {
        if (suboptionValue.children.length == 0) {
          // console.log("bottom option " + suboptionValue.option.name,suboptionValue.option.isChecked );
          suboptionValue.isFilledByFilters = !suboptionValue.option.isDisabled;
        } else {
          this.recursivelyCheckForDisabledOptionValues(suboptionValue);
        }
        if (suboptionValue.isFilledByFilters) isSomeOptionNotdisabled = true;
      }
      if (!isSomeOptionNotdisabled) isEveryCategoryContainsOneOptionNotdisabled = false;
      // console.log("CategoryValue " + categoryValue.category.name + "isSomeOptionNotdisabled", isSomeOptionNotdisabled);
    }

    if (optionValue.option) {
      // console.log("OptionValue " + optionValue.option.name + " : isEveryCategoyrContainOnOption", isEveryCategoryContainsOneOptionNotdisabled );
      optionValue.isFilledByFilters = isEveryCategoryContainsOneOptionNotdisabled;
      if (!optionValue.isFilledByFilters) optionValue.setRecursivelyFilledByFilters(optionValue.isFilledByFilters);
    }
  }
}
