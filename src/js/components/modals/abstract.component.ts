import { App } from "../../gogocarto";
import { Element } from "../../classes/classes";
declare var $ : any;

export class ModalAbstractComponent
{
	dom : any;
	element : Element;	
	protected ajaxUrl = "";

	constructor(dom : string)
	{
		this.dom = $(dom);
		this.initialize();
		this.binds();
	}

	protected initialize() {}

	protected binds()
	{
		this.dom.find('button[type=submit]').click((e) => this.handleSubmit(e));
	}

	open(element : Element)
	{		
		this.element = element;
		// console.log("openning modal", this.dom, this.element);
		this.beforeOpen(element);
		this.dom.openModal();
	}

	protected beforeOpen(element : Element) { }

	protected handleSubmit(e) 
	{
		if (!this.element) return;
		this.submit();
		e.stopPropagation();e.stopImmediatePropagation();e.preventDefault();
	}

	submit() {}

	protected sendRequest(data)
	{
		App.ajaxModule.sendRequest(this.ajaxUrl, 'post', data,
		  (response) => this.onSuccess(response),
		  (errorMessage) => this.onError(errorMessage)
		); 
	}

	protected onSuccess(response)
	{
		if (response.success)
		{
			this.dom.closeModal();
			this.element.component.addFlashMessage(response.message);
		}
		else
		{
			this.onError(response.message);
		}
	}

	protected onError(errorMessage)
	{
		this.dom.find('#message-error').text(errorMessage).show();
	}
}