import { Element, OptionValue } from '../../classes/classes'; 
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";

export class ElementIconsModule
{
  updateIconsToDisplay(element : Element) 
  {    
    this.checkForDisabledOptionValues(element);

    if (App.currMainId == 'all')
      element.iconsToDisplay = this.recursivelySearchIconsToDisplay(element.getOptionTree(), false);
    else
      element.iconsToDisplay = this.recursivelySearchIconsToDisplay(element.getCurrMainOptionValue());

    // in case of no OptionValue in this mainOption, we display the mainOption Icon
    if (element.iconsToDisplay.length == 0)
    {
      element.iconsToDisplay.push(element.getCurrMainOptionValue());
    }
    
    //console.log("Icons to display sorted", this.getIconsToDisplay());
  }

  private recursivelySearchIconsToDisplay(parentOptionValue : OptionValue, recursive : boolean = true) : OptionValue[]
  {
    if (!parentOptionValue) return [];

    let resultOptions : OptionValue[] = [];    

    for(let categoryValue of parentOptionValue.children)
    {
      for(let optionValue of categoryValue.children)
      {
        let result = [];
        
        if (recursive)
        {
          result = this.recursivelySearchIconsToDisplay(optionValue) || [];
          resultOptions = resultOptions.concat(result);
        }

        if (result.length == 0 && optionValue.option.useIconForMarker)
        {
          resultOptions.push(optionValue);
        }
      }
    }
    return resultOptions;
  }

  private checkForDisabledOptionValues(element : Element)
  {
    this.recursivelyCheckForDisabledOptionValues(element.getOptionTree(), App.currMainId == 'all');
  }

  private recursivelyCheckForDisabledOptionValues(optionValue : OptionValue, noRecursive : boolean = true)
  {
    let isEveryCategoryContainsOneOptionNotdisabled = true;
    //console.log("checkForDisabledOptionValue Norecursive : " + noRecursive, optionValue);

    for(let categoryValue of optionValue.children)
    {
      let isSomeOptionNotdisabled = false;
      for (let suboptionValue of categoryValue.children)
      {
        if (suboptionValue.children.length == 0 || noRecursive)
        {
          //console.log("bottom option " + suboptionValue.option.name,suboptionValue.option.isChecked );
          suboptionValue.isFilledByFilters = suboptionValue.option.isChecked;          
        }
        else
        {
          this.recursivelyCheckForDisabledOptionValues(suboptionValue, noRecursive);
        }
        if (suboptionValue.isFilledByFilters) isSomeOptionNotdisabled = true;
      }
      if (!isSomeOptionNotdisabled) isEveryCategoryContainsOneOptionNotdisabled = false;
      //console.log("CategoryValue " + categoryValue.category.name + "isSomeOptionNotdisabled", isSomeOptionNotdisabled);
    }

    if (optionValue.option)
    {
      //console.log("OptionValue " + optionValue.option.name + " : isEveryCategoyrContainOnOption", isEveryCategoryContainsOneOptionNotdisabled );
      optionValue.isFilledByFilters = isEveryCategoryContainsOneOptionNotdisabled;
      if (!optionValue.isFilledByFilters) optionValue.setRecursivelyFilledByFilters(optionValue.isFilledByFilters);
    }
  }
}