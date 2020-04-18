declare let $: any;
import { App } from '../../gogocarto';
import { Element } from '../../classes/classes';

export class StampComponent {
  private dom;
  private element: Element;

  private stampId;
  private value = false; // whether the stamp is activated for this element or not

  constructor(dom: any, element: Element) {
    this.dom = $(dom);
    this.element = element;
    this.stampId = this.dom.data('stamp-id');
    this.setValue(this.element.stamps.indexOf(this.stampId) > -1, false);
    this.initialize();
  }

  private initialize() {
    this.dom.click(() => this.handleClick());
  }

  private handleClick() {
    const route = App.config.features.stamp.url;
    const data = {
      elementId: this.element.id,
      stampId: this.stampId,
      value: !this.value,
    };

    App.ajaxModule.sendRequest(route, 'post', data, (response) => {
      if (response.data) this.element.stamps = response.data;
      if (response.success) this.setValue(!this.value);
    });
  }

  setValue(value: boolean, $animate = true) {
    this.value = value;
    this.element.update(true);
    this.dom.toggleClass('filled', value);
    if ($animate && this.value) this.element.marker.animateDrop();
  }
}
