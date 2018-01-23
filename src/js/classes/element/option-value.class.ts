import { AppModule } from "../../app.module";
import { Category, Option, CategoryValue} from "../classes";

import { App } from "../../gogocarto";

export class OptionValue
{
	optionId : any;
	index : number;
	description : string;
	option_ : Option = null;
	isFilledByFilters : boolean = true;

	children : CategoryValue[] = [];
	colorOptionId : number = null;

	constructor($optionValueJson, $key = 0)
	{
		// console.log("value json", $optionValueJson);
		
		// in case of compact json, the options values are stored in simple array
		if (typeof $optionValueJson == 'number' || typeof $optionValueJson == 'string')
		{
			// console.log("number")
			this.optionId = $optionValueJson;
			this.index = $key;
			this.description = '';
		}
		else if (Array.isArray($optionValueJson) && $optionValueJson.length >= 2)
		{
			// console.log("array")
			this.optionId = $optionValueJson[0];
			this.index = $optionValueJson[1];
			this.description = $optionValueJson.length == 3 ?  $optionValueJson[2] : '';
		}
		// in fully json representation, there are keys
		else if (typeof $optionValueJson == 'object')
		{
			// console.log("object")
			this.optionId = parseInt($optionValueJson.optionId);
			this.index = $optionValueJson.index;
			this.description = $optionValueJson.description || '';
		}		
	}

	get option() : Option
	{
		if (this.option_) return this.option_;
		return this.option_ = App.taxonomyModule.getOptionById(this.optionId);
	}

	setRecursivelyFilledByFilters(bool : boolean)
	{
		this.isFilledByFilters = bool;
		for(let categoryValue of this.children)
		{
			for (let suboptionValue of categoryValue.children)
			{
				suboptionValue.setRecursivelyFilledByFilters(bool);
			}
		}
	}

	get categoryOwner() : Category
	{
		return <Category> this.option.getOwner();
	}

	addCategoryValue(categoryValue : CategoryValue)
	{
		this.children.push(categoryValue);
	}
}

