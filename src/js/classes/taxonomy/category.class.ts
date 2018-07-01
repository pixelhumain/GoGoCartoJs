import { AppModule, AppStates, AppModes } from "../../app.module";
import { Option } from "./option.class";
import { CategoryOptionTreeNode, CategoryOptionTreeNodeType } from "../../components/directory-menu/category-option-tree-node.class";
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";
declare let $ : any;

export class Category extends CategoryOptionTreeNode
{ 
	enableDescription : boolean;
	displaySuboptionsInline : boolean;

	isRootCategory: boolean = false;

	constructor($categoryJson : any)
	{
		super(CategoryOptionTreeNodeType.Category, '#category-', '#subcategorie-checkbox-', '.options-wrapper');

		this.id = $categoryJson.id;
		this.name = capitalize($categoryJson.name || "");
		this.nameShort = capitalize($categoryJson.nameShort || this.name);

		this.isRootCategory = $categoryJson.isRootCategory;

		this.displayInMenu = ($categoryJson.displayInMenu !== false) && this.name != "";
		this.displayInInfoBar = ($categoryJson.displayInInfoBar || this.isRootCategory) && this.name != "";

		this.showExpanded = $categoryJson.showExpanded !== false;
		this.unexpandable = $categoryJson.unexpandable || false;
		
		this.enableDescription = $categoryJson.enableDescription || false;	
		this.displaySuboptionsInline = $categoryJson.displaySuboptionsInline || false;	

		this.mainOwnerId = $categoryJson.mainOwnerId || null;
	}

	addOption($option : Option) { this.children.push($option); }

	get options() : Option[] { return <Option[]> this.children; }

	get disabledOptions() : Option[] { return <Option[]> this.disabledChildren(); }
	get nonDisabledOptions() : Option[] { return <Option[]> this.nonDisabledChildren(); }
	get checkedOptions() : Option[] { return <Option[]> this.checkedChildren(); }
}
