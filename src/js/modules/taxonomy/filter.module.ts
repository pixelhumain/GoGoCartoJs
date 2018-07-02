/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
import { Option, Element, ElementModerationState} from "../../classes/classes";

import { App } from "../../gogocarto";
declare var $ : any;

export class FilterModule
{
	showOnlyFavorite_ : boolean = false;
	showPending_ : boolean = true;
	showOnlyPending_ : boolean = false;
	showOnlyModeration_ : boolean = false;

	constructor() {	}

	showOnlyFavorite(bool : boolean) { this.showOnlyFavorite_ = bool; }

	showPending(bool : boolean) { this.showPending_ = bool; }

	showOnlyPending(bool : boolean) { this.showOnlyPending_ = bool; }

	showOnlyModeration(bool : boolean) { this.showOnlyModeration_ = bool; }

	checkIfElementPassFilters(element : Element) : boolean
	{
		if (element.optionsValues.length == 0) return false;

		if (this.showOnlyFavorite_) return element.isFavorite;

		if (this.showOnlyModeration_ && (!element.needsModeration() || element.moderationState == ElementModerationState.PossibleDuplicate)) return false;

		if (App.config.isFeatureAvailable('pending'))
		{
			if (this.showOnlyPending_) return element.isPending();

			if(!this.showPending_ && element.isPending()) return false;
		}
		else
		{
			if(element.isPending()) return false;
		}		

		if (!App.config.menu.showOnePanePerMainOption)
		{
			let checkedMainOptions = App.taxonomyModule.mainCategory.nonDisabledOptions;
			if (checkedMainOptions.length == 1)
				return this.recursivelyCheckedInOption(checkedMainOptions[0], element);
			else
				return checkedMainOptions.some( (mainOption) => element.haveOption(mainOption) || this.recursivelyCheckedInOption(mainOption, element));
		}
		else if (App.currMainId == 'all')
		{
			let elementOptions = element.getOptionValueByCategoryId( App.taxonomyModule.mainCategory.id);
			let checkedOptions = App.taxonomyModule.mainCategory.checkedOptions;

			// console.log("\nelementsOptions", elementOptions.map( (value) => value.option.name));
			// console.log("checkedOptions", checkedOptions.map( (value) => value.name));

			let result = elementOptions.some(optionValue => checkedOptions.indexOf(optionValue.option) > -1);
			return result ;
		}
		else
		{
			let mainOption = App.taxonomyModule.getCurrMainOption();			
			let isPassingFilters = this.recursivelyCheckedInOption(mainOption, element);			
			return isPassingFilters;
		}		
	}

	private recursivelyCheckedInOption(option : Option, element : Element) : boolean
	{
		let log = false;

		if (log) console.log( "Check for option ", option.name);

		let result;
		if (option.subcategories.length == 0 || (option.isDisabled && !option.isMainOption) )
		{
			if (log) console.log( "No subcategories ");
			result = option.isChecked && element.haveOption(option);
		}
		else
		{
			result = option.subcategories.every( (category) =>
			{
				if (log) console.log("--" + "Category", category.name);

				if (!category.useForFiltering) return true;
				let checkedOptions = category.checkedOptions;
				let elementOptions = element.getOptionValueByCategoryId(category.id).filter((optValue) => !optValue.option.isMainOption);

				// if this element don't have any option in this category, don't need to check
				if (elementOptions.length == 0 && log) console.log("--" + "Element don't have options in this category");
				if (elementOptions.length == 0) return !category.isMandatory;

				let isSomeOptionInCategoryCheckedOptions = elementOptions.some(optionValue => checkedOptions.indexOf(optionValue.option) > -1); 

				if (log) console.log("--" + "isSomeOptionInCategoryCheckedOptions", isSomeOptionInCategoryCheckedOptions);
				if (isSomeOptionInCategoryCheckedOptions)
					return true;
				else
				{				
					if (log) console.log("--" + "So we checked in suboptions", category.name);
					return elementOptions.some( (optionValue) => this.recursivelyCheckedInOption(optionValue.option, element));
				}
			});
		}
		if (log) console.log("Return ", result);
		return result;
	}
}