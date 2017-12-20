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

import { AppModule, AppStates, AppModes } from "../app.module";
import { Element } from "../classes/element.class";
import { App } from "../gogocarto";

import { capitalize, slugify } from "../commons/commons";
import { openDeleteModal, openReportModal } from './reporting-deleting.component';
import { createListenersForMarkAsResolved } from './moderation.component';

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
		object.find('.tooltipped').tooltip();	
	}
}

export function createListenersForElementMenu(object)
{
	object.find('.tooltipped').tooltip();

	createListenersForMarkAsResolved();

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

		let element = App.elementModule.getElementById(getCurrentElementIdShown());

		if (App.state !== AppStates.Constellation && !App.geocoder.getLocation())
		{
			let modal = $('#modal-pick-address');
			modal.find(".modal-footer").attr('option-id',element.colorOptionId);			
			
			modal.openModal({
	      dismissible: true, 
	      opacity: 0.5, 
	      in_duration: 300, 
	      out_duration: 200,
   		});
		}
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
		let element = App.elementModule.getElementById(getCurrentElementIdShown());
		
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
		let element = App.elementModule.getElementById(getCurrentElementIdShown());
		App.elementModule.addFavorite(getCurrentElementIdShown());

		updateFavoriteIcon(object, element);

		if (App.mode == AppModes.Map)
		{
			element.marker.update();
			element.marker.animateDrop();
		}
		
	});
	
	object.find('.item-remove-favorite').click(function() 
	{
		let element = App.elementModule.getElementById(getCurrentElementIdShown());
		App.elementModule.removeFavorite(getCurrentElementIdShown());
		
		updateFavoriteIcon(object, element);

		if (App.mode == AppModes.Map) element.marker.update();
	});	

	// ----------------------
	//         MAIL
	// ----------------------
	object.parent().find('.send-mail-btn').click(function()
	{
		let element = App.elementModule.getElementById(getCurrentElementIdShown());
		$('#popup-send-mail .elementName').text(capitalize(element.name));

		$('#popup-send-mail .input-mail-content').val('');
		$('#popup-send-mail .input-mail-subject').val('');
		$('#popup-send-mail #content-error').hide();
		$('#popup-send-mail #mail-error').hide();

		if (App.loginModule.getUserMail())
		{
			$('#popup-send-mail .input-mail').hide();
			$('#popup-send-mail .input-mail').val(App.loginModule.getUserMail());
		}
		else
		{
			$('#popup-send-mail .input-mail').val('');
			$('#popup-send-mail .input-mail').show();
		}

		$('#popup-send-mail').openModal();
	});
}

export function initializeElementMenu()
{	
	$('#modal-vote #select-vote').material_select();

	// button to confirm calculate idrections in modal pick address for directions
	$('#modal-pick-address #btn-calculate-directions').click(() => handleDirectionsPickingAddress());
	$('#modal-pick-address input').keyup((e) => { if(e.keyCode == 13) handleDirectionsPickingAddress(); });

	$('#popup-send-mail #submit-mail').click(() => { handleSubmitMail(); });
}

function handleDirectionsPickingAddress()
{
	let address = $('#modal-pick-address input').val();
		
	if (address)
	{			
		App.setState(AppStates.ShowDirections,{id: getCurrentElementIdShown()});

		App.geocoder.geocodeAddress(address,
		() => {
			$("#modal-pick-address .modal-error-msg").hide();
			$('#modal-pick-address').closeModal();				
		},
		() => {
			$("#modal-pick-address .modal-error-msg").show();
		});			
	}
	else
	{
		$('#modal-pick-address input').addClass('invalid');
	}
}

function handleSubmitMail()
{	
	let userMail = $('#popup-send-mail .input-mail').val();
	let mailSubject = $('#popup-send-mail .input-mail-subject').val();
	let mailContent = $('#popup-send-mail .input-mail-content').val();

	$('#popup-send-mail #message-error').hide();
	$('#popup-send-mail #content-error').hide();
	$('#popup-send-mail #mail-error').hide();

	let errors = false;
	if (!mailSubject || !mailContent)
	{
		$('#popup-send-mail #content-error').show();
		errors = true;
	}
	if (!userMail || $('#popup-send-mail .input-mail').hasClass('invalid'))
	{
		$('#popup-send-mail #mail-error').show();
		$('#popup-send-mail .input-mail').show();
		errors = true;
	}
	if (!errors)
	{			
		let elementId = getCurrentElementIdShown();	
		let comment = $('#popup-send-mail .input-comment').val();				

		let route = App.config.features.sendMail.url;
		let data = { elementId: elementId, subject: mailSubject, content: mailContent, userMail : userMail };

		App.ajaxModule.sendRequest(route, 'post', data, (response) =>
		{
			let success = response.success;
			let responseMessage = response.message;

			if (success)
			{
				$('#popup-send-mail').closeModal();
				let elementInfo = getCurrentElementInfoBarShown();
				elementInfo.find('.result-message').html(responseMessage).show();
				App.infoBarComponent.show();
			}
			else
			{
				$('#popup-send-mail #message-error').text(responseMessage).show();
			}
		},
		(errorMessage) => 
		{
			$('#popup-send-mail #message-error').text(errorMessage).show();
		});			
	}	
}

export function getCurrentElementIdShown() : number
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
