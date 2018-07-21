/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

declare var $ : any
import { Element, ElementStatus } from "../../classes/classes";
import { App } from "../../gogocarto";
import { AppModes } from "../../app.module";
import { ModalAbstractComponent } from "./abstract.component";

export class VoteComponent extends ModalAbstractComponent
{
	constructor() 
	{ 
		super("#modal-vote"); 
		this.ajaxUrl = App.config.features.vote.url;
      this.dom.find('#select-vote').material_select();	
	}

	beforeOpen(element : Element)
	{
		// dynamically create vote template
		this.dom.find('#vote-modal-content').html(App.templateModule.render('vote-modal-content', { 
			element: this.element, 
			ElementStatus: ElementStatus,
			isAdmin: App.config.isFeatureAvailable('directModeration'),
			eldisplayName: App.config.text.elementDefinite
		}));  
	}

	submit()
	{
		let voteValue = this.dom.find('.option-radio-btn:checked').attr('value');

		this.dom.find('#select-error').hide();
		
		if (voteValue)
		{				
			let comment = this.dom.find('.input-comment').val();
			let route = App.config.features.vote.url;
			let data = { elementId: this.element.id, value: voteValue, comment: comment };

			this.sendRequest(data);		
		}
		else
		{
			this.dom.find('#select-error').show();
		}
	}

	protected onSuccess(response)
	{
		let responseMessage = response.message;
		let newstatus = response.data;

		if (!response.success) {
			this.onError(responseMessage);
			return;
		}
		
		$('#modal-vote').closeModal();

		if (this.element.status != newstatus)
		{
			this.element.status = newstatus;
			this.element.update(true);
			this.element.isFullyLoaded = false;

			// reload Element, and add flash message
			if (App.mode == AppModes.Map) 
				App.infoBarComponent.showElement(this.element.id, () => {
					this.element.component.addFlashMessage(responseMessage);
				});
			else this.element.component.addFlashMessage(responseMessage);
		}
		else
		{
			this.element.component.addFlashMessage(responseMessage);
		}
	}

	protected onError(errorMessage)
	{
		this.dom.find('#select-error').text(errorMessage).show();
	}
}