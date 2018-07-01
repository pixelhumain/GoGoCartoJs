import { AppModule, AppStates, AppModes } from "../../app.module";
import { Category } from "./category.class";
import { CategoryOptionTreeNode, CategoryOptionTreeNodeType } from "../../components/directory-menu/category-option-tree-node.class";

import { App } from "../../gogocarto";
declare let $ : any;

export class Option extends CategoryOptionTreeNode
{ 
	nameShort: string;
	color : string;
	softColor : string;
	icon : string;
	useIconForMarker: boolean;
	useColorForMarker : boolean;
	displayOption : boolean;
	showExpanded : boolean;
  textHelper : string;
  disableInInfoBar : boolean = false;
  
  intId : number; // And Id as number, used for creating the option url

	parentOptionIds : number[] = [];

	constructor($optionJson : any)
	{
		super(CategoryOptionTreeNodeType.Option, '#option-', '#option-checkbox-', '.subcategories-wrapper');

		this.name = $optionJson.name;
		this.nameShort = $optionJson.nameShort || this.name;
		this.id = ('id' in $optionJson) ? '' + $optionJson.id : this.nameShort;
		this.intId = typeof $optionJson.id == 'number' ? $optionJson.id : $optionJson.intId;
		this.color = $optionJson.color;
		this.softColor = $optionJson.softColor || this.color;
		this.icon = $optionJson.icon;
		this.textHelper = $optionJson.textHelper;
		this.useIconForMarker = ('useIconForMarker' in $optionJson) ? $optionJson.useIconForMarker : !!this.icon;
		this.useColorForMarker = ('useColorForMarker' in $optionJson) ? $optionJson.useColorForMarker : !!this.color;
		this.showExpanded = $optionJson.showExpanded || false;
		this.displayOption = $optionJson.displayOption !== false;
		this.isActive = ('isActive' in $optionJson) ? $optionJson.isActive : this.displayOption;
		if ($optionJson.disableInInfoBar) this.disableInInfoBar = $optionJson.disableInInfoBar;
	}

	addCategory($category : Category) { this.children.push($category);  }

	isCollapsible() : boolean { return this.getDom().hasClass('option-collapsible'); }

	get subcategories() : Category[] { return <Category[]> this.children; }

	get allChildrenOptions() : Option[]
	{
		return this.recursivelyGetChildrenOption(this);
	}

	private recursivelyGetChildrenOption(parentOption : Option) : Option[]
	{
		let resultOptions : Option[] = [];
		for(let cat of parentOption.subcategories)
		{
			resultOptions = resultOptions.concat(cat.options);
			for(let option of cat.options)
			{
				resultOptions = resultOptions.concat(this.recursivelyGetChildrenOption(option));
			}
		}
		return resultOptions;
	}
}