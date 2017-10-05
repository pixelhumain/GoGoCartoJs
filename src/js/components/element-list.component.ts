/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates, AppDataType } from "../app.module";
import { App } from "../gogocarto";
import { ElementsChanged } from "../modules/elements.module";
import { slugify, capitalize, unslugify } from "../commons/commons";

import { createListenersForElementMenu, updateFavoriteIcon } from "./element-menu.component";
import { Element } from "../classes/element.class";
import { Event } from "../utils/event";

import { createListenersForVoting } from "../components/vote.component";

declare var $;

export class ElementListComponent
{
	//onShow = new Event<number>();

	// Number of element in one list
	ELEMENT_LIST_SIZE_STEP : number = 15;
	// Basicly we display 1 ELEMENT_LIST_SIZE_STEP, but if user need
	// for, we display an others ELEMENT_LIST_SIZE_STEP more
	stepsCount : number = 1;
	isListFull : boolean = false;

	// last request was send with this distance
	lastDistanceRequest = 10;

	isInitialized : boolean = false;

	constructor()
	{		
	}

	initialize()
	{
		// detect when user reach bottom of list
		var that = this;
		$('#directory-content-list ul').on('scroll', function(e) 
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

		$('#directory-list-spinner-loader').hide();
		this.clear();		

		this.draw($elementsToDisplay, false);
	}

	setTitle($value : string)
	{
		console.log("set title", $value);
		$('.element-list-title-text').html($value);
	}

	clear()
	{
		$('#directory-content-list li').remove();
	}

	currElementsDisplayed() : number
	{
		return $('#directory-content-list li').length;
	}

	reInitializeElementToDisplayLength()
	{
		this.clear();
		$('#directory-content-list ul').animate({scrollTop: '0'}, 0);
		this.stepsCount = 1;
	}

	private draw($elementList : Element[], $animate = false) 
	{
		let element : Element;
		let elementsToDisplay : Element[] = $elementList.filter( (el) => el.isFullyLoaded); 

		//console.log('ElementList draw', elementsToDisplay.length);

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
		
		// if the list is not full, we send ajax request
		if ( elementsToDisplay.length < maxElementsToDisplay)
		{
			if (App.dataType == AppDataType.All)
			{
				// expand bounds
				App.boundsModule.extendBounds(0.5);
				$('#directory-list-spinner-loader').show();
				App.checkForNewElementsToRetrieve(true);		
			}			
		}	
		else
		{
			//console.log("list is full");
			this.isListFull = true;
			// waiting for scroll bottom to add more elements to the list
		}
		
		for(let i = 0; i < endIndex; i++)
		{
			element = elementsToDisplay[i];

			let listContainerDom = $('#directory-content-list ul.collapsible');

			listContainerDom.append(element.getHtmlRepresentation());
			
			let elementDom = $('#element-info-'+element.id);
			let domMenu = elementDom.find('.menu-element');			
			let directoryListContentDom = $('#directory-content-list');			
			
			createListenersForElementMenu(domMenu);

			// check the visibility of an item after it has been expanded
			elementDom.find('.collapsible-header').click(function() {
				setTimeout( () => { 
					// if all elementDom expanded is not visible					
					let elementDistanceToTop = elementDom.offset().top - listContainerDom.offset().top;

					if ( (elementDom.offset().top - directoryListContentDom.offset().top + elementDom.height()) > (directoryListContentDom.outerHeight() + 150))
					{
						listContainerDom.animate({scrollTop: listContainerDom.scrollTop() + elementDom.offset().top - listContainerDom.offset().top}, 550);
					}					
					// if element is too high
					else if ( elementDistanceToTop < 0 ) 
					{
						listContainerDom.animate({scrollTop: listContainerDom.scrollTop() + elementDistanceToTop}, 300);
					}
				}, 300);
			});
			updateFavoriteIcon(domMenu, element)		
		}


		createListenersForVoting();

		if ($animate)
		{
			$('#directory-content-list ul').animate({scrollTop: '0'}, 500);
		}		

		$('#directory-content-list ul').collapsible({
      	accordion : true 
   	});

   	$('.element-list-title-number-results').text('(' + elementsToDisplay.length + ')');
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
	  return a.searchScore < b.searchScore ? -1 : 1;
	}
}

