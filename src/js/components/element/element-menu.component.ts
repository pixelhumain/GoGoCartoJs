declare let grecaptcha;
declare let $: any;
declare let Routing: any;

import { AppModule, AppStates, AppModes } from '../../app.module';
import { Element } from '../../classes/classes';
import { App } from '../../gogocarto';

import { capitalize, slugify } from '../../utils/string-helpers';
import { StampComponent } from './stamp.component';

export class ElementMenuComponent {
  private dom;
  private element: Element;

  constructor(dom: any, element: Element) {
    this.dom = $(dom);
    this.element = element;
    this.initialize();
    this.updateFavoriteIcon();
  }

  updateFavoriteIcon() {
    this.dom.find('.item-add-favorite').toggle(!this.element.isFavorite);
    this.dom.find('.item-remove-favorite').toggle(this.element.isFavorite);
  }

  checkDisplayFullText() {
    if (App.mode == AppModes.List && this.dom.width() > 750) this.showFullTextMenu(true);
    else {
      const fullText = this.dom.width() >= this.dom.find('.menu-element-item:visible').length * 130;
      this.showFullTextMenu(fullText);
    }
  }

  showFullTextMenu(bool: boolean) {
    if (bool) this.dom.addClass('full-text').find('.tooltipped').tooltip('remove');
    else this.dom.removeClass('full-text');
  }

  private initialize() {
    this.dom.find('.tooltipped').tooltip();
    const that = this;

    // STAMPS
    this.dom.find('.item-stamp').each(function () {
      new StampComponent(this, that.element);
    });

    // DELETE
    this.dom.find('.item-delete').click(() => {
      App.deleteComponent.open(this.element);
    });

    // REPORT
    this.dom.find('.item-report').click(() => {
      App.reportComponent.open(this.element);
    });

    // DIRECTIONS
    this.dom.find('.item-directions').click(() => {
      this.dom.find('.menu-icon').hideTooltip();

      if (!App.geocoder.getLocation()) App.pickAddressComponent.open(this.element);
      else App.setState(AppStates.ShowDirections, { id: this.element.id });
    });

    // SHOW ON MAP
    this.dom.find('.item-show-on-map').click(() => {
      this.dom.find('.menu-icon').hideTooltip();
      App.setState(AppStates.ShowElement, { id: this.element.id });
    });

    // SHARE
    this.dom.find('.item-share-url').click(() => {
      const modal = $('#modal-share-element');
      modal.find('.modal-footer').attr('option-id', this.element.colorOptionId);

      let url = window.location.origin + window.location.pathname;
      url += App.routerModule.generate('show_element', {
        name: capitalize(slugify(this.element.name)),
        id: this.element.id,
      });

      modal.find('.input-simple-modal').val(url);
      modal.openModal();
    });

    // FAVORITE
    this.dom.find('.item-add-favorite').click(() => {
      App.favoriteModule.addFavorite(this.element.id);
      this.updateFavoriteIcon();
      if (App.mode == AppModes.Map) {
        this.element.marker.update();
        this.element.marker.animateDrop();
      }
    });
    this.dom.find('.item-remove-favorite').click(() => {
      App.favoriteModule.removeFavorite(this.element.id);
      this.updateFavoriteIcon();
      if (App.mode == AppModes.Map) this.element.marker.update();
    });
  }
}
