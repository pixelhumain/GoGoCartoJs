declare let $: any;
import { Element, ElementStatus } from '../../classes/classes';
import { App } from '../../gogocarto';
import { AppModes } from '../../app.module';
import { AbstractModalComponent } from './abstract-modal.component';

export class VoteComponent extends AbstractModalComponent {
  constructor() {
    super('#modal-vote');
    this.ajaxUrl = App.config.features.vote.url;
    this.dom.find('#select-vote').material_select();
  }

  beforeOpen(element: Element) {
    // dynamically create vote template
    this.dom.find('.specific-content').html(
      App.templateModule.render('vote-modal-content', {
        element: this.element,
        ElementStatus: ElementStatus,
        isAdmin: App.config.isFeatureAvailable('directModeration'),
        eldisplayName: App.config.translate('element.definite'),
      })
    );
  }

  submit() {
    const voteValue = this.dom.find('.option-radio-btn:checked').attr('value');

    this.dom.find('#select-error').hide();

    if (voteValue) {
      const comment = this.dom.find('.input-comment').val();
      const route = App.config.features.vote.url;
      const data = {
        elementId: this.element.id,
        value: voteValue,
        comment: comment,
      };

      this.sendRequest(data);
    } else {
      this.clearLoader();
      this.dom.find('#select-error').show();
    }
  }

  protected onSuccess(response) {
    const responseMessage = response.message;
    const newstatus = response.data;

    if (!response.success) {
      this.onError(responseMessage);
      return;
    }

    $('#modal-vote').closeModal();

    if (this.element.status != newstatus) {
      this.element.status = newstatus;
      this.element.update(true);
      this.element.isFullyLoaded = false;

      // reload Element, and add flash message
      if (App.mode == AppModes.Map)
        App.infoBarComponent.showElement(this.element.id, () => {
          this.element.component.addFlashMessage(responseMessage);
        });
      else this.element.component.addFlashMessage(responseMessage);
    } else {
      this.element.component.addFlashMessage(responseMessage);
    }
  }

  protected onError(errorMessage) {
    if (!errorMessage || errorMessage.length == 0)
      errorMessage = "Oups, une erreur s'est produite ! Veuillez réessayer plus tard ou nous signaler le problème";
    this.dom.find('.generic-error-message').html(errorMessage).show();
  }
}
