import { AppModule, AppStates, AppModes } from "../../app.module";
import { Option } from "./option.class";
import { CategoryOptionTreeNode, CategoryOptionTreeNodeType } from "../../components/directory-menu/category-option-tree-node.class";

import { App } from "../../gogocarto";
declare let $ : any;

export class Category extends CategoryOptionTreeNode
{ 	
	index: number;
	singleOption : boolean;
	enableDescription : boolean;
	displayCategoryName : boolean;

	constructor($categoryJson : any)
	{
		super(CategoryOptionTreeNodeType.Category, '#category-', '#subcategorie-checkbox-', '.options-wrapper');

		this.id = $categoryJson.id || 0;
		this.name = $categoryJson.name || 'catégorie';
		this.index = $categoryJson.index || 0;
		this.singleOption = $categoryJson.singleOption || false;
		this.enableDescription = $categoryJson.enableDescription || false;
		this.displayCategoryName = $categoryJson.displayCategoryName || false;
		this.depth = $categoryJson.depth || 0;
		this.mainOwnerId = $categoryJson.mainOwnerId || null;
		this.isActive = $categoryJson.displayCategoryName;
	}

	addOption($option : Option) { $option.depth = this.depth; this.children.push($option); }

	get options() : Option[] { return <Option[]> this.children; }

	get disabledOptions() : Option[] { return <Option[]> this.disabledChildren(); }

	get checkedOptions() : Option[] { return <Option[]> this.checkedChildren(); }
}