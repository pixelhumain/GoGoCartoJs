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

		// update iframe code when params change
		$('#modal-iframe .iframe-param').change( () => { this.updateIframeCode(); });

		$('#change-layers, #export-iframe-btn').tooltip();

		let res;
		window.onresize = () =>
		{
		   if (res) {clearTimeout(res); }
		   res = setTimeout(this.updateComponentsSize(),200);
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
			$('.show-directory-menu-button').hide();
			$('#directory-menu').css('left','-' + $('#directory-menu').width() + 'px');	
			$('#directory-content').animate({'margin-left': '340px'}, 350,'swing');
			$('#map-gogo-controls').animate({'padding-left': '10px'}, 350,'swing');
			$('#directory-menu').show().animate({'left':'0'},350,'swing', () =>
			{ 							
				this.updateMapSize();
				this.updateComponentsSize();
				App.directoryMenuComponent.updateMainOptionBackground();
			});					
		}

		this.updateDirectoryMenuSize()
	}

	hideDirectoryMenu()
	{
		$('.btn-close-menu.large-screen').hideTooltip();

		$('#directory-content').animate({'margin-left':'0'}, 200,'swing');		
		$('.show-directory-menu-button').show();
		$('#map-gogo-controls').animate({'padding-left': '0px'}, 350,'swing');
		$('#directory-menu').animate({'left': '-' + $('#directory-menu').width() + 'px'},250,'swing',function()
		{ 
			$(this).hide();
			App.component.updateMapSize(); 
			App.component.updateComponentsSize(); 
			$(this).find('.tooltipped').tooltip('remove');	
		});
	}	

	hideBandeauHelper()
	{
		$('#bandeau_helper').slideUp(this.slideOptions);
	}

	updateComponentsSize()
	{	
		// show element info bar aside or at the bottom depending of direcoty-content width
		if ($('#directory-content').width() > 1200)
		{
			if (!$('#element-info-bar').hasClass('display-aside'))
			{
				$('#element-info-bar').addClass('display-aside');
				$('#element-info-bar').removeClass('display-bottom');
				App.infoBarComponent.refresh();
			}			
		}	
		else
		{
			if (!$('#element-info-bar').hasClass('display-bottom'))
			{
				$('#element-info-bar').removeClass('display-aside');
				$('#element-info-bar').addClass('display-bottom');
				$('#directory-content-map').css('margin-right', '0');
				App.infoBarComponent.refresh();
			}
		}		
	}
	
	// the leaflet map need to be resized with a specific function
	updateMapSize()
	{		
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
		console.log("update iframe");
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





