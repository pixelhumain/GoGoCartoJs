/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates, AppModes } from "../app.module";
import { BiopenMarker } from "../components/map/biopen-marker.component";
import { OptionValue, CategoryValue, Option, Category, Contribution, VoteReport } from "./classes";
import { capitalize } from "../utils/string-helpers";

import { App } from "../gogocarto";
declare var $, JsDiff : any;


export enum ElementStatus 
{
  ModifiedElement = -5,
  Deleted = -4,
  CollaborativeRefused = -3,
  AdminRefused = -2,    
  PendingModification = -1,
  PendingAdd = 0,
  AdminValidate = 1,
  CollaborativeValidate = 2
}

export enum ElementModerationState
{
  GeolocError = -2,
  NoOptionProvided = -1,     
  NotNeeded = 0,
  ReportsSubmitted = 1,
  VotesConflicts = 2, 
  PendingForTooLong = 3     
}

var diffConfiguration =
{
	name: JsDiff.diffSentences,
	description: JsDiff.diffSentences,
	address: JsDiff.diffSentences,
	commitment: JsDiff.diffSentences,
	telephone: JsDiff.diffSentences,
	website: JsDiff.diffSentences,
	email: JsDiff.diffSentences,
	openHoursMoreInfos: JsDiff.diffSentences,
}

var capitalizeConfiguration =
{
	name: true,
	description: true,
	descriptionMore: true,
	address: false,
	telephone: false,
	website: false,
	email: false,
	openHoursMoreInfos: true,
}

export class Element 
{	
	id : string;
	status : ElementStatus;
	moderationState : ElementModerationState;
	reports : VoteReport[];
	contributions : Contribution[];
	pendingContribution : Contribution;
	votes : VoteReport[];
	name : string;
	position : L.LatLng;
	streetAddress : string;
	addressLocality: string;
	postalCode: string;
	description : string;
	descriptionMore: string;
	modifiedElement : Element = null;
	telephone : string;
	website : string;
	email : string;
	openHours : any;
	openHoursDays : string[] = [];
	openHoursMoreInfos : any;
	mainOptionOwnerIds : number[] = [];
	commitment : string;

	optionsValues : OptionValue[] = [];
	optionValuesByCatgeory : OptionValue[][] = [];

	colorOptionId : number;
	private iconsToDisplay : OptionValue[] = [];
	private optionTree : OptionValue;

	formatedOpenHours_ = null;

	isFullyLoaded : boolean = false;

	distance : number;
	distanceFromBoundsCenter : number;

	isInitialized_ :boolean = false;

	// for elements module algorithms
	isDisplayed :boolean = false;

	//TODO
	biopenMarker_ : BiopenMarker = null;
	htmlRepresentation_ = '';

	productsToDisplay_ : any = {};

	starChoiceForRepresentation = '';
	isShownAlone : boolean= false;

	isFavorite : boolean= false;

	needToBeUpdatedWhenShown : boolean = true;

	searchScore : number = null;

	constructor(elementJson : any)
	{	

		// when we get the compact json representation of the element from the server
		// the elementJson is a simple array with the more important element attribute
		if (!elementJson.id && $.isArray(elementJson) && elementJson.length >= 5)
		{
			this.id = elementJson[0];			
			this.name = elementJson[1];
			this.position = L.latLng(elementJson[2], elementJson[3]);				
			this.createOptionValues(elementJson[4]);		
			this.status = elementJson.length >= 6 ? elementJson[5] : 1;	
			this.moderationState = elementJson.length >= 7 ? elementJson[6] : 0;					
		}
		else this.updateAttributesFromFullJson(elementJson);
	}	

