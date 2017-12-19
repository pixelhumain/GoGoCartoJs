/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-12-13
 */

import { AppModule, AppStates, AppModes } from "./app.module";
import { App } from "./gogocarto";


//declare var $;
declare let $, window : any;

export class AppComponent
{
	inforBarAnimationTimer;
	sideNavInitialized = false;

	private slideOptions = { duration: 500, easing: "easeOutQuart", queue: false, complete: function() {}};

	initialize()
	{	
		this.updateComponentsSize();

		$('#btn-bandeau-helper-close').click(() => this.hideBandeauHelper());

		$('.flash-message .btn-close').click( function() { $(this).parent().slideUp('fast', function() { this.updateComponentsSize(); }); });

		$('#btn-close-directions').click( () => 
		{
			App.setState(AppStates.ShowElement, { id : App.infoBarComponent.getCurrElementId() });
		});

		$('#export-iframe-btn').click( () => 
		{ 
			$('#export-iframe-btn').hideTooltip();
			this.updateIframeCode();
			$('#modal-iframe').openModal(); 
		});

		$('#map-default-view-btn').click( () =>
		{
			App.geocoder.geocodeAddress('', (result) => { 
        App.mapComponent.fitBounds(App.geocoder.getBounds(), true); 
      }); 
		});

		$('#geolocalize-btn').click( () =>
		{
			App.searchBarComponent.geolocateUser();
		});

		// update iframe code when params change
		$('#modal-iframe .iframe-param').change( () => { this.updateIframeCode(); });

		$('.layers-button').tooltip();

		let res;
		window.onresize = () =>
		{
		   if (res) { clearTimeout(res); }
		   res = setTimeout( () => { console.log("On resize update component size");this.updateComponentsSize(); },200);
		   // this.updateComponentsSize();
		};	

		// on resize end
		$(window).bind('resize', (e) =>
		{
		    window.resizeEvt;
		    $(window).resize(() =>
		    {
		        clearTimeout(window.resizeEvt);
		        window.resizeEvt = setTimeout(() =>
		        {
		            this.updateDirectoryMenuSize();
		        }, 250);
		    });
		});
		
		//Menu CARTE	
		$('.show-directory-menu-button').click((e) => { this.showDirectoryMenu(); e.preventDefault();e.stopPropagation();});
		$('#map-overlay').click(() => this.hideDirectoryMenu());
		$('#directory-menu .btn-close-menu').click(() => this.hideDirectoryMenu());

		$('#directory-content-map .show-as-list-button').click((e : Event) => {		
			App.setTimeoutClicking();
			App.setMode(AppModes.List);

			e.preventDefault();
			e.stopPropagation();
		});

		$('#directory-content-list .show-as-map-button').click(() => {		
			App.setMode(AppModes.Map);
		});

		if ($('.gogocarto-container').width() <= 850) this.hideDirectoryMenu();
		else this.showDirectoryMenu();
	}

	showDirectoryMenu()
	{	
		if (!$('#directory-menu').is(':visible'))
		{			
			if (this.pagewidth() > 850) $('.show-directory-menu-button').hide();
			$('#directory-menu').css('left','-' + App.directoryMenuComponent.width());	
			$('#directory-content').animate({'margin-left': App.directoryMenuComponent.width()}, 350,'swing');
			$('#map-gogo-controls').animate({'padding-left': '10px'}, 350,'swing');
			$('#directory-menu').show().animate({'left':'0'},350,'swing', function()
			{ 				
				$(this).trigger('open');			
			});					
		}

		this.updateDirectoryMenuSize()
	}

	hideDirectoryMenu()
	{
		$('.show-directory-menu-button').show();
		$('#directory-content').animate({'margin-left':'0'}, 200,'swing');		
		$('#map-gogo-controls').animate({'padding-left': '0px'}, 350,'swing');
		$('#directory-menu').animate({'left': '-' + $('#directory-menu').width() + 'px'},250,'swing',function()
		{ 
			$(this).trigger('hide');			
		});
	}	

