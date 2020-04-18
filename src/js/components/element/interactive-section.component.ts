declare let $: any;
import { App } from '../../gogocarto';
import { Element, ElementStatus } from '../../classes/classes';

export class InteractiveSectionComponent {
  private dom;
  private element: Element;

  constructor(dom: any, element: Element) {
    this.dom = $(dom);
    this.element = element;
    this.initialize();
  }

  addFlashMessage(message) {
    this.dom.find('.moderation-section').find('.basic-message').hide();
    this.dom.find('.result-message').html(message).show();
    App.infoBarComponent.show();
  }

  private initialize() {
    // open a modal containing description of the validation process
    this.dom.find('.validation-process-info').click((e) => {
      $('#modal-contribution').openModal();
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    this.dom.find('.vote-button').click((e) => {
      // restrict vote to specific roles
      if (!App.config.isFeatureAvailable('vote')) {
        App.loginModule.loginAction();
        return;
      } else {
        App.voteComponent.open(this.element);
      }

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });
  }
}
