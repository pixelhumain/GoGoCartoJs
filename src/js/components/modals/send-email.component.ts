declare let $: any;
import { Element } from '../../classes/classes';
import { App } from '../../gogocarto';
import { AbstractModalComponent } from './abstract-modal.component';
import { capitalize } from '../../utils/string-helpers';

export class SendEmailComponent extends AbstractModalComponent {
  constructor() {
    super('#modal-send-email');
    this.ajaxUrl = App.config.features.sendMail.url;
  }

  beforeOpen(element: Element) {
    this.dom.find('.elementName').text(capitalize(this.element.name));

    this.dom.find('.input-mail-content').val('');
    this.dom.find('.input-mail-subject').val('');
    this.dom.find('#content-error').hide();
    this.dom.find('#mail-error').hide();

    if (App.loginModule.getUserEmail()) {
      this.dom.find('.input-mail').hide();
      this.dom.find('.input-mail').val(App.loginModule.getUserEmail());
    } else {
      this.dom.find('.input-mail').val('');
      this.dom.find('.input-mail').show();
    }
  }

  submit() {
    const userEmail = this.dom.find('.input-mail').val();
    const mailSubject = this.dom.find('.input-mail-subject').val();
    const mailContent = this.dom.find('.input-mail-content').val();

    this.dom.find('#message-error').hide();
    this.dom.find('#content-error').hide();
    this.dom.find('#mail-error').hide();

    let errors = false;
    if (!mailSubject || !mailContent) {
      this.dom.find('#content-error').show();
      errors = true;
    }
    if (!userEmail || this.dom.find('.input-mail').hasClass('invalid')) {
      this.dom.find('#mail-error').show();
      this.dom.find('.input-mail').show();
      errors = true;
    }

    if (!errors) {
      const comment = this.dom.find('.input-comment').val();
      const data = {
        elementId: this.element.id,
        subject: mailSubject,
        content: mailContent,
        userEmail: userEmail,
      };
      this.sendRequest(data);
    } else {
      this.clearLoader();
    }
  }
}
