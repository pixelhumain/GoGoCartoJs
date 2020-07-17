import { App } from '../../gogocarto';
import { AppStates } from '../../app.module';
import { Element } from '../../classes/classes';
import { AbstractModalComponent } from './abstract-modal.component';

declare let $: any;

export class PickAddressComponent extends AbstractModalComponent {
  constructor() {
    super('#modal-pick-address');
  }

  binds() {
    // button to confirm calculate idrections in modal pick address for directions
    this.dom.find('#btn-calculate-directions').click(() => this.submit());
    this.dom.find('input').keyup((e) => {
      if (e.keyCode == 13) this.submit();
    });
  }

  protected beforeOpen(element: Element) {
    this.dom.find('.modal-footer').attr('option-id', element.colorOptionId);
  }

  submit() {
    const address = this.dom.find('input').val();

    if (address) {
      App.setState(AppStates.ShowDirections, { id: this.element.id });

      App.geocoder.geocodeAddress(
        address,
        () => {
          this.dom.find('.modal-error-msg').hide();
          this.dom.closeModal();
        },
        () => {
          this.dom.find('.modal-error-msg').show();
        }
      );
    } else {
      this.dom.find('input').addClass('invalid');
    }
  }
}