	// when we get the full representation of the element, we update
	// all the fields
	updateAttributesFromFullJson(elementJson : any)
	{
		// if the element was not prefilled with the compact json representation
		// we overide anyway all attributes (it can have changed !)
		this.id = elementJson.id;
		this.position = L.latLng(elementJson.geo.latitude, elementJson.geo.longitude);
		this.name = elementJson.name;
		this.status = elementJson.status == undefined ? 1 : elementJson.status;
		this.moderationState = elementJson.moderationState || 0;

		// update createOptionValue vene if element already exist
		this.createOptionValues(elementJson.optionValues);
		
		if(elementJson.modifiedElement) 
		{
			this.modifiedElement = new Element(elementJson.modifiedElement);
			let diffOptionValues = this.getDiffOptionValues(elementJson.optionValues, elementJson.modifiedElement.optionValues);
			this.modifiedElement.createOptionValues(diffOptionValues);
		}
		this.streetAddress = capitalize(elementJson.address.streetAddress || '');
		this.addressLocality = capitalize(elementJson.address.addressLocality || '');
		this.postalCode = elementJson.address.postalCode;
		this.description = capitalize(elementJson.description) || '';
		this.descriptionMore = capitalize(elementJson.descriptionMore) || '';
		this.checkForMergeDescriptions();

		// this.reports = this.createObjectArrayFromJson(VoteReport, elementJson.reports);
		// this.contributions = this.createObjectArrayFromJson(Contribution, elementJson.contributions);
		// this.votes = this.createObjectArrayFromJson(VoteReport, elementJson.votes);

		this.reports = elementJson.reports;
		this.contributions = elementJson.contributions;
		this.pendingContribution = elementJson.pendingContribution;
		this.votes = elementJson.votes;

		this.commitment = elementJson.commitment || '';
		this.telephone = this.getFormatedTel(elementJson.telephone);	
		this.website = elementJson.website;
		this.email = elementJson.email || '';
		this.openHours = elementJson.openHours;
		this.openHoursMoreInfos =  elementJson.openHoursMoreInfos;		

		// initialize formated open hours
		this.getFormatedOpenHours();

		this.searchScore = elementJson.searchScore;

		this.isFullyLoaded = true;
	}	

	private checkForMergeDescriptions()
	{
    if ( this.status != ElementStatus.PendingModification &&
         this.status != ElementStatus.ModifiedElement &&
         this.descriptionMore.length > 0 && 
         (this.description.length + this.descriptionMore.length) < 300)
		{
			this.description = this.description + '<br /> ' + this.descriptionMore;
			this.descriptionMore = '';
		}
	}

	private getFormatedTel(value)
	{
		if (!value) return '';
		if (value.length == 10) return value.replace(/(.{2})(?!$)/g,"$1 ");
		return value;
	}

	private createOptionValues(optionsValuesJson)
	{
		let alreadyCreated = false;
		if (this.optionsValues.length > 0) 
		{ 
			alreadyCreated = true; 
			this.optionsValues = [];
			this.optionValuesByCatgeory = [];
		}

		let optionValueJson, newOption : OptionValue;
		for (let key = 0; key < optionsValuesJson.length; ++key) 
		{
			optionValueJson =  optionsValuesJson[key];
			newOption = new OptionValue(optionValueJson, key);

			if (newOption.option)
			{
				if (newOption.option.isMainOption()) this.mainOptionOwnerIds.push(newOption.optionId);

				this.optionsValues.push(newOption);

				// put options value in specific easy accessible array for better performance
				if (!this.optionValuesByCatgeory[newOption.option.ownerId]) this.optionValuesByCatgeory[newOption.option.ownerId] = [];
				this.optionValuesByCatgeory[newOption.option.ownerId].push(newOption);
			}			
		}

		if(alreadyCreated)
		{
			this.createOptionsTree();
			this.update(true);
		}		
	}

	private createObjectArrayFromJson(klass, elementsJson)
	{
		elementsJson = elementsJson || [];
		let result = [];
		for(let elementJson of elementsJson)
		{
			result.push(new klass(elementJson));
		}
		return result;
	}

