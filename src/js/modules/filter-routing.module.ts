/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

import { App } from "../gogocarto";
import { parseArrayNumberIntoString, parseStringIntoArrayNumber } from "../utils/parser-string-number";

declare var $ : any;

export class FilterRoutingModule
{
	loadFiltersFromString(string : string)
	{
		let splited = string.split('@');
		let mainOptionSlug = splited[0];

		let mainOptionId;
		if (mainOptionSlug == 'all') mainOptionId = 'all';
		else
		{
			let mainOption = App.categoryModule.getMainOptionBySlug(mainOptionSlug);
			mainOptionId = mainOption ? mainOption.id : 'all';
		} 
		App.filtersComponent.setMainOption(mainOptionId);		

		let filtersString : string;
		let addingMode : boolean;

		if (splited.length == 2)
		{
			filtersString = splited[1];

			if (filtersString[0] == '!') addingMode = false;
			else addingMode = true;

			filtersString = filtersString.substring(1);
		}
		else if (splited.length > 2)
		{
			console.error("Error spliting in loadFilterFromString");
		}

		let filters = parseStringIntoArrayNumber(filtersString);

		//console.log('filters', filters);		
		if (!App.loadFullTaxonomy && mainOptionSlug != 'all') $('.main-categories').hide();	

		if (filters.length > 0)
		{
			// console.log('addingMode', addingMode);
			
			if (mainOptionSlug == 'all')
			{
				if (App.loadFullTaxonomy) App.categoryModule.mainCategory.toggle(!addingMode, false);
				else
				{
					for(let option of App.categoryModule.mainCategory.options) 
					{
						option.toggleVisibility(!addingMode);
					}
				}
			}
			else
			{
				for (let cat of App.categoryModule.getMainOptionBySlug(mainOptionSlug).subcategories)
					for(let option of cat.options) 
					{
						if (App.loadFullTaxonomy) option.toggle(!addingMode, false, -10); // seting originDepth to -10 to avoid stoping propagation
						else option.toggleVisibility(!addingMode, true);
					}
			}

			for(let filterId of filters)
			{
				let option = App.categoryModule.getOptionById(filterId);
				if (!option) console.log("Error loadings filters : " + filterId);
				else 
				{
					if (App.loadFullTaxonomy)  option.toggle(addingMode, false);
					if (!App.loadFullTaxonomy) option.toggleVisibility(addingMode);
				}
			}

			if (App.loadFullTaxonomy)
			{
				if (mainOptionSlug == 'all') App.categoryModule.mainCategory.updateState();
				else App.categoryModule.getMainOptionBySlug(mainOptionSlug).recursivelyUpdateStates();
			}

			App.elementModule.updateElementsToDisplay(true);
			//App.historyModule.updateCurrState();
		}
	}

	getFiltersToString() : string
	{
		let mainOptionId = App.currMainId;

		let mainOptionName;
		let checkArrayToParse, uncheckArrayToParse;
		
		if (mainOptionId == 'all')
		{			
			mainOptionName = "all";
			checkArrayToParse = App.categoryModule.mainCategory.checkedOptions.map( (option) => option.id);
			uncheckArrayToParse = App.categoryModule.mainCategory.disabledOptions.map( (option) => option.id);
		}
		else
		{
			let mainOption = App.categoryModule.getMainOptionById(mainOptionId);
			mainOptionName = mainOption.nameShort;

			let allOptions = mainOption.allChildrenOptions;

			checkArrayToParse = allOptions.filter( (option) => option.isChecked ).map( (option) => option.id);
			uncheckArrayToParse = allOptions.filter( (option) => option.isDisabled ).map( (option) => option.id);

			if (mainOption.showOpenHours) 
			{
				checkArrayToParse = checkArrayToParse.concat(App.categoryModule.openHoursCategory.checkedOptions.map( (option) => option.id));
				uncheckArrayToParse = uncheckArrayToParse.concat(App.categoryModule.openHoursCategory.disabledOptions.map( (option) => option.id));
			}
		}

		let checkedIdsParsed = parseArrayNumberIntoString(checkArrayToParse);
		let uncheckedIdsParsed = parseArrayNumberIntoString(uncheckArrayToParse);

		let addingMode = (checkedIdsParsed.length < uncheckedIdsParsed.length);

		let addingSymbol = addingMode ? '+' : '!';

		let filtersString = addingMode ? checkedIdsParsed : uncheckedIdsParsed;

		if (!addingMode && filtersString == "" ) return mainOptionName;

		return mainOptionName + '@' + addingSymbol + filtersString;
	}
}