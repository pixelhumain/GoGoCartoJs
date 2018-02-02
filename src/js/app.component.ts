/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

import { AppModule, AppStates, AppModes } from "./app.module";
import { App } from "./gogocarto";


//declare var $;
declare let $, window : any;

export class AppComponent
{
	inforBarAnimationTimer;

	constructor() {
		App.directoryMenuComponent.onShow.do( () => { this.handleDirectoryMenuShow() });
		App.directoryMenuComponent.onHide.do( () => { this.handleDirectoryMenuHide() });
	}

	initialize()
	{
		this.updateComponentsSize();

		let res;
		window.onresize = () =>
		{
		   if (res) { clearTimeout(res); }
		   res = setTimeout( () => { 
		   	console.log("On resize update component size");
		   	this.updateComponentsSize(); 
		   	App.directoryMenuComponent.updateSize();
		   },200);
		};	

		setTimeout( () => { this.updateComponentsSize(); }, 1000);	
		setTimeout( () => { this.updateComponentsSize(); }, 2000);
		setTimeout( () => { this.updateComponentsSize(); }, 3000);
	}

	handleDirectoryMenuShow()
	{		
		if (!this.isMobileScreen())
		{
			$('#directory-content').velocity({'margin-left': App.directoryMenuComponent.width}, {duration: 300, queue: false, easing: 'swing'});
			$('#map-gogo-controls').velocity({'padding-left': '10px'}, {duration: 300, queue: false, easing: 'swing'});
			$('.show-directory-menu-button').hide();
			setTimeout(() => { $('#directory-content').css('margin-left', App.directoryMenuComponent.width); }, 400);
		}	
		setTimeout( () => { App.mapComponent.resize() }, 400);
	}

	handleDirectoryMenuHide()
	{
		$('.show-directory-menu-button').fadeIn(200);
		$('#directory-content').velocity({'margin-left':'0'}, {duration: 100, queue: false, easing: 'swing'});		
		$('#map-gogo-controls').velocity({'padding-left': '0px'}, {duration: 100, queue: false, easing: 'swing'});
		setTimeout( () => { App.mapComponent.resize() }, 200);
	}	

	isMobileScreen() { return this.width() < 850; }

	mapWidth() { return $('#directory-content').width(); }

	width() { return $('.gogocarto-container').width(); }

	updateComponentsSize()
	{	
		App.directoryMenuComponent.updateSize();

		App.searchBarComponent.update();

		App.gogoControlComponent.updatePosition();

		let infoBarHasChangeDisplayMode = false;
		// show element info bar aside or at the bottom depending of direcoty-content width
		if (this.mapWidth() > 900)
		{
			if (!$('#element-info-bar').hasClass('display-aside'))
			{
				$('#element-info-bar').addClass('display-aside');
				$('#element-info-bar').removeClass('display-bottom');
				infoBarHasChangeDisplayMode = true;
			}			
		}	
		else
		{
			if (!$('#element-info-bar').hasClass('display-bottom'))
			{
				$('#element-info-bar').removeClass('display-aside');
				$('#element-info-bar').addClass('display-bottom');		
				infoBarHasChangeDisplayMode = true;
			}
			$('#directory-content-map').stop(true).css('margin-right', '0');
		}	

		if ($('#element-info-bar').hasClass('display-aside'))	
		{			
			let infoBarwidth = this.mapWidth() > 1100 ? '540px' : '470px';

			if (infoBarwidth == '470px') $('#element-info-bar').addClass('small-width');
			else $('#element-info-bar').removeClass('small-width');

			if (infoBarHasChangeDisplayMode)
				$('#element-info-bar').css('width', infoBarwidth);
			else
				$('#element-info-bar').animate({'width': infoBarwidth}, 350, "swing");
			
			this.updateDirectoryContentMarginIfInfoBarDisplayedAside(!infoBarHasChangeDisplayMode, infoBarwidth);
		}
		else
		{
			$('#element-info-bar').stop(true).css('width', '100%');
		}

		setTimeout( () => { App.infoBarComponent.refresh(); }, 100);

		if ($('#directory-menu').is(':visible') && !this.isMobileScreen())
		{
			setTimeout(function() { 
				$('#directory-content').css('margin-left', App.directoryMenuComponent.width);
			},0);		
		}
		else $('#directory-content').css('margin-left', 0);
	}

	updateDirectoryContentMarginIfInfoBarDisplayedAside(animate : boolean = false, width : string = App.infoBarComponent.width())
	{		
		if (!App.infoBarComponent.isVisible) return;

		if (animate) $('#directory-content-map').stop(true).animate({'margin-right': width}, 350, 'swing');
		else $('#directory-content-map').stop(true).css('margin-right', width);
		
		App.component.updateMapSize();
	}
	
	updateMapSize()
	{		
		if (!App.infoBarComponent.isDisplayedAside()) $('#directory-content-map').stop(true).css('margin-right', '0');
		if (App.mapComponent) setTimeout(function() { App.mapComponent.resize(); },0);
	}	
}





