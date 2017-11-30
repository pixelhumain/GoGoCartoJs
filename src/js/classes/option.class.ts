import { AppModule, AppStates, AppModes } from "../app.module";
import { Category } from "../classes/category.class";
import { CategoryOptionTreeNode, CategoryOptionTreeNodeType } from "./category-option-tree-node.class";

import { App } from "../gogocarto";
declare let $ : any;

export class Option extends CategoryOptionTreeNode
{ 
	id : number;
	nameShort: string;
	index : number;
	color : string;
	softColor : string;
	icon : string;
	useIconForMarker: boolean;
	useColorForMarker : boolean;
	showOpenHours : boolean;	
	displayOption : number;
	
	private myOwnerColorId : number = null;


	constructor($optionJson : any)
	{
		super(CategoryOptionTreeNodeType.Option, '#option-', '#option-checkbox-', '.subcategories-wrapper');

		this.id = $optionJson.id;
		this.name = $optionJson.name;
		this.index = $optionJson.index;
		this.nameShort = $optionJson.nameShort;
		this.color = $optionJson.color;
		this.softColor = $optionJson.softColor;
		this.icon = $optionJson.icon;
		this.useIconForMarker = $optionJson.useIconForMarker;
		this.useColorForMarker = $optionJson.useColorForMarker;
		this.showOpenHours = $optionJson.showOpenHours;
		this.displayOption = $optionJson.displayOption;
		this.isActive = $optionJson.displayOption;
	}

	addCategory($category : Category) { this.children.push($category);  }

	isMainOption() { return this.getOwner() ? (<Category>this.getOwner()).depth == 0 : false; }

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