/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates } from "../app.module";
import { Element } from "../classes/element.class";
import { App } from "../gogocarto";

import { Event } from "../utils/event";
import { createListenersForElementMenu, updateFavoriteIcon, showFullTextMenu } from "./element-menu.component";

import { createListenersForVoting } from "../components/vote.component";

declare var $;

export class InfoBarComponent
{
	isVisible : boolean = false;
	isDetailsVisible = false;

	elementVisible : Element = null;

	loaderTimer = null;

	onShow = new Event<number>();
	onHide = new Event<boolean>();

	getCurrElementId() : string { return this.elementVisible ? this.elementVisible.id : null}

	private isDisplayedAside()
	{
		return $('#element-info-bar').hasClass('display-aside');
	}

	// App.infoBarComponent.showElement;
	showElement(elementId, callback = null) 
	{
		let element = App.elementModule.getElementById(elementId);

		//console.log("showElement", element);

		// if element already visible
		if (this.elementVisible)
		{
			this.elementVisible.marker.showNormalSize(true);
		}

		this.elementVisible = element;	

		if (!element.isFullyLoaded)
		{
			//console.log("Element not fully Loaded");
			App.ajaxModule.getElementById(elementId,
			(response) => {
				element.updateAttributesFromFullJson(response);
				this.showElement(element.id);
				if (callback) callback();
			},
			() => {
				console.log("Ajax failure for elementId", elementId);
			});			

			// if ajax retrieving take more than 500ms, we show spinner loader
			this.loaderTimer = setTimeout( () => 
			{ 
				$('#info-bar-overlay').fadeIn();					
				this.show(); 
			}, 500); 	
			return;
		}
		else
		{
			// clearing loader
			clearTimeout(this.loaderTimer);
			$('#info-bar-overlay').fadeOut();

			$('#element-info').html(element.getHtmlRepresentation());		
			
			let domMenu = $('#element-info-bar .menu-element');
			createListenersForElementMenu(domMenu);	
			createListenersForVoting();

			updateFavoriteIcon(domMenu, element);

			// on large screen info bar is displayed aside and so we have enough space
			// to show menu actions details in full text
			showFullTextMenu(domMenu, this.isDisplayedAside());

			$('#btn-close-bandeau-detail').click(() =>
			{  		
				this.hide();
				return false;
			});
			
			$('#element-info .collapsible-header').click(() => {this.toggleDetails(); });
		}						
		
		this.show();		

		this.onShow.emit(elementId);

		App.updateDocumentTitle();
	};

	refresh()
	{
		if (this.elementVisible) this.showElement(this.elementVisible.id);
	}

	show()
	{
		if (!this.isDisplayedAside())
		{
			$('#element-info-bar').show();

			let elementInfoBar_newHeight = $('#element-info').outerHeight(true);
			elementInfoBar_newHeight += $('#element-info-bar .starRepresentationChoice-helper:visible').height();

			this.updateInfoBarSize();

			$('#element-info-bar').animate({'height': elementInfoBar_newHeight}, 350, 'swing', () => 
			{
				App.component.updateMapSize();
				this.checkIfMarkerStillVisible();		  		
			});
		}	
		else
		{
			if (!$('#element-info-bar').is(':visible'))
			{
				$('#element-info-bar').css('right','-540px');			
				$('#element-info-bar').show().animate({'right':'0'},350,'swing', () =>
				{
					$('#directory-content-map').css('margin-right','540px');
		  		$('#bandeau_helper').css('margin-right','540px');
		  		App.component.updateMapSize();
		  		this.checkIfMarkerStillVisible();		  		
				});
			}
			
			this.updateInfoBarSize();
		}

		this.isVisible = true;
	};

	checkIfMarkerStillVisible()
	{
		// after infobar animation, we check if the marker 
		// is not hidded by the info bar
		setTimeout( () => {
			if (this.elementVisible)
			{
				console.log("map conatins element", App.mapComponent.contains(this.elementVisible.position));
				if (!App.mapComponent.contains(this.elementVisible.position))
				{
					App.mapComponent.panToLocation(this.elementVisible.position);
					setTimeout( () => { this.elementVisible.marker.showBigSize(); }, 1000);
				}		
			}	
		}, 100);
	}

	hide()
	{
		if ($('#element-info-bar').is(':visible'))
		{
			if (!this.isDisplayedAside())
			{			
				this.hideDetails();
				$('#element-info-bar').animate({'height': '0'}, 350, 'swing', () => 
				{
					App.component.updateMapSize();
					$('#element-info-bar').hide();
				});
			}
			else
			{
				$('#directory-content-map').css('margin-right','0px');
				$('#bandeau_helper').css('margin-right','0px');

				if ($('#element-info-bar').is(':visible'))
				{		
					$('#element-info-bar').animate({'right':'-500px'},350,'swing',function()
					{ 
						$(this).hide();  
		  			App.component.updateMapSize();
					});
				}		
			}

			this.onHide.emit(true);
		}

		setTimeout( () => $('#element-info').html(''), 350);

		if (this.elementVisible && this.elementVisible.marker) this.elementVisible.marker.showNormalSize(true);

		this.elementVisible = null;
		this.isVisible = false;		
	};

	toggleDetails()
	{	
		//App.setTimeoutInfoBarComponent();

		if ( $('#element-info-bar .moreDetails').is(':visible') )
		{
			this.hideDetails();
			$('#bandeau_helper').css('z-index',20).animate({'opacity': '1'},500);
		}
		else
		{
			$('#bandeau_helper').animate({'opacity': '0'},500).css('z-index',-1);

			$('#element-info-bar .moreInfos').hide();
			$('#element-info-bar .lessInfos').show();				
			$('#element-info-bar .moreDetails').show();		

			$('#element-info-bar').animate({'height':'100%'},400,'swing');

			let elementInfoBar = $("#element-info-bar");
		  let height =  $('.gogocarto-container').height();
			height -= elementInfoBar.find('.collapsible-header').outerHeight(true);
			height -= elementInfoBar.find('.starRepresentationChoice-helper:visible').outerHeight(true);
			height -= elementInfoBar.find(".menu-element").outerHeight(true);

		  $('#element-info-bar .collapsible-body').css('height', height);					
		}	
	};

	hideDetails()
	{
		//App.setTimeoutInfoBarComponent();

		if ($('#element-info-bar .moreDetails').is(':visible'))
		{
			$('#element-info-bar .moreDetails').hide();
			$('#element-info-bar .moreInfos').show();
			$('#element-info-bar .lessInfos').hide();

			let elementInfoBar_newHeight = $('#element-info').outerHeight(true) + $('#element-info-bar .starRepresentationChoice-helper:visible').height();

			$('#element-info-bar').animate({'height': elementInfoBar_newHeight}, 400, 'swing');
		}	
	};

	updateInfoBarSize()
	{
		if ($('.gogocarto-container').width() < 1200) 
		{
	  	$('#element-info-bar .moreDetails').css('height', 'auto');
	  } 
		else 
		{			
	  	let elementInfoBar = $("#element-info-bar");
	  	let height = elementInfoBar.outerHeight(true);
			height -= elementInfoBar.find('.collapsible-header').outerHeight(true);
			height -= elementInfoBar.find('.starRepresentationChoice-helper:visible').outerHeight(true);
			height -= elementInfoBar.find('.interactive-section:visible').outerHeight(true);
			height -= elementInfoBar.find(".menu-element").outerHeight(true);
			//height += 2;

	  	$('#element-info-bar .collapsible-body').css('height', height);
		}
	}	
}

