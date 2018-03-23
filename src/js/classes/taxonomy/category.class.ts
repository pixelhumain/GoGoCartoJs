import { AppModule, AppStates, AppModes } from "../../app.module";
import { Option } from "./option.class";
import { CategoryOptionTreeNode, CategoryOptionTreeNodeType } from "../../components/directory-menu/category-option-tree-node.class";

import { App } from "../../gogocarto";
declare let $ : any;

export class Category extends CategoryOptionTreeNode
{ 	
	showExpanded : boolean;
	enableDescription : boolean;
	displayCategoryName : boolean;
	unexpandable: boolean;
	isRootCategory: boolean = false;

	constructor($categoryJson : any)
	{
		super(CategoryOptionTreeNodeType.Category, '#category-', '#subcategorie-checkbox-', '.options-wrapper');

		this.id = $categoryJson.id;
		this.name = $categoryJson.name;
		this.enableDescription = $categoryJson.enableDescription || false;
		this.displayCategoryName = $categoryJson.displayCategoryName !== false && !!this.name;
		this.showExpanded = $categoryJson.showExpanded !== false;
		this.unexpandable = $categoryJson.unexpandable || false;
		this.mainOwnerId = $categoryJson.mainOwnerId || null;
		this.isActive = ('isActive' in $categoryJson) ? $categoryJson.isActive : $categoryJson.displayCategoryName !== false;
		this.isRootCategory = $categoryJson.isRootCategory;
	}

	addOption($option : Option) { this.children.push($option); }

	get options() : Option[] { return <Option[]> this.children; }

	get disabledOptions() : Option[] { return <Option[]> this.disabledChildren(); }
	get nonDisabledOptions() : Option[] { return <Option[]> this.nonDisabledChildren(); }
	get checkedOptions() : Option[] { return <Option[]> this.checkedChildren(); }
}
