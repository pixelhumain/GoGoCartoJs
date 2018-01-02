/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

import { AppModule, AppStates, AppModes } from "../../app.module";
import { Option, Category } from "../../classes/classes";
export { Option, Category } from "../../classes/classes";
import { App } from "../../gogocarto";
declare let $ : any;


export class TaxonomyModule
{
	categories : Category[] = [];
	options : Option[] = [];

	mainCategory : Category;
	openHoursCategory : Category;
	defaultOpenHoursCategory : Category = new Category({ name: "Horaires d'ouverture", depth: '-1'});

	openHoursFiltersDays : string[] = [];

	constructor() 
	{
		this.options = [];
		this.categories = [];
	}

	createTaxonomyFromJson(mainCatgeoryJson, openHoursCategoryJson)
	{
		this.mainCategory = this.recursivelyCreateCategoryAndOptions(mainCatgeoryJson);
		openHoursCategoryJson = openHoursCategoryJson || this.defaultOpenHoursCategory;
		this.openHoursCategory = this.recursivelyCreateCategoryAndOptions(openHoursCategoryJson);

		this.updateOpenHoursFilter();
		//console.log(this.mainCategory);
	}

	private recursivelyCreateCategoryAndOptions(categoryJson : any) : Category
	{
		let category = new Category(categoryJson);

		for(let optionJson of categoryJson.options)
		{
			let option = new Option(optionJson);
			option.ownerId = categoryJson.id;
			option.depth = category.depth;

			if (category.depth == 0) option.mainOwnerId = "all";
			else if (category.depth == -1) option.mainOwnerId = "openhours";
			else option.mainOwnerId = category.mainOwnerId;

			for(let subcategoryJson of optionJson.subcategories)
			{				
				if (category.depth <= 0) subcategoryJson.mainOwnerId = option.id;
				else subcategoryJson.mainOwnerId = option.mainOwnerId;

				let subcategory = this.recursivelyCreateCategoryAndOptions(subcategoryJson);
				subcategory.ownerId = option.id;				

				option.addCategory(subcategory);
			}

			category.addOption(option);	
			this.options.push(option);	
		}

		this.categories.push(category);

		return category;
	}

	updateOpenHoursFilter()
	{
		this.openHoursFiltersDays = [];
		let option : any;
		for(option of this.openHoursCategory.children)
		{
			if (option.isChecked) this.openHoursFiltersDays.push( option.name.toLowerCase());
		}
		//console.log("updateOpenHoursfilters", this.openHoursFiltersDays);
	}

	getMainOptions() : Option[]
	{
		return this.mainCategory.options;
	}

	getMainOptionsIdsWithAll() : any[]
	{
		let optionIds : any[] = this.getMainOptionsIds();
		optionIds.push("all");
		return optionIds;
	}

	getMainOptionsIds() : number[]
	{
		return this.mainCategory.options.map( (option) => option.id);
	}

	getCurrMainOption() : Option
	{
		return App.currMainId == 'all' ? null : this.getMainOptionById(App.currMainId);
	}

	getMainOptionBySlug($slug) : Option
	{
		return this.getMainOptions().filter( (option : Option) => option.nameShort == $slug).shift();
	}

	getMainOptionById ($id) : Option
	{
		return this.mainCategory.options.filter( (option : Option) => option.id == $id).shift();
	};

	getCategoryById ($id) : Category
	{
		return this.categories.filter( (category : Category) => category.id == $id).shift();
	};

	getOptionById ($id) : Option
	{
		return this.options.filter( (option : Option) => option.id == $id).shift();
	};

	getCurrOptions() : Option[]
	{
		return this.options.filter( (option : Option) => option.mainOwnerId == App.currMainId);
	}
}