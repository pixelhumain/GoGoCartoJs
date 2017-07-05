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
declare let $ : any;

export class AppComponent
{
	private slideOptions = { duration: 500, easing: "easeOutQuart", queue: false, complete: function() {}};
	private matchMediaBigSize;

	initialize()
	{	
		this.updateComponentsSize();

		$('#btn-bandeau-helper-close').click(() => this.hideBandeauHelper());

		$('.flash-message .btn-close').click( function() { $(this).parent().slideUp('fast', function() { this.updateComponentsSize(); }); });

		$('#btn-close-directions').click( () => 
		{
			App.setState(AppStates.ShowElement, { id : App.infoBarComponent.getCurrElementId() });
		});

		let res;
		window.onresize = () =>
		{
		   if (res) {clearTimeout(res); }
		   res = setTimeout(this.updateComponentsSize(),200);
		};	
		
		//Menu CARTE	
		$('#show-directory-menu-button').click(() => this.showDirectoryMenu());
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

		if ($('.gogocarto-container').width() <= 600) this.hideDirectoryMenu();
		else this.showDirectoryMenu();
	}

	showDirectoryMenu()
	{
		if (!$('#directory-menu').is(':visible'))
		{
			$('#directory-menu').css('left','-' + $('#directory-menu').width() + 'px');	
			$('#directory-menu').show().animate({'left':'0'},350,'swing', () =>
			{ 
				$('#show-directory-menu-button').hide();
				$('.show-as-list-button').css('left', '30px');	
				$('#directory-content').css('margin-left', $('#directory-menu').width() + 'px'); 
				this.updateMapSize();
				this.updateComponentsSize();
			});					
		}
	}

	hideDirectoryMenu()
	{
		$('.btn-close-menu.large-screen').hideTooltip();

		$('#directory-content').css('margin-left','0');		
		$('#show-directory-menu-button').show();
		$('.show-as-list-button').css('left', '100px');

		$('#directory-menu').animate({'left': '-' + $('#directory-menu').width() + 'px'},250,'swing',function()
		{ 
			$(this).hide();
			App.component.updateMapSize(); 
			App.component.updateComponentsSize(); 
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
	
}





