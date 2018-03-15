/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

declare let grecaptcha;
declare var $ : any;
declare let Routing : any;

import { AppModule, AppStates, AppModes } from "../../app.module";
import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";

import { capitalize, slugify } from "../../utils/string-helpers";
import { openDeleteModal, openReportModal } from '../modals/reporting-deleting.component';
import { openPickAddressModal } from '../modals/pick-address.component';
import { createListenersForMarkAsResolved } from '../element/moderation.component';
import { createListenersForSendEmail } from '../modals/send-email.component';

export function updateFavoriteIcon(object, element : Element)
{
	if (!element.isFavorite) 
	{
		object.find('.item-add-favorite').show();
		object.find('.item-remove-favorite').hide();
	}	
	else 
	{
		object.find('.item-add-favorite').hide();
		object.find('.item-remove-favorite').show();
	}
}

export function showFullTextMenu(object, bool : boolean)
{
	if (bool)
	{
		object.addClass("full-text");
		object.find('.tooltipped').tooltip('remove');	
	}
	else
	{
		object.removeClass("full-text");
	}
}

export function createListenersForLongDescription(object)
{
	object.find('.show-more-description').click( function() { 
		let descriptionMore = $(this).siblings('.description-more');
		let textButton = descriptionMore.is(":visible") ? "Afficher plus" : "Afficher moins";
		descriptionMore.toggle();		
		$(this).text(textButton);
	});
}

export function createListenersForElementMenu(object)
{
	object.find('.tooltipped').tooltip();

	let element = App.elementsModule.getElementById(getCurrentElementIdShown());

	createListenersForMarkAsResolved();
	createListenersForSendEmail(object.parent(), element);

	// ----------------------
	//       DELETE
	// ----------------------
	object.find('.item-delete').click(function() 
	{		
		openDeleteModal();
	});

	// ----------------------
	//       REPORT
	// ----------------------
	object.find('.item-report').click(function() 
	{		
		openReportModal();
	});

	// ----------------------
	//     DIRECTIONS
	// ----------------------
	object.find('.item-directions').click(function() 
	{
		$(this).find('.menu-icon').hideTooltip();

		if (!App.geocoder.getLocation()) openPickAddressModal(element);
		else App.setState(AppStates.ShowDirections,{id: getCurrentElementIdShown()});
	});

	// ----------------------
	//     SHOW ON MAP
	// ----------------------
	object.find('.item-show-on-map').click(function() 
	{
		$(this).find('.menu-icon').hideTooltip();
		App.setState(AppStates.ShowElement ,{id: getCurrentElementIdShown()});
	});

	// ----------------------
	//         SHARE
	// ----------------------
	object.find('.item-share').click(function()
	{		
		let modal = $('#modal-share-element');

		modal.find(".modal-footer").attr('option-id',element.colorOptionId);

		let url;
		url = window.location.origin + window.location.pathname + App.routerModule.generate('show_element', { name :  capitalize(slugify(element.name)), id : element.id }, true);	

		modal.find('.input-simple-modal').val(url);
		modal.openModal({
	      dismissible: true, 
	      opacity: 0.5, 
	      in_duration: 300, 
	      out_duration: 200
   	});
	});	
	
	// ----------------------
	//        FAVORITE
	// ----------------------
	object.find('.item-add-favorite').click(function() 
	{
		App.favoriteModule.addFavorite(getCurrentElementIdShown());

		updateFavoriteIcon(object, element);

		if (App.mode == AppModes.Map)
		{
			element.marker.update();
			element.marker.animateDrop();
		}
		
	});
	
	object.find('.item-remove-favorite').click(function() 
	{		
		App.favoriteModule.removeFavorite(getCurrentElementIdShown());
		
		updateFavoriteIcon(object, element);

		if (App.mode == AppModes.Map) element.marker.update();
	});		
}

export function getCurrentElementIdShown() : string
{
	return getCurrentElementInfoBarShown().attr('data-element-id');
}

export function getCurrentElementInfoBarShown()
{
	if ( App.mode == AppModes.Map ) 
	{
		return $('#element-info-bar').find('.element-item');
	}
	return $('.element-item.active');
}
