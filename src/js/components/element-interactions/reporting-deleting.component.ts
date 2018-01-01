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
import { getCurrentElementIdShown, getCurrentElementInfoBarShown } from "../element/element-menu.component";
import { AjaxModule } from "../../modules/ajax.module";
import { ElementStatus } from "../../classes/element.class";

import { App } from "../../gogocarto";

import { capitalize } from "../../utils/string-helpers";

export function openReportModal()
{
	let element = App.elementsModule.getElementById(getCurrentElementIdShown());
	//window.console.log(element.name);
	$('#popup-report-error .elementName').text(capitalize(element.name));

	$('#popup-report-error .input-comment').val('');
	$('#popup-report-error .option-radio-btn:checked').prop('checked', false);
	$('#popup-report-error #select-error').hide();
	$('#popup-report-error #mail-error').hide();

	if (App.loginModule.getUserMail()) 
	{
		$('#popup-report-error .input-mail').hide();
		$('#popup-report-error .input-mail').val(App.loginModule.getUserMail());
	}
	else
	{
		$('#popup-report-error .input-mail').val('');
		$('#popup-report-error .input-mail').show();
	}

	$('#popup-report-error').openModal();
}

export function openDeleteModal()
{
	$('#popup-delete').openModal();

	let element = App.elementsModule.getElementById(getCurrentElementIdShown());
	//window.console.log(element.name);
	$('#popup-delete .elementName').text(capitalize(element.name));

	$('#popup-delete .input-comment').val('');
	$('#popup-delete .option-radio-btn:checked').prop('checked', false);
	$('#popup-delete #select-error').hide();
}

export function initializeReportingAndDeleting()
{
	$('#popup-report-error #submit-report').click(() => 
	{
			let reportValue = $('#popup-report-error .option-radio-btn:checked').attr('value');
			let userMail = $('#popup-report-error .input-mail').val();

			$('#popup-report-error #select-error').hide();
			$('#popup-report-error #mail-error').hide();

			let errors = false;
			if (!reportValue)
			{
				$('#popup-report-error #select-error').show();
				errors = true;
			}
			if (!userMail || $('#popup-report-error .input-mail').hasClass('invalid'))
			{
				$('#popup-report-error #mail-error').show();
				errors = true;
			}
			if (!errors)
			{			
				let elementId = getCurrentElementIdShown();	
				let comment = $('#popup-report-error .input-comment').val();				

				//console.log("send report " +reportValue + " to element id ", elementId);

				let route = App.config.features.report.url;
				let data =  { elementId: elementId, value: reportValue, comment: comment, userMail : userMail };

				App.ajaxModule.sendRequest(route, 'post', data, (response) =>
				{
					let success = response.success;
					let responseMessage = response.message;

					if (success)
					{
						$('#popup-report-error').closeModal();
						let elementInfo = getCurrentElementInfoBarShown();
						elementInfo.find('.result-message').html(responseMessage).show();
						App.infoBarComponent.show();
					}
					else
					{
						$('#popup-report-error #select-error').text(responseMessage).show();
					}
				},
				(errorMessage) => 
				{
					$('#popup-report-error #select-error').text(errorMessage).show();
				});			
			}	
	});

	$('#popup-delete #submit-delete').click(() => 
	{
			let elementId = getCurrentElementIdShown();	
			let message = $('#popup-delete .input-comment').val();

			let route = App.config.features.delete.url;
			let data = { elementId: elementId, message: message };

			App.ajaxModule.sendRequest(route, 'post', data, (response) =>
			{
				let responseMessage = response.message;
				let success = response.success;

				if (success)
				{
					let element = App.elementById(elementId);

					$('#popup-delete').closeModal();
					let elementInfo = getCurrentElementInfoBarShown();
					App.infoBarComponent.show();

					element.update(true);
	        element.isFullyLoaded = false;

	        // reload Element, and add flash message
	        App.infoBarComponent.showElement(element.id, () => {
	          addFlashMessage(responseMessage);
	        });

	        addFlashMessage(responseMessage);
				}
				else
				{
					$('#popup-delete #select-error').text(responseMessage).show();
				}
			},
			(errorMessage) => 
			{
				console.log("error", errorMessage);
				$('#popup-delete #select-error').text(errorMessage).show();
			});	
	});
}

function addFlashMessage(message)
{
  let elementInfo = getCurrentElementInfoBarShown();
  elementInfo.find(".moderation-section").find('.basic-message').hide(); 
  elementInfo.find('.result-message').html(message).show();
  App.infoBarComponent.show();
}

