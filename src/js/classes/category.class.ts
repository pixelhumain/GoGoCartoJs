import { AppModule, AppStates, AppModes } from "../app.module";
import { Option } from "../classes/option.class";
import { CategoryOptionTreeNode, CategoryOptionTreeNodeType } from "./category-option-tree-node.class";

import { App } from "../gogocarto";
declare let $ : any;

export class Category extends CategoryOptionTreeNode
{ 
	name : string;
	index: number;
	singleOption : boolean;
	enableDescription : boolean;
	displayCategoryName : boolean;
	depth : number;

	constructor($categoryJson : any)
	{
		super(CategoryOptionTreeNodeType.Category, '#category-', '#subcategorie-checkbox-', '.options-wrapper');

		this.id = $categoryJson.id;
		this.name = $categoryJson.name;
		this.index = $categoryJson.index;
		this.singleOption = $categoryJson.singleOption;
		this.enableDescription = $categoryJson.enableDescription;
		this.displayCategoryName = $categoryJson.displayCategoryName;
		this.depth = $categoryJson.depth;
		this.mainOwnerId = $categoryJson.mainOwnerId;
	}

	addOption($option : Option) { this.children.push($option); }

	get options() : Option[] { return <Option[]> this.children; }

	get disabledOptions() : Option[] { return <Option[]> this.disabledChildren(); }

	get checkedOptions() : Option[] { return <Option[]> this.checkedChildren(); }
}
