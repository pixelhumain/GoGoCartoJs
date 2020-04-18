import { App } from '../../gogocarto';
import { Element } from '../../classes/classes';
declare let $: any;

export class AbstractModalComponent {
  dom: any;
  element: Element;
  protected ajaxUrl = '';

  constructor(dom: string) {
    this.dom = $(dom);
    this.initialize();
    this.binds();
  }

  protected initialize() {}

  protected binds() {
    this.dom.find('button[type=submit]').click((e) => this.handleSubmit(e));
  }

  open(element: Element) {
    this.element = element;
    this.clearLoader();
    this.dom.find('.generic-error-message').hide();
    this.beforeOpen(element);
    this.dom.openModal();
  }

  protected beforeOpen(element: Element) {}

  protected handleSubmit(e) {
    if (!this.element) return;
    this.displayLoader();
    this.submit();
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  submit() {}

  protected sendRequest(data) {
    App.ajaxModule.sendRequest(
      this.ajaxUrl,
      'post',
      data,
      (response) => {
        setTimeout(() => this.clearLoader(), 500);
        this.onSuccess(response);
      },
      (errorMessage) => {
        this.clearLoader();
        this.onError(errorMessage);
      }
    );
  }

  protected displayLoader() {
    this.dom.find('.cancel-btn').css('display', 'inline-block');
    this.dom.find('button[type=submit]').hide();
    this.dom.find('.loader-overlay').fadeIn(800);
  }

  protected clearLoader() {
    this.dom.find('.cancel-btn').hide();
    this.dom.find('button[type=submit]').css('display', 'inline-block');
    this.dom.find('.loader-overlay').hide();
  }

  protected onSuccess(response) {
    if (response.success) {
      this.dom.closeModal();
      this.element.component.addFlashMessage(response.message);
    } else {
      this.onError(response.message);
    }
  }

  protected onError(errorMessage) {
    this.dom.find('#message-error').text(errorMessage).show();
  }
}