	getOptionValueByCategoryId($categoryId)
	{
		return this.optionValuesByCatgeory[$categoryId] || [];
	}	

	initialize() 
	{		
		this.createOptionsTree();
		this.updateIconsToDisplay();

		this.biopenMarker_ = new BiopenMarker(this.id, this.position);
		this.isInitialized_ = true;	
	}

	update($force : boolean = false)
	{
		//console.log("marker update needToBeUpdated", this.needToBeUpdatedWhenShown);
		if (this.needToBeUpdatedWhenShown || App.mode == AppModes.List || $force)
		{
			this.updateIconsToDisplay();

			let optionValuesToUpdate = this.getCurrOptionsValues().filter( (optionValue) => optionValue.isFilledByFilters);
			optionValuesToUpdate.push(this.getCurrMainOptionValue());
			for(let optionValue of optionValuesToUpdate) this.updateOwnerColor(optionValue);

			this.colorOptionId = this.iconsToDisplay.length > 0 && this.getIconsToDisplay()[0] ? this.getIconsToDisplay()[0].colorOptionId : null;	

			if (this.marker) this.marker.update();
			this.needToBeUpdatedWhenShown = false;
		}		
	}

	updateOwnerColor($optionValue : OptionValue)
	{
		if (!$optionValue) return;
		//console.log("updateOwnerColor", $optionValue.option.name);
		if ($optionValue.option.useColorForMarker)
		{
			$optionValue.colorOptionId = $optionValue.optionId;
		}		
		else 
		{
			let option : Option;
			let category : Category;
			let colorId : number = null;

			let siblingsOptionsForColoring : OptionValue[] = this.getCurrOptionsValues().filter( 
				(optionValue) => 
					optionValue.isFilledByFilters 
					&& optionValue.option.useColorForMarker
					&& optionValue.option.ownerId !== $optionValue.option.ownerId 
					&& optionValue.categoryOwner.ownerId == $optionValue.categoryOwner.ownerId
			);

			//console.log("siblingsOptionsForColoring", siblingsOptionsForColoring.map( (op) => op.option.name));
			if (siblingsOptionsForColoring.length > 0)
			{
				option = <Option> siblingsOptionsForColoring.shift().option;
				//console.log("-> sibling found : ", option.name);
				colorId = option.id;
			}
			else
			{
				option = $optionValue.option;
				//console.log("no siblings, looking for parent");
				while(colorId == null && option)
				{
					category = <Category> option.getOwner();
					if (category)
					{
						option = <Option> category.getOwner();					
						//console.log("->parent option" + option.name + " usecolorForMarker", option.useColorForMarker);
						colorId = option.useColorForMarker ? option.id : null;
					}					
				}
			}
			
			$optionValue.colorOptionId = colorId;
		}
	}

