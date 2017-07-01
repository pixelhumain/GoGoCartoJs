/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-12-13
 */

declare let grecaptcha;
declare var $ : any;
declare let Routing : any;

import { AppModule, AppStates, AppModes } from "../app.module";
import { getCurrentElementIdShown, getCurrentElementInfoBarShown } from "./element-menu.component";
import { AjaxModule } from "../modules/ajax.module";
import { updateInfoBarSize } from "../app-interactions";
import { ElementStatus } from "../classes/element.class";

import { App } from "../gogocarto";

import { capitalize, slugify } from "../commons/commons";

export function initializeVoting()
{	
	//console.log("initialize vote");	

	// open a modal containing description of the validation process
	$(".validation-process-info").click( (e) => 
	{
		$("#popup-vote").openModal();	
		e.stopPropagation();
  	e.stopImmediatePropagation();
  	e.preventDefault();
	});	

	$('#modal-vote #submit-vote').click(() => 
	{
		let voteValue = $('#modal-vote .option-radio-btn:checked').attr('value');

		$('#modal-vote #select-error').hide();
		
		if (voteValue)
		{			
			let elementId = getCurrentElementIdShown();	
			let comment = $('#modal-vote .input-comment').val();

			console.log("send vote " +voteValue + " to element id ", elementId);

			App.ajaxModule.vote(elementId, voteValue, comment, (response) =>
			{				
				let responseMessage = response.message;
				let newstatus = response.data;
				let success = response.success;

				if (success)
				{
					let element = App.elementById(elementId);

					$('#modal-vote').closeModal();

					if (element.status != newstatus)
					{
						element.status = newstatus;
						element.update(true);
						element.isFullyLoaded = false;

						// reload Element, and add flash message
						App.infoBarComponent.showElement(element.id, () => {
							addFlashMessage(responseMessage);
						});
					}
					else
					{
						addFlashMessage(responseMessage);
					}					
				}
				else
				{
					$('#modal-vote #select-error').text(responseMessage).show();
				}
			},
			(errorMessage) => 
			{
				$('#modal-vote #select-error').text(errorMessage).show();
			});			
		}
		else
		{
			$('#modal-vote #select-error').show();
		}
	});
}

export function createListenersForVoting()
{
	// vote-button is located on the element-info-bar of a pending element
	$(".vote-button").click( function(e)
	{
		// restrict vote to logged users
		if (!App.loginModule.isUserLogged()) 
		{
			App.loginModule.loginAction();
			return;
		}
		else
		{
			let element = App.elementModule.getElementById(getCurrentElementIdShown());

			// dynamically create vote template
			$('#vote-modal-content').html(App.templateModule.render('vote-modal-content', { 
				element: element, 
				ElementStatus: ElementStatus, 
				isAdmin: App.loginModule.isAdmin() 
			}));

			$('#modal-vote').openModal({
		    dismissible: true, 
		    opacity: 0.5, 
		    in_duration: 300, 
		    out_duration: 200
			});	
		}			

		e.stopPropagation();
		e.stopImmediatePropagation();
  	e.preventDefault();
	});
}

function addFlashMessage(message)
{
	let elementInfo = getCurrentElementInfoBarShown();
	elementInfo.find(".vote-section").find('.basic-message').hide();	
	elementInfo.find('.result-message').html(message).show();
	App.infoBarComponent.show();
}

