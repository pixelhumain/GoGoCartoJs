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
import { ElementBase, ElementStatus, ElementModerationState } from './element-base.class';
export { ElementStatus, ElementModerationState } from './element-base.class';
import { Marker } from "../../components/map/marker.component";
import { ElementComponent } from "../../components/element/element.component";
import { OptionValue, CategoryValue, Option, Category, Contribution, VoteReport, Stamp } from "../classes";
import { capitalize } from "../../utils/string-helpers";

import { App } from "../../gogocarto";
declare var $, Map;

export class Element extends ElementBase
{	
	private marker_ : Marker = null;
	private component_ : ElementComponent = null;	

	colorOptionId : any;

	private isInitialized_ : boolean = false;

	iconsToDisplay : OptionValue[] = [];	

	distance : number;
	distanceFromBoundsCenter : number;	

	// for elements module algorithms
	isDisplayed : boolean = false;	

	isShownAlone : boolean = false;
	isFavorite : boolean = false;
	needToBeUpdatedWhenShown : boolean = true;

	constructor(elementJson : any)
  {
    super(elementJson);  
  }

  updateWithJson(elementJson)
  {
  	super.updateWithJson(elementJson);
  	this.createOptionsTree();
    this.update(true);
  }	

	initialize() 
	{		
		App.elementIconsModule.updateIconsToDisplay(this);

		this.marker_ = new Marker(this.id, this.position);
		this.isInitialized_ = true;	
	}

	update($force : boolean = false)
	{
		//console.log("marker update needToBeUpdated", this.needToBeUpdatedWhenShown);
		if (this.needToBeUpdatedWhenShown || App.mode == AppModes.List || $force)
		{
			App.elementIconsModule.updateIconsToDisplay(this);
			let optionValuesToUpdate = this.getCurrOptionsValues().filter( (optionValue) => optionValue.isFilledByFilters);
			optionValuesToUpdate.push(this.getCurrMainOptionValue());
			for(let optionValue of optionValuesToUpdate) App.elementOptionValuesModule.updateOptionValueColor(this, optionValue);

			this.colorOptionId = this.iconsToDisplay.length > 0 && this.getIconsToDisplay()[0] ? this.getIconsToDisplay()[0].colorOptionId : null;	

			if (this.marker) this.marker.update();
			this.needToBeUpdatedWhenShown = false;
		}		
	}

	updateDistance()
	{
		this.distance = null;
		this.distanceFromBoundsCenter = App.boundsModule.extendedBounds ? App.boundsModule.extendedBounds.getCenter().distanceTo(this.position) / 1000 : null;

		if (App.geocoder.getLocation()) 
			this.distance = App.mapComponent.distanceFromLocationTo(this.position);
		else
			this.distance = this.distanceFromBoundsCenter;
		
		// Making the distance more realistic multiplying
		this.distance = this.distance ? Math.round(1.2*this.distance) : null;
		this.distanceFromBoundsCenter = this.distanceFromBoundsCenter ? Math.round(1.2*this.distanceFromBoundsCenter) : null;
	}

	getIconsToDisplay() : OptionValue[] { return this.iconsToDisplay; }

	getCurrOptionsValues() : OptionValue[]
	{
		if (App.config.menu.showOnePanePerMainOption) return this.optionsValues.filter( (optionValue) => optionValue.option.mainOwnerId == App.currMainId);
		return this.optionsValues;
	}

	getCurrDeepestOptionsValues() : OptionValue[]
	{
		let currOptionValues = this.getCurrOptionsValues();
    let idsToRemove = []
    for (let ov of currOptionValues) idsToRemove = idsToRemove.concat(ov.option_.parentOptionIds);
    let deepestOv = currOptionValues.filter( (oV) => idsToRemove.indexOf(oV.option_.id) == -1);

  	// group by owner
  	let groupedByParentOvs = {}
  	for (let ov of deepestOv) { 
  		let parentName = ov.option.parentOptionName;
  		if (parentName in groupedByParentOvs) groupedByParentOvs[parentName].push(ov); 
  		else groupedByParentOvs[parentName] = [ov]; 
  	}
  	let deepestOrderedOv = [];
  	for (let parent in groupedByParentOvs) { deepestOrderedOv = deepestOrderedOv.concat(groupedByParentOvs[parent]); }
  	return deepestOrderedOv;
	}

	getCurrMainOptionValue() : OptionValue
	{
		return this.optionsValues.filter( (optionValue) => optionValue.option.id == App.currMainId).shift();
	}

	getCategoriesIds() : number[]
	{
		return this.getCurrOptionsValues().map( (optionValue) => optionValue.categoryOwner.id).filter((value, index, self) => self.indexOf(value) === index);
	}

	getOptionsIdsInCategorieId(categoryId) : number[]
	{
		return this.getCurrOptionsValues().filter( (optionValue) => optionValue.option.ownerId == categoryId).map( (optionValue) => optionValue.optionId);
	}	

	displayStamps() : Stamp[]
	{
		return App.stampModule.getAllowedStampForElement(this);
	}

	isPending() { return this.status == ElementStatus.PendingAdd || this.status == ElementStatus.PendingModification; }
	isDeleted() { return this.status <= ElementStatus.AdminRefused }
	needsModeration() { return this.moderationState != ElementModerationState.NotNeeded }	

	get marker() : Marker { return this.marker_; }
	get component() { return this.component_ || (this.component_ = new ElementComponent(this)); }	
	get isInitialized() { return this.isInitialized_; }

  toDisplay()
  {
    let result = {
      id: this.id,
      name: this.formatProp('name'),
      address: this.formatProp('address'),
      originalAddress: this.address,
      distance: this.distance,
      taxonomy: this.gogoTaxonomy(),
      status: this.status,
      isPending: this.isPending(),
      isDeleted: this.isDeleted(),
      needsModeration: this.needsModeration(),
      formatedOpenHours: this.formatedOpenHours,
      isEditable: this.isEditable,
      pendingContribution: this.pendingContribution,
      contributions: this.contributions,
      reports: this.reports,
      votes: this.votes
    };
    $.each(this.data, (key, value) => {
       if(!(key in result)) result[key] = this.formatProp(key)
    });
    return result; 
  }

  formatProp(propertyName) { return  App.elementFormaterModule.getProperty(this, propertyName); }
}

