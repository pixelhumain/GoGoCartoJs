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
	defaultOpenHoursCategory : Category = new Category({ name: "Horaires d'ouverture"});

	openHoursFiltersDays : string[] = [];

	categoriesCreatedCount : number = 1;
	optionsCreatedCount : number = 1;

	constructor() 
	{
		this.options = [];
		this.categories = [];
	}

	createTaxonomyFromJson(mainCatgeoryJson, openHoursCategoryJson)
	{
		if (mainCatgeoryJson['@graph']) mainCatgeoryJson = App.taxonomySkosModule.convertSkosIntoGoGoTaxonomy(mainCatgeoryJson);

		this.mainCategory = this.recursivelyCreateCategoryAndOptions(mainCatgeoryJson);		

		for(let option of this.mainCategory.children) option.isMainOption = true;

		this.recursivelyCalculateParentsOptionIds(this.mainCategory);

		// console.log(this.mainCategory);
	
		// not using openHours for now
		// openHoursCategoryJson = openHoursCategoryJson || this.defaultOpenHoursCategory;
		// this.openHoursCategory = this.recursivelyCreateCategoryAndOptions(openHoursCategoryJson);
		// this.updateOpenHoursFilter();
	}	

	private recursivelyCreateCategoryAndOptions(categoryJson : any) : Category
	{
		return this.recursivelyCreateCategory(categoryJson);
	}

	private recursivelyCreateCategory(categoryJson : any) : Category
	{
		if (!categoryJson.id) categoryJson.id = this.categoriesCreatedCount++;
		
		let category = new Category(categoryJson);

		if (categoryJson.options)
			for(let optionJson of categoryJson.options) this.recursivelyCreateOption(optionJson, category)
		else if (categoryJson.subcategories)
			this.recursivelyCreateOption({subcategories: categoryJson.subcategories, showExpanded: true, displayOption: false}, category)

		this.categories.push(category);

		return category;
	}

	private recursivelyCreateOption(optionJson : any, parentCatgeory : Category)
	{
		optionJson.intId = this.optionsCreatedCount++;
		let option = new Option(optionJson);
		option.ownerId = parentCatgeory.id;

		if (optionJson.subcategories)
			for(let subcategoryJson of optionJson.subcategories)
			{				
				let subcategory = this.recursivelyCreateCategoryAndOptions(subcategoryJson);
				subcategory.ownerId = option.id;
				option.addCategory(subcategory);
			}
		else if (optionJson.suboptions)
		{
			let subcategory = this.recursivelyCreateCategoryAndOptions({options: optionJson.suboptions, showExpanded: optionJson.showExpanded});
			subcategory.ownerId = option.id;
			option.addCategory(subcategory);
		}

		parentCatgeory.addOption(option);	
		this.options.push(option);	
	}

	// We want every option to know all those parents Option ids
	// this method calculate those for all options
	private recursivelyCalculateParentsOptionIds(category: Category, parentOption : Option = null)
	{
		for(let option of category.children)
		{
			if (option.isMainOption) option.mainOwnerId = "all";
			else if (parentOption.isMainOption) option.mainOwnerId = parentOption.id;
			else option.mainOwnerId = parentOption.mainOwnerId;

			if (parentOption) (<Option>option).parentOptionIds = parentOption.parentOptionIds.concat([parentOption.id]);

			for(let subcategory of option.children)
			{				
				this.recursivelyCalculateParentsOptionIds(<Category>subcategory, <Option>option);
			}			
		}
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

	getOptionByIntId ($id) : Option
	{
		return this.options.filter( (option : Option) => option.intId == $id).shift();
	};

	getCurrOptions() : Option[]
	{
		return this.options.filter( (option : Option) => option.mainOwnerId == App.currMainId);
	}
}