declare let $: any;
import { Element } from '../../classes/classes';
import { App } from '../../gogocarto';
import { capitalize } from '../../utils/string-helpers';
import { AbstractModalComponent } from './abstract-modal.component';

export class ReportComponent extends AbstractModalComponent {
  constructor() {
    super('#modal-report');
    this.ajaxUrl = App.config.features.report.url;
  }

  beforeOpen() {
    this.dom.find('.elementName').text(capitalize(this.element.name));

    this.dom.find('.input-comment').val('');
    this.dom.find('.option-radio-btn:checked').prop('checked', false);
    this.dom.find('#select-error').hide();
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
    if (!this.element) return;

    const reportValue = this.dom.find('.option-radio-btn:checked').attr('value');
    const userEmail = this.dom.find('.input-mail').val();

    this.dom.find('#select-error').hide();
    this.dom.find('#mail-error').hide();

    let errors = false;
    if (!reportValue) {
      this.dom.find('#select-error').show();
      errors = true;
    }
    if (!userEmail || this.dom.find('.input-mail').hasClass('invalid')) {
      this.dom.find('#mail-error').show();
      errors = true;
    }
    if (!errors) {
      const comment = this.dom.find('.input-comment').val();
      const route = App.config.features.report.url;
      const data = {
        elementId: this.element.id,
        value: reportValue,
        comment: comment,
        userEmail: userEmail,
      };

      this.sendRequest(data);
    } else {
      this.clearLoader();
    }
  }

  protected onError(errorMessage) {
    this.dom.find('#select-error').text(errorMessage).show();
  }
}