	getCurrOptionsValues() : OptionValue[]
	{
		return this.optionsValues.filter( (optionValue) => optionValue.option.mainOwnerId == App.currMainId);
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

	createOptionsTree()
	{
		this.optionTree = new OptionValue({});
		let mainCategory = App.categoryModule.mainCategory;

		this.recusivelyCreateOptionTree(mainCategory, this.optionTree);
	}

	getOptionTree()
	{
		if (this.optionTree) return this.optionTree;
		this.createOptionsTree();
		return this.optionTree;
	}

	private recusivelyCreateOptionTree(category : Category, optionValue : OptionValue)
	{
		let categoryValue = new CategoryValue(category);

		for(let option of category.options)
		{
			let childOptionValue = this.fillOptionId(option.id);
			if (childOptionValue)
			{
				categoryValue.addOptionValue(childOptionValue);
				for(let subcategory of option.subcategories)
				{
					this.recusivelyCreateOptionTree(subcategory, childOptionValue);
				}
			}			
		}

		if (categoryValue.children.length > 0)
		{
			categoryValue.children.sort( (a,b) => a.index - b.index);
			optionValue.addCategoryValue(categoryValue);
		} 
	}

  private getDiffOptionValues(optionValues, newOptionValues)
  {
    optionValues = optionValues.map( (obj) => new OptionValue(obj));
    newOptionValues = newOptionValues.map( (obj) => new OptionValue(obj));
    let diffOptionsValues = [];
    let newOVIds = newOptionValues.map((obj) => obj.optionId);
    let oldOVIds = optionValues.map((obj) => obj.optionId);
    for(let ov of optionValues)
    {
      if (newOVIds.indexOf(ov.optionId) == -1)
      {
        ov.diff = 'removed';
        diffOptionsValues.push(ov);
      }
    }
    for(let newOv of newOptionValues)
    {
      let index = oldOVIds.indexOf(newOv.optionId);
      if (index == -1)
      {
        newOv.diff = 'added';
      }
      else
      {        
        let modifiedValue = capitalize(newOv.description);
        let value = capitalize(optionValues[index].description),
        spanClass = '',
        span = null;
        let diff = JsDiff.diffWords(value, modifiedValue),
            display = document.createElement('div'),
            fragment = document.createDocumentFragment();

        diff.forEach(function(part)
        {
          spanClass = part.added ? 'added' : part.removed ? 'removed' : 'equals';
          span = document.createElement('span');
          if (spanClass) span.className = spanClass;
          span.appendChild(document.createTextNode(part.value));
          fragment.appendChild(span);
        });

        display.appendChild(fragment);

        newOv.description = display.innerHTML;
        newOv.diff = 'equals';
      }
      diffOptionsValues.push(newOv);
    }
    return diffOptionsValues;
  }

	fillOptionId($optionId : number) : OptionValue
	{
		let index = this.optionsValues.map((value) => value.optionId).indexOf($optionId);
		if (index == -1) return null;
		return this.optionsValues[index];
	}

	getIconsToDisplay() : OptionValue[]
	{
		let result = this.iconsToDisplay;
		return result.sort( (a,b) => a.isFilledByFilters ? -1 : 1);
	}

	updateIconsToDisplay() 
	{		
		this.checkForDisabledOptionValues();

		if (App.currMainId == 'all')
			this.iconsToDisplay = this.recursivelySearchIconsToDisplay(this.getOptionTree(), false);
		else
			this.iconsToDisplay = this.recursivelySearchIconsToDisplay(this.getCurrMainOptionValue());

		// in case of no OptionValue in this mainOption, we display the mainOption Icon
		if (this.iconsToDisplay.length == 0)
		{
			this.iconsToDisplay.push(this.getCurrMainOptionValue());
		}
		
		//console.log("Icons to display sorted", this.getIconsToDisplay());
	}

	private recursivelySearchIconsToDisplay(parentOptionValue : OptionValue, recursive : boolean = true) : OptionValue[]
	{
		if (!parentOptionValue) return [];

		let resultOptions : OptionValue[] = [];		

		for(let categoryValue of parentOptionValue.children)
		{
			for(let optionValue of categoryValue.children)
			{
				let result = [];
				
				if (recursive)
				{
					result = this.recursivelySearchIconsToDisplay(optionValue) || [];
					resultOptions = resultOptions.concat(result);
				}

				if (result.length == 0 && optionValue.option.useIconForMarker)
				{
					resultOptions.push(optionValue);
				}

			}
		}
		return resultOptions;
	}

	checkForDisabledOptionValues()
	{
		this.recursivelyCheckForDisabledOptionValues(this.getOptionTree(), App.currMainId == 'all');
	}

	private recursivelyCheckForDisabledOptionValues(optionValue : OptionValue, noRecursive : boolean = true)
	{
		let isEveryCategoryContainsOneOptionNotdisabled = true;
		//console.log("checkForDisabledOptionValue Norecursive : " + noRecursive, optionValue);

		for(let categoryValue of optionValue.children)
		{
			let isSomeOptionNotdisabled = false;
			for (let suboptionValue of categoryValue.children)
			{
				if (suboptionValue.children.length == 0 || noRecursive)
				{
					//console.log("bottom option " + suboptionValue.option.name,suboptionValue.option.isChecked );
					suboptionValue.isFilledByFilters = suboptionValue.option.isChecked;					
				}
				else
				{
					this.recursivelyCheckForDisabledOptionValues(suboptionValue, noRecursive);
				}
				if (suboptionValue.isFilledByFilters) isSomeOptionNotdisabled = true;
			}
			if (!isSomeOptionNotdisabled) isEveryCategoryContainsOneOptionNotdisabled = false;
			//console.log("CategoryValue " + categoryValue.category.name + "isSomeOptionNotdisabled", isSomeOptionNotdisabled);
		}

		if (optionValue.option)
		{
			//console.log("OptionValue " + optionValue.option.name + " : isEveryCategoyrContainOnOption", isEveryCategoryContainsOneOptionNotdisabled );
			optionValue.isFilledByFilters = isEveryCategoryContainsOneOptionNotdisabled;
			if (!optionValue.isFilledByFilters) optionValue.setRecursivelyFilledByFilters(optionValue.isFilledByFilters);
		}
	}

	updateProductsRepresentation() 
	{		
		// if (App.state !== AppStates.Constellation) return;

		// let starNames = App.constellation.getStarNamesRepresentedByElementId(this.id);
		// if (this.isProducteurOrAmap())
		// {
		// 	for(let i = 0; i < this.products.length;i++)
		// 	{
		// 		productName = this.products[i].nameFormate;			

		// 		if ($.inArray(productName, starNames) == -1)
		// 		{
		// 			this.products[i].disabled = true;				
		// 			if (productName == this.mainProduct) this.mainProductIsDisabled = true;				
		// 		}	
		// 		else
		// 		{
		// 			this.products[i].disabled = false;				
		// 			if (productName == this.mainProduct) this.mainProductIsDisabled = false;		
		// 		}		
		// 	}
		// }
		// else
		// {
		// 	if (starNames.length === 0) this.mainProductIsDisabled = true;	
		// 	else this.mainProductIsDisabled = false;	
		// }
	};

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

	isPending() { return this.status == ElementStatus.PendingAdd || this.status == ElementStatus.PendingModification; }
	isDeleted() { return this.status <= ElementStatus.AdminRefused }
	needsModeration() { return this.moderationState != ElementModerationState.NotNeeded }

	getFormatedAddress()
	{
		let result = "";
    if (this.streetAddress) result += this.streetAddress + ', ';
    if (this.postalCode) result += this.postalCode + ' ';
    if (this.addressLocality) result += this.addressLocality;
    return result;
	}

	// use template js to create the html representation of the element
	getHtmlRepresentation() 
	{	
		if (!this.isFullyLoaded)
		{
			console.log("Send Ajax to retrieve full element");
			return;
		}

		this.update();	
		this.updateDistance();

		let optionstoDisplay = this.getIconsToDisplay();

		let mainCategoryValue;
		if (this.status == ElementStatus.PendingModification && this.modifiedElement)	
			mainCategoryValue = this.modifiedElement.getOptionTree().children[0];
		else
			mainCategoryValue = this.getOptionTree().children[0];
		//console.log("GetHtmlRepresentation " + this.distance + " km", this.getOptionTree().children[0]);

		let html = App.templateModule.render('element-info-bar', 
		{
			element : this, 
			showDistance: App.geocoder.getLocation() ? true : false,
			listingMode: App.mode == AppModes.List, 
			optionsToDisplay: optionstoDisplay,
			allOptionsValues: this.getCurrOptionsValues().filter( (oV) => oV.option.displayOption).sort( (a,b) => a.isFilledByFilters ? -1 : 1),
			mainOptionValueToDisplay: optionstoDisplay[0], 
			otherOptionsValuesToDisplay: optionstoDisplay.slice(1),  
			mainCategoryValue : mainCategoryValue,
			editUrl : App.config.features.edit.url + this.id,
			ElementStatus: ElementStatus,
			ElementModerationState: ElementModerationState,
			isIframe : App.isIframe,
			isMapMode : App.mode == AppModes.Map,
			config : App.config,
			smallWidth : App.mode == AppModes.Map && App.infoBarComponent.isDisplayedAside()
		});

		
		this.htmlRepresentation_ = html;				
		return html;
	};

	getProperty(propertyName)
	{
		let value = this.getFormatedValue(this, propertyName);
		
		// in iframe the pending modifications are not displayed, just the old version
		if (this.status != ElementStatus.PendingModification || !App.config.isFeatureAvailable('pending') || !this.modifiedElement) return value;

    let modifiedValue = this.getFormatedValue(this.modifiedElement, propertyName);

    if (!value && !modifiedValue) return '';

    value = value || '';
    modifiedValue = modifiedValue || '';

    let spanClass = '',
    span = null;

    let DiffMethod = diffConfiguration[propertyName] ? diffConfiguration[propertyName] : JsDiff.diffSentences
		let diff = DiffMethod(value, modifiedValue);
		let display = document.createElement('div'),
		    fragment = document.createDocumentFragment();

		diff.forEach(function(part)
		{
		  spanClass = part.added ? 'added' : part.removed ? 'removed' : 'equals';
		  span = document.createElement('span');
		  if (spanClass) span.className = spanClass;
		  span.appendChild(document.createTextNode(part.value));
		  fragment.appendChild(span);
		});

		display.appendChild(fragment);

		return display.innerHTML;
	}

	private getFormatedValue(element, propertyName)
	{
		let value;
		if (propertyName == 'address') value = element.getFormatedAddress();
		else value = element[propertyName]
		
		value = capitalizeConfiguration[propertyName] ? capitalize(value) : value;
		return value;
	}

	getFormatedOpenHours()
	{		
		if (this.formatedOpenHours_ === null )
		{		
			this.formatedOpenHours_ = {};
			let new_key, new_key_translated, newDailySlot;
			for(let key in this.openHours)
			{
				new_key_translated = this.translateDayKey(key);				
				newDailySlot = this.formateDailyTimeSlot(this.openHours[key]);
				
				if (newDailySlot)
				{
					this.formatedOpenHours_[new_key_translated] = newDailySlot;
					this.openHoursDays.push(new_key_translated);
				}
			}
		}
		return this.formatedOpenHours_;
	};

	private translateDayKey(dayKey)
	{
		switch(dayKey)
		{
			case 'Mo': return 'lundi';
			case 'Tu': return 'mardi';
			case 'We': return 'mercredi';
			case 'Th': return 'jeudi';
			case 'Fr': return 'vendredi';
			case 'Sa': return 'samedi';
			case 'Su': return 'dimanche';
		}

		return '';
	}

	private formateDailyTimeSlot(dailySlot) 
	{		
		if (dailySlot === null)
		{		
			//return 'fermé';
			return null;
		}
		let result = '';
		return dailySlot.replace(/-/g, ' - ').replace(/,/g, ' et ');
	};

	isCurrentStarChoiceRepresentant() 
	{		
		if ( this.starChoiceForRepresentation !== '')
		{
			let elementStarId = App.constellation.getStarFromName(this.starChoiceForRepresentation).getElementId();
			return (this.id == elementStarId);
		}
		return false;	
	};


	// --------------------------------------------
	//            SETTERS GETTERS
	// ---------------------------------------------
	get marker()  : BiopenMarker
	{		
		// initialize = initialize || false;
		// if (initialize) this.initialize();
		return this.biopenMarker_;
	};

	get isInitialized() 
	{		
		return this.isInitialized_;
	};

}

