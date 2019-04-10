import { AppModule, AppStates, AppModes } from "../../app.module";
import { Option, Category } from "../../classes/classes";
export { Option, Category } from "../../classes/classes";
import { slugify } from '../../utils/string-helpers';
import { App } from "../../gogocarto";
declare let $ : any;

export class TaxonomyModule
{
	categories : Category[] = [];
	options : Option[] = [];

	// the full hierachic taxonomy
	taxonomy : Category;
	
	rootCategories : Category[];

	categoriesCreatedCount : number = 1;
	optionsCreatedCount : number = 1;

	constructor() 
	{
		this.options = [];
		this.categories = [];
	}

	createTaxonomyFromJson(taxonomyJson)
	{
		let isSkosTaxonomy = taxonomyJson['@graph'];
		if (isSkosTaxonomy) taxonomyJson = App.taxonomySkosModule.convertSkosIntoGoGoTaxonomy(taxonomyJson);
		
		if (Array.isArray(taxonomyJson) && taxonomyJson.length == 1) taxonomyJson = taxonomyJson[0];
		
		// If multiple root categories, we encapsulate them into a single fake category & root option
		if (Array.isArray(taxonomyJson) && taxonomyJson.length > 1) {
			for (let json of taxonomyJson) json.isRootCategory = true;
			taxonomyJson = {
				"name": "RootFakeCategory",
	      "options":[    
	        {
	          "name":"RootFakeOption",
	          "displayInInfoBar": false,
	          "displayInMenu": false,
	          "showExpanded": true,
	          "subcategories": taxonomyJson
	        }
	      ]
	    };	    
		}
		else if (!isSkosTaxonomy) taxonomyJson.isRootCategory = true;

		this.taxonomy = this.recursivelyCreateCategoryAndOptions(taxonomyJson);
		this.rootCategories =  this.taxonomy.name == "RootFakeCategory" ? this.taxonomy.options[0].subcategories : [this.taxonomy];
		for(let option of this.mainCategory.children) option.isMainOption = true;
		
		if (this.rootCategories.length > 1)
			for(let rootCategory of this.rootCategories) this.recursivelyCalculateParentsOptionIds(rootCategory, this.taxonomy.options[0]);
		else
			this.recursivelyCalculateParentsOptionIds(this.mainCategory);
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
			this.recursivelyCreateOption({subcategories: categoryJson.subcategories, showExpanded: true, displayInMenu: false, displayInInfoBar: false}, category)

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
			if (option.isMainOption || parentOption === null) option.mainOwnerId = "all";
			else if (parentOption.isMainOption || (!parentOption.mainOwnerId && parentOption.id != "Racine")) option.mainOwnerId = parentOption.id;
			else option.mainOwnerId = parentOption.mainOwnerId;
			
			if (parentOption) (<Option>option).parentOptionIds = parentOption.parentOptionIds.concat([parentOption.id]);

			for(let subcategory of option.children)
			{				
				this.recursivelyCalculateParentsOptionIds(<Category>subcategory, <Option>option);
			}			
		}
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
		return this.getMainOptions().map( (option) => option.id);
	}

	getCurrMainOption() : Option
	{
		return App.currMainId == 'all' ? null : this.getMainOptionById(App.currMainId);
	}

	getMainOptionBySlug($slug) : Option
	{
		return this.getMainOptions().filter( (option : Option) => slugify(option.nameShort) == $slug).shift();
	}

	getMainOptionById ($id) : Option
	{
		return this.getMainOptions().filter( (option : Option) => option.id == $id).shift();
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

	getRootCategories() : Category[]
	{
		return this.categories.filter( (category : Category) => category.isRootCategory);
	}

	// the main category : i.e. the first root category (could have many root categories) 
	get mainCategory() { return this.rootCategories[0]; }
	get otherRootCategories() { return this.rootCategories.slice(1); }
}