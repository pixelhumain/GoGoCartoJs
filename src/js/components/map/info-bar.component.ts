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

declare var $;

export class InfoBarComponent
{
	isVisible : boolean = false;

	elementVisible : Element = null;

	loaderTimer = null;

	onShow = new Event<number>();
	onHide = new Event<boolean>();

	getCurrElementId() : string { return this.elementVisible ? this.elementVisible.id : null; }

	get dom() { return $('#element-info-bar'); }
	get domMenu() { return this.dom.find('.menu-element'); }
	width() : string { return this.dom.width() + 'px'; }

	isDisplayedAside() { return this.dom.hasClass('display-aside'); }
	isDisplayedBottom() { return this.dom.hasClass('display-bottom'); }

	reload()
	{
		if (!this.isVisible) return;
		this.elementVisible.isFullyLoaded = false;
		this.showElement(this.elementVisible.id);
	}

	// App.infoBarComponent.showElement;
	showElement(elementId, callback = null) 
	{
		if (!App.config.infobar.activate) {
			App.stateManager.setState(AppStates.Normal);			
			return;
		}		

		let element = App.elementsModule.getElementById(elementId);		
		// console.log("showElement", element);
		
		// if element already visible
		if (this.elementVisible) this.elementVisible.marker.showNormalSize(true);
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

			this.dom.find('#element-info').html(this.elementVisible.component.render());	

			if (this.elementVisible.images.length) 
			{
				// Animation to move img-navigation-btn when scrolling
				this.dom.find('.collapsible-body-main-container').scroll(function(e) {
					let scrollTop = $(this).scrollTop();
					$(this).find('.img-navigation-btn.prev').css('left', -scrollTop/5);
					$(this).find('.img-navigation-btn.next').css('right', -scrollTop/5);
					$(this).find('.img-navigation-btn.next').css('top', scrollTop/2);
					$(this).find('.img-navigation-btn.prev').css('top', scrollTop/2);
					$(this).find('.img-overlay').css('opacity', 1 - scrollTop/200);
				});				
			}						

			this.elementVisible.component.initialize();	
			this.updateMenu();				

			this.dom.find('#btn-close-bandeau-detail').click(() => { this.hide(); return false; });
			
			this.dom.find('.collapsible-header').click(() => { this.toggleDetails(); });			
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

	displayAside()
	{
		this.dom.addClass('display-aside');
		this.dom.removeClass('display-bottom');
		this.updateMenu();
	}

	displayBottom()
	{
		this.dom.removeClass('display-aside');
		this.dom.addClass('display-bottom');	
		this.updateMenu();		
	}

	updateMenu()
	{
		if (!this.elementVisible) return;
		// on large screen info bar is displayed aside and so we have enough space
		// to show menu actions details in full text
		this.elementVisible.component.menuComponent.showFullTextMenu(this.isDisplayedAside());
	}

	show()
	{
		this.hideDetails();

		App.searchBarComponent.hideMobileSearchBar();		
		
		if (!this.isDisplayedAside())
		{
			this.dom.show();

			let elementInfoBar_newHeight = this.dom.find('#element-info').outerHeight(true);

			this.updateInfoBarSize();
			this.dom.stop(true).animate({'height': elementInfoBar_newHeight}, 350, 'swing', () => 
			{
				App.component.updateMapSize();
				this.checkIfMarkerStillVisible();		  		
			});
		}	
		else
		{
			if (!this.dom.is(':visible'))
			{
				this.dom.css('right','-' + this.width());			
				this.dom.show().stop(true).animate({'right':'0'},350,'swing', () => { 
					App.component.updateDirectoryContentMarginIfInfoBarDisplayedAside();
					this.checkIfMarkerStillVisible();
				});
			}
			
			this.updateInfoBarSize();
			this.showBodyMainTab();

			setTimeout( () => { 
				// just to be sure, put the right property to 0 few ms after
				this.dom.stop(true).css('right', '0'); 			
			}, 400);				
		}	

		this.isVisible = true;
	};	

	checkIfMarkerStillVisible()
	{
		// after infobar animation, we check if the marker 
		// is not hidded by the info bar
		setTimeout( () => {
			if (this.elementVisible && this.isCurrentMarkerNotVisibleOnMap() && App.state != AppStates.ShowDirections)
			{
				console.log("info bar marker not visible", AppStates[App.state]);
				App.mapComponent.panToLocation(this.elementVisible.position);
				this.elementVisible.marker.showBigSize();
				setTimeout( () => { this.elementVisible.marker.showBigSize(); }, 200);
				setTimeout( () => { this.elementVisible.marker.showBigSize(); }, 1000);
			}	
		}, 100);
	}

	private isCurrentMarkerNotVisibleOnMap()
	{
		let marker = this.elementVisible.marker.domMarker();
		return (App.mapComponent.isMapLoaded && !App.mapComponent.contains(this.elementVisible.position)) ||
		       (!this.isDisplayedAside() && marker && marker.offset() && (marker.offset().top > this.dom.offset().top - 50));
	}

	hide(humanAction : boolean = true)
	{
		if (!this.isDisplayedAside())
		{			
			this.hideDetails();
			this.dom.animate({'height': '0'}, 350, 'swing', () => 
			{
				App.component.updateMapSize();
				this.dom.hide();
			});
		}
		else
		{
			$('#directory-content-map').css('margin-right','0px');

			if (this.dom.is(':visible'))
			{		
				this.dom.animate({'right':'-500px'},350,'swing',function()
				{ 
					$(this).hide();  
	  			App.component.updateMapSize();
				});
			}		
		}

		if (humanAction) this.onHide.emit(true);		

		setTimeout( () => this.dom.find('#element-info').html(''), 350);

		if (this.elementVisible && this.elementVisible.marker) this.elementVisible.marker.showNormalSize(true);

		this.elementVisible = null;
		this.isVisible = false;		
	};

	get isDetailsVisible() { return this.dom.find('.moreDetails').is(':visible'); }

	toggleDetails()
	{	
		if (this.isDetailsVisible)
		{
			this.hideDetails();
			this.elementVisible.component.menuComponent.showFullTextMenu(false);
		}
		else
		{
			if (this.domMenu.width() >= this.domMenu.find('.menu-element-item:visible').length*100) this.elementVisible.component.menuComponent.showFullTextMenu(true);

			this.dom.find('.element-item').addClass('active');		
			this.dom.find('.moreDetails').show();	
			this.dom.find('.moreDetails.tabs').css('display','flex');		
			
			// show the expand label in header when interactive section is visible
			if (this.dom.find('.interactive-section').height() > 0 || this.dom.find('.info-bar-tabs').height() > 0) 
				this.dom.find('.expandLabel').removeClass('bgdSoftColorAs transform-big');

			this.dom.animate({'height':'100%'},400,'swing');

		   let height =  $('.gogocarto-container').height();
			height -= this.dom.find('.collapsible-header').outerHeight(true);			
			height -= this.dom.find('.interactive-section').outerHeight(true);	
			height -= this.dom.find(".menu-element").outerHeight(true);
			height -= this.dom.find(".info-bar-tabs").outerHeight(true);

		  this.dom.find('.collapsible-body').css('height', height);	

		  this.showBodyMainTab();
		  this.elementVisible.component.imagesComponent.verticalAlignCurrentImage();
		  App.gogoControlComponent.hide();
		}	
	};

	hideDetails()
	{
		App.gogoControlComponent.show();

		if (this.dom.find('.moreDetails').is(':visible'))
		{
			this.dom.find('.moreDetails').hide();
			this.dom.find('.element-item').removeClass('active');	

			let elementInfoBar_newHeight = this.dom.find('#element-info').outerHeight(true);

			this.dom.animate({'height': elementInfoBar_newHeight}, 400, 'swing');
		}	
	};

	updateInfoBarSize()
	{
		if (!this.isDisplayedAside()) this.dom.find('.moreDetails').css('height', 'auto');
		else 
		{			
		  	let elementInfoBar = this.dom;
		  	let height = elementInfoBar.outerHeight(true);
				height -= elementInfoBar.find('.collapsible-header').outerHeight(true);
				height -= elementInfoBar.find('.interactive-section:visible').outerHeight(true);
				height -= elementInfoBar.find('.info-bar-tabs:visible').outerHeight(true);
				height -= elementInfoBar.find(".menu-element").outerHeight(true);

		  	this.dom.find('.collapsible-body').css('height', height);
		}
	}	

	private showBodyMainTab() { this.dom.find('.info-bar-tabs').tabs('select_tab', 'body-main-tab-content'); }
}

