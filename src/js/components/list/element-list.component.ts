/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates, AppDataType } from "../../app.module";
import { App } from "../../gogocarto";
import { ElementsToDisplayChanged } from "../../modules/elements/elements.module";
import { Element } from "../../classes/classes";
import { Event } from "../../classes/event.class";

declare var $;

export class ElementListComponent
{
	elementToDisplayCount : number = 0; 

	// Number of element in one list
	ELEMENT_LIST_SIZE_STEP : number = 15;
	// Basicly we display 1 ELEMENT_LIST_SIZE_STEP, but if user need
	// for, we display an others ELEMENT_LIST_SIZE_STEP more
	stepsCount : number = 1;
	isListFull : boolean = false;

	// last request was send with this distance
	lastDistanceRequest = 10;

	isInitialized : boolean = false;

	constructor() {}

	initialize()
	{
		// detect when user reach bottom of list
		var that = this;
		$('#directory-content-list .elements-container').on('scroll', function(e) 
		{
			if($(this).scrollTop() > 0)
				$("#list-title-shadow-bottom").show();
			else
				$("#list-title-shadow-bottom").hide();

			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {            
		    	that.handleBottom();
		  }
		});
	}

	update($elementsToDisplay : Element[]) 
	{
		//console.log("elementList update", $elementsResult);
		if ($elementsToDisplay.length == 0) this.stepsCount = 1;

		this.hideSpinnerLoader();
		this.clear();		

		this.draw($elementsToDisplay, false);
	}

	setTitle($value : string) { $('.element-list-title-text').html($value); }

	show() { $('#directory-content-list').show(); }
	
	hide() { $('#directory-content-list').hide(); }

	showSpinnerLoader() { $('#directory-list-spinner-loader').show(); }

	hideSpinnerLoader() { $('#directory-list-spinner-loader').hide(); }

	clear() { $('#directory-content-list li').remove(); }

	reInitializeElementToDisplayLength()
	{
		this.clear();
		$('#directory-content-list .elements-container').animate({scrollTop: '0'}, 0);
		this.stepsCount = 1;
	}

	private draw($elementList : Element[], $animate = false) 
	{
		let element : Element;
		let elementsToDisplay : Element[] = $elementList.filter( (el) => el.isFullyLoaded); 

		this.elementToDisplayCount = elementsToDisplay.length;
		// console.log('ElementList draw', elementsToDisplay.length);

		if (App.dataType == AppDataType.All)
		{
			for(element of elementsToDisplay) element.updateDistance();
			elementsToDisplay.sort(this.compareDistance);
		}
		else if (App.dataType == AppDataType.SearchResults)
		{
			elementsToDisplay.sort(this.compareSearchScore);
		}		

		let maxElementsToDisplay = this.ELEMENT_LIST_SIZE_STEP * this.stepsCount;
		let endIndex = Math.min(maxElementsToDisplay, elementsToDisplay.length);  

		this.updateResultMessage();
		
		// if the list is not full, we send ajax request
		if (elementsToDisplay.length < maxElementsToDisplay)
		{
			if (App.dataType == AppDataType.All)
			{
				// expand bounds
				App.boundsModule.extendBounds(0.5);
				this.showSpinnerLoader();
				App.elementsManager.checkForNewElementsToRetrieve(true);		
			}			
		}	
		else
		{
			// console.log("list is full");
			// waiting for scroll bottom to add more elements to the list
			this.isListFull = true;			
		}
		
		let listContentDom = $('#directory-content-list ul.collapsible');
		let that = this;

		for(let i = 0; i < endIndex; i++)
		{
			element = elementsToDisplay[i];			
			listContentDom.append(element.component.render());
			// bind element header click
			element.component.dom.find('.collapsible-header').click(function() { that.onElementOpen(this); });
		}

		if ($animate) $('#directory-content-list .elements-container').animate({scrollTop: '0'}, 500);
		$('#directory-content-list ul').collapsible({accordion : true});		
	}

	private onElementOpen(elementHeaderDom)
	{
		let elementDom = $(elementHeaderDom).closest('.element-item');
		let elementId = elementDom.data('element-id');
		let element =  App.elementById(elementId);
		
		// initialize element component
		if (!$(elementHeaderDom).hasClass('initialized'))
		{
			element.component.initialize();
			element.component.imagesComponent.onNewImageDisplayed.do( (image) => {
				elementDom.find('.img-overlay').css('height', elementDom.find('.img-container').height());
			});				

			setTimeout( () => { $(elementHeaderDom).addClass('initialized'); }, 0);					
		}

		// on open animation end
		setTimeout( () => { this.onElementFullyOpenned(elementDom); }, 300);			
	}

	private onElementFullyOpenned(elementDom)
	{
		let listContainerDom = $('#directory-content-list .elements-container');
		elementDom.find('.img-overlay').css('height', elementDom.find('.img-container').height());

		// check the visibility of an item after it has been expanded
		let elementDistanceToTop = elementDom.offset().top - listContainerDom.offset().top;

		// if element not visible on screen
		if ( (elementDom.offset().top - listContainerDom.offset().top + elementDom.height()) > (listContainerDom.outerHeight() + 150))
		{
			listContainerDom.animate({scrollTop: listContainerDom.scrollTop() + elementDom.offset().top - listContainerDom.offset().top}, 550);
		}					
		// if element is too high
		else if ( elementDistanceToTop < 0 ) 
		{
			listContainerDom.animate({scrollTop: listContainerDom.scrollTop() + elementDistanceToTop}, 300);
		}
		setTimeout( () => $('.info-bar-tabs').tabs(), 0);
	}

	private updateResultMessage()
	{
		$('.no-result-message').hide();
		
		if (this.elementToDisplayCount > 0)
		{			
			$('.element-list-header .title-text').show();
   		$('.element-list-title-number-results').text('(' + this.elementToDisplayCount + ')');
   	}
   	else
   		$('.element-list-header .title-text').hide();
	}

	handleAllElementsRetrieved()
	{
		this.hideSpinnerLoader();
		if (this.elementToDisplayCount == 0)
		{
			$('.element-list-title-number-results').text('(0)');
			$('.no-result-message').show();
			let noResultImg = $('.no-result-message img');
			noResultImg.attr('src', noResultImg.data('src'));
			$('.element-list-header .title-text').show();
		}		
	}

	private handleBottom()
	{
		if (this.isListFull) 
		{
			this.stepsCount++;
			//console.log("bottom reached");
			this.isListFull = false;
			this.clear();
			this.draw(App.elements());
		}		
	}

	private compareDistance(a:Element,b:Element) 
	{  
	  if (a.distanceFromBoundsCenter == b.distanceFromBoundsCenter) return 0;
	  return a.distanceFromBoundsCenter < b.distanceFromBoundsCenter ? -1 : 1;
	}

	private compareSearchScore(a:Element,b:Element) 
	{  
	  if (a.searchScore == b.searchScore) return 0;
	  return a.searchScore < b.searchScore ? 1 : -1;
	}
}

