/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

import { AppModule, AppStates, AppModes, AppDataType } from "../../app.module";
import { App } from "../../gogocarto";
declare var $;	

import { Event } from "../../classes/event.class";
import { Element, ElementStatus } from "../../classes/classes";

export interface ElementsToDisplayChanged
{ 
	elementsToDisplay : Element[];
	newElements : Element[];
	elementsToRemove : Element[];
}

export class ElementsModule
{
	onElementsToDisplayChanged = new Event<ElementsToDisplayChanged>();

	private everyElements_ : Element[][] = [];
	private everyElementsId_ : string[] = [];
	
	// current visible elements
	private visibleElements_ : Element[][] = [];
	private searchResultElements_ : Element[] = [];	

	firstElementsHaveBeendisplayed : boolean = false;	

	initialize()
	{
		this.everyElements_['all'] = [];
		this.visibleElements_['all'] = [];
		for(let option of App.taxonomyModule.getMainOptions())
		{
			this.everyElements_[option.id] = [];
			this.visibleElements_[option.id] = [];
		}	
	}	

	addElements(newElements : Element[])
	{
		for(let element of newElements)
		{
			for (let mainId of element.mainOptionOwnerIds)
			{
				this.everyElements_[mainId].push(element);
			}				
			this.everyElements_['all'].push(element);
			this.everyElementsId_.push(element.id);
		}		
	}	

	clearCurrentsElement()
	{
		//console.log("clearCurrElements");
		let visibleElements = this.currVisibleElements();
		if (!visibleElements || !visibleElements.length) return;
		let l = visibleElements.length;
		while(l--)
		{
			visibleElements[l].isDisplayed = false;
		}
		let markers = visibleElements.map( (e) => e.marker.getLeafletMarker());
		App.mapComponent.removeMarkers(markers);

		this.clearCurrVisibleElements();
	}	

	// check elements in bounds and who are not filtered
	updateElementsToDisplay(checkInAllElements = true, filterHasChanged = false) 
	{	
		if (App.mode == AppModes.Map && !App.mapComponent.isMapLoaded) return;

		let elements : Element[] = [];

		// Getting the element array to work on
		if ( (App.state == AppStates.ShowElementAlone || App.state == AppStates.ShowDirections ) && App.mode == AppModes.Map) 
			elements = [App.DEAModule.getElement()];		
		else if (App.dataType == AppDataType.All)
		{			
			if (checkInAllElements || this.visibleElements_.length === 0) 
					elements = this.currEveryElements();
			else elements = this.currVisibleElements();
		}
		else if (App.dataType == AppDataType.SearchResults)
		{
			elements = this.searchResultElements_;
		}		
		
		if (!elements) return;

		let i : number, element : Element;

	 	let newElements : Element[] = [];
	 	let elementsToRemove : Element[] = [];		
		
		i = elements.length;
		let filterModule = App.filterModule;	
		let currBounds = App.boundsModule.extendedBounds;
		let start = new Date().getTime();

		// console.log("updateElementsToDisplay. Nbre element à traiter : " + i, checkInAllElements);

		while(i--)
		{
			element = elements[i];

			if (!element) break;

			let elementInBounds = false;
			if (this.noNeedToCheckBounds()) elementInBounds = true;
			else elementInBounds = currBounds && element.position && currBounds.contains(element.position);

			if ( elementInBounds && filterModule.checkIfElementPassFilters(element))
			{
				if (!element.isDisplayed)
				{
					element.isDisplayed = true;
					this.currVisibleElements().push(element);
					newElements.push(element);
				}
			}
			else
			{
				if (element.isDisplayed) 
				{
					element.isDisplayed = false;
					elementsToRemove.push(element);
					let index = this.currVisibleElements().indexOf(element);
					if (index > -1) this.currVisibleElements().splice(index, 1);
				}
			}
		}

		let end = new Date().getTime();
		let time = end - start;

		//window.console.log("UpdateElementsToDisplay en " + time + " ms");
		this.onElementsToDisplayChanged.emit({
			elementsToDisplay: this.currVisibleElements(), 
			newElements : newElements, 
			elementsToRemove : elementsToRemove
		});

		this.updateElementsIcons(filterHasChanged);		

		// strange bug, at initialization, some isolated markers are not displayed
		// refreshing the elementModule solve this...
		if (!this.firstElementsHaveBeendisplayed && this.currVisibleElements() && this.currVisibleElements().length > 0)		
		{
			this.firstElementsHaveBeendisplayed = true;
			setTimeout( () => { this.updateElementsToDisplay(true) }, 100);
		}		
	};

	private noNeedToCheckBounds()
	{
		return App.mode == AppModes.List && 
					(App.dataType != AppDataType.All || App.ajaxModule.allElementsReceived);
	}

	updateElementsIcons(somethingChanged : boolean = false)
	{
		//console.log("UpdateCurrElements somethingChanged", somethingChanged);
		let start = new Date().getTime();

		let visibleElements = this.currVisibleElements();
		if (!visibleElements || !visibleElements.length) return;
		
		let l = visibleElements.length;
		let element : Element;
		while(l--)
		{
			element = visibleElements[l];
			if (somethingChanged) element.needToBeUpdatedWhenShown = true;

			// if domMarker not visible that's mean that marker is in a cluster
			if (element.marker.domMarker().is(':visible')) element.update();
		}
		let end = new Date().getTime();
		let time = end - start;
		//window.console.log("updateElementsIcons " + time + " ms");
	}

	setSearchResultElement(elements : Element[]) { this.searchResultElements_ = elements; }
	getSearchElements() : Element[] { return this.searchResultElements_; }

	get everyElements()        { return this.everyElements_; }
	get everyElementsId()      { return this.everyElementsId_; }
	get visibleElements()      { return this.visibleElements_; }
	get searchResultElements() { return this.searchResultElements_; }

	currVisibleElements()      { return this.visibleElements_[App.currMainId]; }
	currEveryElements()        { return this.everyElements_[App.currMainId]; }
	setCurrVisibleElements(elements : Element[]) { this.visibleElements_[App.currMainId] = elements; }

	private clearCurrVisibleElements() { this.visibleElements_[App.currMainId] = []; }

	allElements() { return this.everyElements_['all']; }

	getElementById(elementId) : Element
	{
		//return this.everyElements_[elementId];
		for (let i = 0; i < this.allElements().length; i++) {
			if (this.allElements()[i].id == elementId) return this.allElements()[i];
		}
		return null;
	};
}