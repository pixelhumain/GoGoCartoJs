import { AppModule, AppModes } from "../../app.module";
import { Option } from "../../classes/taxonomy/option.class";

import { App } from "../../gogocarto";
declare let $ : any;

export enum CategoryOptionTreeNodeType
{
	Option,
	Category
}

/**
* Class representating a Node in the Directory Menu Tree
*
* A CategoryOptionTreeNode can be a Category or an Option
*/
export class CategoryOptionTreeNode 
{
	id : any;
	name : string;

	children : CategoryOptionTreeNode[] = [];

	// is the node han't be touched for now, it's on it's first initialized state
	isPristine : boolean = true;

	ownerId : number = null;
	// main option Id, or "all"
	mainOwnerId : any = null;

	isChecked : boolean = true;
	isDisabled : boolean = false;	
	isActive : boolean = true;

	isMainOption : boolean = false;

	constructor(private TYPE : CategoryOptionTreeNodeType, private DOM_ID : string, private DOM_CHECKBOX_ID : string, private DOM_CHILDREN_CLASS : string) {};

	getDom() { return $(this.DOM_ID + this.id); }

	getDomCheckbox() { return $(this.DOM_CHECKBOX_ID + this.id); }

	getDomChildren() { return this.getDom().next(this.DOM_CHILDREN_CLASS);}

	getOwner() : CategoryOptionTreeNode 
	{ 
		if (this.TYPE == CategoryOptionTreeNodeType.Option)
			return App.taxonomyModule.getCategoryById(this.ownerId); 

		if (this.TYPE == CategoryOptionTreeNodeType.Category)
			return App.taxonomyModule.getOptionById(this.ownerId); 

		return null;
	}

	protected disabledChildren() : CategoryOptionTreeNode[] { return this.children.filter( child => child.isDisabled); }
	protected nonDisabledChildren() : CategoryOptionTreeNode[] { return this.children.filter( child => !child.isDisabled); }
	protected checkedChildren() : CategoryOptionTreeNode[] { return this.children.filter( child => child.isChecked); }

	isOption() { return this.TYPE == CategoryOptionTreeNodeType.Option }

	setChecked(bool : boolean)
	{
		this.isChecked = bool;
		this.getDomCheckbox().prop("checked", bool);
		this.isPristine = false;
	}

	setDisabled(bool : boolean)
	{
		this.isDisabled = bool;
		if (bool)
		{
			if (!this.getDom().hasClass('disabled')) this.getDom().addClass('disabled');
			this.setChecked(false);			
		}
		else
		{
			this.getDom().removeClass('disabled');
		}
		this.isPristine = false;
	}

	toggle(value : boolean = null, humanAction : boolean = true)
	{		
		let check;
		if (value != null) check = value;
		else check = !this.isChecked;

		if (this.isOption() && this.isPristine && humanAction)
		{
			this.recursivelyGetPristine(this).forEach( (node) => {
				node.toggle(false, false);
			});
			// force check to true, becasue in pristine mode input is unchecked but option class is checked and not disabled
			check = true;
		}			

		this.setChecked(check);
		this.setDisabled(!check);

		if (!this.isMainOption || !App.config.menu.showOnePanePerMainOption) 
		{
			for (let child of this.children) child.toggle(check, false);
		}

		if(humanAction)
		{
			if (this.getOwner()) this.getOwner().updateState();
			
			// delay the update so it's not freezing the UI
			setTimeout( () => {
				App.elementsModule.updateElementsToDisplay(check, true);
				App.historyModule.updateCurrState();
			},200);				
		}
	}

	toggleVisibility(value : boolean, recursive : boolean = false)
	{
		//console.log("toggle visibility ", value);
		this.isChecked = value;

		if (value) this.getDom().show();
		else { this.getDom().hide();}

		if (this.isMainOption)
		{
			$('#main-option-gogo-icon-' + this.id).toggle(value);
		}

		if (value && this.getOwner()) this.getOwner().toggleVisibility(true);

		if (recursive) for (let child of this.children) child.toggleVisibility(value, true);
	}

	updateState(propage = true)
	{
		if (this.isMainOption && App.config.menu.showOnePanePerMainOption) return;	

		if (this.children.length == 0) 
			this.setDisabled(!this.isChecked);
		else
		{
			let disabledChildrenCount = this.children.filter( (child : CategoryOptionTreeNode) => child.isDisabled).length;

			//console.log("Option " + this.name + " update state, nbre children disabled = ", disabledChildrenCount);

			if (disabledChildrenCount == this.children.length)
				this.setDisabled(true);	
			else
				this.setDisabled(false);

			let checkedChildrenCount = this.children.filter( (child : CategoryOptionTreeNode) => child.isChecked).length;
			if (checkedChildrenCount == this.children.length)
				this.setChecked(true);
			else
				this.setChecked(false)
		}		

		if (this.getOwner() && propage) this.getOwner().updateState();	
	}

	recursivelyUpdateStates()
	{
		for(let child of this.children)
		{
			child.recursivelyUpdateStates();
		}

		this.updateState();
	}

	isExpanded() : boolean { return this.getDom().hasClass('expanded'); }
	isUnexpandable() : boolean { return this.getDom().hasClass('unexpandable'); }

	toggleChildrenDetail()
	{
		if (this.isUnexpandable()) return;

		if (this.isExpanded())
		{
			this.getDomChildren().stop(true,false).slideUp({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
			this.getDom().removeClass('expanded');
		}
		else
		{
			this.getDomChildren().stop(true,false).slideDown({ duration: 350, easing: "easeOutQuart", queue: false, complete: function() {$(this).css('height', '');}});
			this.getDom().addClass('expanded');
		}
	}

	getSiblingsPristine() : CategoryOptionTreeNode[]
	{
		return this.getOwner().children.filter( (node) => node.isPristine && node.id != this.id); 
	}

	private recursivelyGetPristine(currOption : CategoryOptionTreeNode)
	{
		let resultNodes = [];
		resultNodes = resultNodes.concat(currOption.getSiblingsPristine());
		let parentOption = currOption.getOwner().getOwner();
		if (this.isMainOption || App.config.menu.showOnePanePerMainOption && parentOption.isMainOption) return resultNodes;
		else if (parentOption) resultNodes = resultNodes.concat(this.recursivelyGetPristine(parentOption));		

		return resultNodes;
	}
}