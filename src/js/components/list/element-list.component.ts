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

import { createListenersForElementMenu, updateFavoriteIcon, createListenersForLongDescription } from "../element/element-menu.component";
import { Element } from "../../classes/classes";
import { Event } from "../../classes/event.class";

import { createListenersForVoting } from "../modals/vote.component";

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

	constructor()
	{		
	}

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
			//console.log("list is full");
			this.isListFull = true;
			// waiting for scroll bottom to add more elements to the list
		}
		
		for(let i = 0; i < endIndex; i++)
		{
			element = elementsToDisplay[i];

			let listContentDom = $('#directory-content-list ul.collapsible');
			let listContainerDom = $('#directory-content-list .elements-container');

			listContentDom.append(element.component.render());
			
			let elementDom = $('#element-info-'+element.id);				
			let directoryListContentDom = $('#directory-content-list');		

			if (!element) {
				console.log("Element null ?", element);
			}			

			let images;

			if((images = $('.img-container img')).length > 1)
			{
				let indexLastImage = images.length - 1,
					indexCurrentImage = 0,
					displayImage = function (imageIndex)
					{
						// Get the image of the given index
						let currentImage = images.eq(imageIndex);
						// Hide all images
						images.css('display', 'none');
						// Display the image of the given index
						currentImage.css('display', 'block');
					};

				displayImage(indexCurrentImage);

				// Add a previous and next button for navigating through the images to the overlay, for being able to click on them
				$('.img-container').append('<div class="img-controls"><span id="img-button-prev" class="img-button" style="position:absolute; left:0;">&lt;</span><span id="img-button-next" class="img-button" style="position:absolute; right:0;">&gt;</span></div>');

				// ----------------------
				//   REAL SIZE PHOTO
				// ----------------------
				$('.images-carousel').click(function()
				{
					// When the user clicks the image, opens a new window with the image
					let modal = $('#modal-real-size-photo');

					modal.find(".modal-footer").attr('option-id',element.colorOptionId);

					let currentImage = images.eq(indexCurrentImage),
						modalImg = modal.find('img');

					if(modalImg.length===0)
					{
						modal.find(".modal-content").append('<img src=' + currentImage[0].src + '>');
					}
					else
					{
						modalImg.attr('src', currentImage[0].src);
					}

					modal.openModal({
			      dismissible: true,
			      opacity: 0.5,
			      in_duration: 300,
			      out_duration: 200
					});
				});

				$('#img-button-next').click(function() {
			    indexCurrentImage++;
			    // Check that the index is not greater than the last image index
			    if(indexCurrentImage>indexLastImage)
			    {
						// Otherwise we put the first image index
						indexCurrentImage = 0;
			    }
			    displayImage(indexCurrentImage);
				});

				$('#img-button-prev').click(function() {
			    indexCurrentImage--;
			    // Check that the index is not negative
			    if(indexCurrentImage<0)
			    {
						// Otherwise we put the last image index
						indexCurrentImage = indexLastImage;
			    }
			    displayImage(indexCurrentImage);
				});
			}

			// check the visibility of an item after it has been expanded
			elementDom.find('.collapsible-header').click(function() 
			{
				if (!$(this).hasClass('initialized'))
				{
					setTimeout( () => {
						let domMenu = elementDom.find('.menu-element');	
						createListenersForElementMenu(domMenu);
						createListenersForLongDescription(elementDom);
						updateFavoriteIcon(domMenu, element);
						$(this).addClass('initialized');
					}, 0);

					// Interval to place the button in the middle height of the images container
					// We can't place them before because the images container height is equal to 0
					let intervalId = setInterval( () => {
						let imgContainerOffset = $('.img-container').offset(),
							imgContainerHeight = $('.img-container').height(),
							buttonOuterHeight = $('#img-button-prev').outerHeight();

						if(imgContainerHeight>0)
						{
							$('#img-button-prev').offset({top:imgContainerOffset.top+(imgContainerHeight-buttonOuterHeight)/2, left:imgContainerOffset.left});
							$('#img-button-next').offset({top:imgContainerOffset.top+(imgContainerHeight-buttonOuterHeight)/2, right:0});
							clearInterval(intervalId);
						}
					}, 50);
				}			

				setTimeout( () => {
					// if all elementDom expanded is not visible					
					let elementDistanceToTop = elementDom.offset().top - listContainerDom.offset().top;

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
				}, 300);
			});
				
		}

		createListenersForVoting();

		if ($animate) $('#directory-content-list .elements-container').animate({scrollTop: '0'}, 500);

		$('#directory-content-list ul').collapsible({accordion : true});		
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

