/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-12-13
 */
declare let $, jQuery : any;

import { AppModule } from "../app.module";
import { Category, Option } from "../modules/categories.module";
import { App } from "../gogocarto";

export class DirectoryMenuComponent
{	
	currentActiveMainOptionId = null;

	constructor()
	{
	}

	initialize()
	{	
		$('.btn-close-menu.large-screen').tooltip();
		$('.filter-menu .tooltipped').tooltip();

		// -------------------------------
		// --------- FAVORITE-------------
		// -------------------------------
		$('#filter-favorite').click(function(e : Event)
		{			
			let favoriteCheckbox = $('#favorite-checkbox');

			let checkValue = !favoriteCheckbox.is(':checked');

			App.filterModule.showOnlyFavorite(checkValue);
			App.elementModule.updateElementsToDisplay(!checkValue);

			favoriteCheckbox.prop('checked',checkValue);

			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();
		});

		// -------------------------------
		// --------- PENDING-------------
		// -------------------------------
		$('#filter-pending').click(function(e : Event)
		{
			
			let pendingCheckbox = $('#pending-checkbox');

			let checkValue = !pendingCheckbox.is(':checked');

			App.filterModule.showPending(checkValue);
			App.elementModule.updateElementsToDisplay(checkValue);

			pendingCheckbox.prop('checked',checkValue);

			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();
		});

		$('#show-only-pending').click(function(e : Event)
		{			
			let check = $('#show-only-pending').hasClass('gogo-icon-eye');
			App.filterModule.showOnlyPending(check);
			App.elementModule.updateElementsToDisplay(!check);

			if (check)
				$('#show-only-pending').removeClass('gogo-icon-eye').addClass('gogo-icon-no-eye');
			else
				$('#show-only-pending').removeClass('gogo-icon-no-eye').addClass('gogo-icon-eye');

			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();
		});


		// -------------------------------
		// ------ MAIN OPTIONS -----------
		// -------------------------------
		var that = this;

		$('.main-categories .main-icon').click( function(e)
		{
			let optionId = $(this).attr('data-option-id');
			that.setMainOption(optionId);
		});

		// follow main active option background when user scroll through main options
		$('.main-categories').on('scroll', () =>
		{
			$('#active-main-option-background').css('top', $('#main-option-gogo-icon-' + this.currentActiveMainOptionId).position().top);
		});

		

		// ----------------------------------
		// ------ CATEGORIES ----------------
		// ----------------------------------
		$('.subcategory-item .name-wrapper').click(function()
		{		
			let categoryId = $(this).attr('data-category-id');
			App.categoryModule.getCategoryById(categoryId).toggleChildrenDetail();
		});	

		$('.subcategory-item .checkbox-wrapper').click(function(e)
		{		
			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();

			let categoryId = $(this).attr('data-category-id');
			App.categoryModule.getCategoryById(categoryId).toggle();
			
		});			

		// Add surbrillance in main-categories sidebar filters menu whenn hovering a main category
		$('#main-option-all .gogo-icon-name-wrapper').hover( 
			function(e : Event) {
				let optionId = $(this).attr('data-option-id');
				let sidebarIcon = $('#main-option-gogo-icon-' + optionId);
				if (!sidebarIcon.hasClass('hover')) sidebarIcon.addClass('hover');
			},
			function(e : Event) {
				let optionId = $(this).attr('data-option-id');
				let sidebarIcon = $('#main-option-gogo-icon-' + optionId);
				sidebarIcon.removeClass('hover');
			}
		);
		// -------------------------------
		// ------ SUB OPTIONS ------------
		// -------------------------------
		$('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending) .gogo-icon-name-wrapper').click(function(e : Event)
		{
			let optionId = $(this).attr('data-option-id');
			let option = App.categoryModule.getOptionById(optionId);

			if (option.isMainOption()) App.directoryMenuComponent.setMainOption(option.id);
			else if (option.isCollapsible()) option.toggleChildrenDetail()
			else option.toggle();
		});

		$('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending) .checkbox-wrapper').click(function(e)
		{		
			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();

			let optionId = $(this).attr('data-option-id');
			App.categoryModule.getOptionById(optionId).toggle();
		});

	}

	setMainOption(optionId)
	{
		if (this.currentActiveMainOptionId == optionId) return;

		if (this.currentActiveMainOptionId != null) App.elementModule.clearCurrentsElement();

		let oldId = this.currentActiveMainOptionId;
		this.currentActiveMainOptionId = optionId;

		if (optionId == 'all')
		{
			$('#menu-subcategories-title').text("Tous les " + App.config.text.elementPlural);
			$('#open-hours-filter').hide();
		}
		else
		{
			let mainOption = App.categoryModule.getMainOptionById(optionId);				

			$('#menu-subcategories-title').text(mainOption.name);
			if (mainOption.showOpenHours) $('#open-hours-filter').show();
			else $('#open-hours-filter').hide();
		}

		this.updateMainOptionBackground();

		App.infoBarComponent.hide();

		//console.log("setMainOptionId " + optionId + " / oldOption : " + oldId);
		if (oldId != null) App.historyModule.updateCurrState();

		setTimeout( () => {
			App.elementListComponent.reInitializeElementToDisplayLength();
		
			App.boundsModule.updateFilledBoundsAccordingToNewMainOptionId();
			App.checkForNewElementsToRetrieve();
			App.elementModule.updateElementsToDisplay(true,true);
		}, 400);		
	}

	// the main option selected got a specific background, who can vertically translate
	updateMainOptionBackground()
	{
		let optionId = this.currentActiveMainOptionId;		

		$('.main-option-subcategories-container:not(#main-option-' + optionId + ')').hide();
		$('#main-option-' + optionId).fadeIn(400);

		$('.main-categories .main-icon').removeClass('active');
		$('#main-option-gogo-icon-' + optionId).addClass('active');

		if(!$('#main-option-gogo-icon-' + optionId).position()) { console.log("directory not loaded");return; }

		$('#active-main-option-background').animate({top: $('#main-option-gogo-icon-' + optionId).position().top}, 400, 'easeOutQuart');
	}
}






