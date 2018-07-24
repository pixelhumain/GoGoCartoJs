declare var $ : any
import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";
import { capitalize } from "../../utils/string-helpers";
import { AbstractModalComponent } from "./abstract-modal.component";

export class DeleteComponent extends AbstractModalComponent
{
	constructor()
   {
     super("#modal-delete");
     this.ajaxUrl = App.config.features.delete.url;
   }

	beforeOpen(element : Element)
	{
		this.dom.find('.elementName').text(capitalize(element.name));
		this.dom.find('.input-comment').val('');
		this.dom.find('.option-radio-btn:checked').prop('checked', false);
		this.dom.find('#select-error').hide();
	}

	submit()
	{
		let message = this.dom.find('.input-comment').val();
		let route = App.config.features.delete.url;
		let data = { elementId: this.element.id, message: message };

		this.sendRequest(data);
	}

	protected onSuccess(response)
	{
		let responseMessage = response.message;
		let success = response.success;

		if (success)
		{
			this.dom.closeModal();
			App.infoBarComponent.show();

			this.element.update(true);
			this.element.isFullyLoaded = false;

			// reload Element, and add flash message
			App.infoBarComponent.showElement(this.element.id, () => {
				this.element.component.addFlashMessage(responseMessage);
			});

			this.element.component.addFlashMessage(responseMessage);
		}
		else
		{
			this.dom.find('#select-error').text(responseMessage).show();
		}
	}

	protected onError(message)
	{
		this.dom.find('#select-error').text(message).show();
	}
}