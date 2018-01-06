/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates } from "../../app.module";
import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";

import { Event } from "../../classes/event.class";
import { createListenersForElementMenu, updateFavoriteIcon, showFullTextMenu } from "../element/element-menu.component";

import { createListenersForVoting } from "../modals/vote.component";

declare var $;

export class InfoBarComponent
{
	isVisible : boolean = false;
	isDetailsVisible = false;

	elementVisible : Element = null;

	loaderTimer = null;

	onShow = new Event<number>();
	onHide = new Event<boolean>();

	getCurrElementId() : string { return this.elementVisible ? this.elementVisible.id : null; }

	domMenu() { return $('#element-info-bar .menu-element'); }

	width() : string { return $('#element-info-bar').width() + 'px'; }

	isDisplayedAside()
	{
		return $('#element-info-bar').hasClass('display-aside');
	}

	// App.infoBarComponent.showElement;
	showElement(elementId, callback = null) 
	{
		let element = App.elementsModule.getElementById(elementId);		

		// console.log("showElement", element);

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
				element.updateWithJson(response);
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

			$('#element-info').html(element.component.render());		
			
			let domMenu = this.domMenu();

			createListenersForElementMenu(domMenu);	
			createListenersForVoting();

			setTimeout( () => { $('.info-bar-tabs').tabs(); }, 100);			

			updateFavoriteIcon(domMenu, element);			

			$('#btn-close-bandeau-detail').click(() =>
			{  		
				this.hide();
				return false;
			});
			
			$('#element-info .collapsible-header').click(() => {this.toggleDetails(); });
		}						
		
		this.show();		

		element.marker.showNormalHidden();
		element.marker.showBigSize();

		setTimeout( () => 
		{ 
			element.marker.showNormalHidden();
			element.marker.showBigSize();
		}, 500); 	

		this.onShow.emit(elementId);

		App.documentTitleModule.updateDocumentTitle();
	};	

	refresh()
	{		
		if (this.isVisible) {
			this.show();
			setTimeout( () => { this.show(); }, 200);
		}
	}

	show()
	{
		// on large screen info bar is displayed aside and so we have enough space
		// to show menu actions details in full text
		showFullTextMenu(this.domMenu(), this.isDisplayedAside());

		App.searchBarComponent.hideMobileSearchBar();		
		
		if (!this.isDisplayedAside())
		{
			$('#element-info-bar').show();

			let elementInfoBar_newHeight = $('#element-info').outerHeight(true);

			this.updateInfoBarSize();
			$('#element-info-bar').stop(true).animate({'height': elementInfoBar_newHeight}, 350, 'swing', () => 
			{
				App.component.updateMapSize();
				this.checkIfMarkerStillVisible();		  		
			});
		}	
		else
		{
			if (!$('#element-info-bar').is(':visible'))
			{
				$('#element-info-bar').css('right','-' + this.width());			
				$('#element-info-bar').show().stop(true).animate({'right':'0'},350,'swing', () => { 
					App.component.updateDirectoryContentMarginIfInfoBarDisplayedAside();
					this.checkIfMarkerStillVisible();
				});
			}
			
			this.updateInfoBarSize();
			this.showBodyMainTab();

			setTimeout( () => { 
				// just to be sure, put the right property to 0 few ms after
				$('#element-info-bar').stop(true).css('right', '0'); 			
			}, 400);				
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
				//console.log("map conatins element", App.mapComponent.contains(this.elementVisible.position));
				if (this.isCurrentMarkerVisibleOnMap())
				{
					App.mapComponent.panToLocation(this.elementVisible.position);
					this.elementVisible.marker.showBigSize();
					setTimeout( () => { this.elementVisible.marker.showBigSize(); }, 200);
					setTimeout( () => { this.elementVisible.marker.showBigSize(); }, 1000);
				}		
			}	
		}, 100);
	}

	private isCurrentMarkerVisibleOnMap()
	{
		return !App.mapComponent.contains(this.elementVisible.position) ||
		       (!this.isDisplayedAside() && (this.elementVisible.marker.domMarker().offset().top > $('#element-info-bar').offset().top - 50));
	}

	hide(humanAction : boolean = true)
	{
		if (!this.isVisible) return; 

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
			$('#helper-bar').css('margin-right','0px');

			if ($('#element-info-bar').is(':visible'))
			{		
				$('#element-info-bar').animate({'right':'-500px'},350,'swing',function()
				{ 
					$(this).hide();  
	  			App.component.updateMapSize();
				});
			}		
		}

		if (humanAction) this.onHide.emit(true);		

		setTimeout( () => $('#element-info').html(''), 350);

		if (this.elementVisible && this.elementVisible.marker) this.elementVisible.marker.showNormalSize(true);

		this.elementVisible = null;
		this.isVisible = false;		
	};

	toggleDetails()
	{	
		if ( $('#element-info-bar .moreDetails').is(':visible') )
		{
			this.hideDetails();
			showFullTextMenu(this.domMenu(), false);
			$('#helper-bar').css('z-index',20).animate({'opacity': '1'},500);
		}
		else
		{
			if (this.domMenu().width() >= 400) showFullTextMenu(this.domMenu(), true);

			$('#helper-bar').animate({'opacity': '0'},500).css('z-index',-1);

			$('#element-info-bar .element-item').addClass('active');		
			$('#element-info-bar .moreDetails').show();	
			$('#element-info-bar .moreDetails.tabs').css('display','flex');		
			
			$('#element-info-bar').animate({'height':'100%'},400,'swing');

			let elementInfoBar = $("#element-info-bar");
		  let height =  $('.gogocarto-container').height();
			height -= elementInfoBar.find('.collapsible-header').outerHeight(true);			
			height -= elementInfoBar.find('.interactive-section').outerHeight(true);	
			height -= elementInfoBar.find(".menu-element").outerHeight(true);

		  $('#element-info-bar .collapsible-body').css('height', height);	

		  this.showBodyMainTab();

		  App.gogoControlComponent.hide();
		}	
	};

	hideDetails()
	{
		App.gogoControlComponent.show();

		if ($('#element-info-bar .moreDetails').is(':visible'))
		{
			$('#element-info-bar .moreDetails').hide();
			$('#element-info-bar .element-item').removeClass('active');	

			let elementInfoBar_newHeight = $('#element-info').outerHeight(true);

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
			height -= elementInfoBar.find('.interactive-section:visible').outerHeight(true);
			height -= elementInfoBar.find('.info-bar-tabs:visible').outerHeight(true);
			height -= elementInfoBar.find(".menu-element").outerHeight(true);

	  	$('#element-info-bar .collapsible-body').css('height', height);
		}
	}	

	private showBodyMainTab() { $('#element-info-bar .info-bar-tabs').tabs('select_tab', 'body-main-tab-content'); }
}

