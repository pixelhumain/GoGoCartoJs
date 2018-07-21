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
import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";
import { capitalize } from "../../utils/string-helpers";
import { ModalAbstractComponent } from "./abstract.component";

export class ReportComponent extends ModalAbstractComponent
{
	constructor()
	{
		super("#modal-report");
		this.ajaxUrl = App.config.features.report.url;
	}

	beforeOpen()
	{
		this.dom.find('.elementName').text(capitalize(this.element.name));

		this.dom.find('.input-comment').val('');
		this.dom.find('.option-radio-btn:checked').prop('checked', false);
		this.dom.find('#select-error').hide();
		this.dom.find('#mail-error').hide();

		if (App.loginModule.getUserEmail()) 
		{
			this.dom.find('.input-mail').hide();
			this.dom.find('.input-mail').val(App.loginModule.getUserEmail());
		}
		else
		{
			this.dom.find('.input-mail').val('');
			this.dom.find('.input-mail').show();
		}
	}

	submit()
	{
		if (!this.element) return;

		let reportValue = this.dom.find('.option-radio-btn:checked').attr('value');
		let userEmail = this.dom.find('.input-mail').val();

		this.dom.find('#select-error').hide();
		this.dom.find('#mail-error').hide();

		let errors = false;
		if (!reportValue)
		{
			this.dom.find('#select-error').show();
			errors = true;
		}
		if (!userEmail || this.dom.find('.input-mail').hasClass('invalid'))
		{
			this.dom.find('#mail-error').show();
			errors = true;
		}
		if (!errors)
		{			
			let comment = this.dom.find('.input-comment').val();
			let route = App.config.features.report.url;
			let data =  { elementId: this.element.id, value: reportValue, comment: comment, userEmail : userEmail };

			this.sendRequest(data);		
		}	
	}

	protected onError(errorMessage)
	{
		this.dom.find('#select-error').text(errorMessage).show();
	}
}	