	hideBandeauHelper()
	{
		$('#bandeau_helper').slideUp(this.slideOptions);
	}

	mapWidth() { return $('#directory-content').width(); }
	pagewidth() { return $('.gogocarto-container').width(); }

	updateComponentsSize()
	{	
		let menuwidth = this.pagewidth() > 850 ? this.pagewidth() > 1450 ? '340px' : '310px' : '100%';
		$('#directory-menu').css('width', menuwidth);
		if (menuwidth == '310px') $('#directory-menu').addClass('small-width');
		else $('#directory-menu').removeClass('small-width');

		// initialize sidenav open/hide by swip touch
		if (!this.sideNavInitialized && this.pagewidth() <= 850) 
		{
			$('#directory-menu').sideNav({
	      menuWidth: $('#directory-menu').width(),
	      edge: 'left',
	      closeOnClick: false, 
	      draggable: true, 
	    });
	    this.sideNavInitialized = true;
		}		

		let infoBarHasChangeDisplayMode = false;
		// show element info bar aside or at the bottom depending of direcoty-content width
		if (this.mapWidth() > 900)
		{
			if (!$('#element-info-bar').hasClass('display-aside'))
			{
				$('#element-info-bar').addClass('display-aside');
				$('#element-info-bar').removeClass('display-bottom');
				App.infoBarComponent.refresh();
				infoBarHasChangeDisplayMode = true;
			}			
		}	
		else
		{
			if (!$('#element-info-bar').hasClass('display-bottom'))
			{
				$('#element-info-bar').removeClass('display-aside');
				$('#element-info-bar').addClass('display-bottom');				
				App.infoBarComponent.refresh();
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
			$('#element-info-bar').stop(true).css('width', 'auto');
		}

		if ($('#directory-menu').is(':visible') && this.pagewidth() > 850)
		{
			setTimeout(function() { 
				$('#directory-content').css('margin-left', App.directoryMenuComponent.width());
			},0);		
		}
		else $('#directory-content').css('margin-left', 0);
	}

	updateDirectoryContentMarginIfInfoBarDisplayedAside(animate : boolean = false, width : string = App.infoBarComponent.width())
	{		
		if (!App.infoBarComponent.isVisible) return;
		if (animate)
		{
			$('#directory-content-map').stop(true).animate({'margin-right': width}, 350, 'swing');
			$('#bandeau_helper').stop(true).animate({'margin-right': width}, 350, 'swing');
		}
		else
		{
			$('#directory-content-map').stop(true).css('margin-right', width);
			$('#bandeau_helper').stop(true).css('margin-right', width);
		}
		
		App.component.updateMapSize();
	}
	
	// the leaflet map need to be resized with a specific function
	updateMapSize()
	{		
		if (!App.infoBarComponent.isDisplayedAside()) $('#directory-content-map').stop(true).css('margin-right', '0');
		if (App.mapComponent) setTimeout(function() { App.mapComponent.resize(); },0);
	}

	// fixs menu overflow scrollable depending on screen height
	updateDirectoryMenuSize()
	{
		let filterMenu = $('#directory-menu-main-container .filter-menu');
		let menuContainer = $('#directory-menu-main-container .directory-menu-content');

		filterMenu.css('height', '100%');

		if (filterMenu.height() < menuContainer.height()) 
		{
			filterMenu.css('height', 'auto');
		} 
	}

	updateIframeCode()
	{
		let src = window.location.origin + window.location.pathname;
		src += window.location.search.length > 0 ? window.location.search + '&' : '?';
		src += 'iframe=1';
		if ($('#part-taxonomy-checkbox').is(':checked')) src += '&fullTaxonomy=0';
		src += window.location.hash;

		let width = $('#iframe-width').val() ? $('#iframe-width').val() : '800';
		let height = $('#iframe-height').val() ? $('#iframe-height').val() : '600';

		let iframeCode = `<iframe width="${width}" height="${height}" src="${src}" frameborder="0" marginheight="0" marginwidth="0"></iframe>`
		$('#modal-iframe #iframe-code').val(iframeCode);
	}
	
}





