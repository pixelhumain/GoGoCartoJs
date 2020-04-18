declare let $, jQuery: any;

import { AppModule, AppModes } from '../app.module';
import { App } from '../gogocarto';

export class GoGoControlComponent {
  initialize() {
    $('.show-directory-menu-button, #mobile-filters-icon').click((e) => {
      App.directoryMenuComponent.show();
      e.preventDefault();
      e.stopPropagation();
    });
    $('#directory-menu .btn-close-menu').click(() => App.directoryMenuComponent.hide());

    $('.show-as-list-button').click((e: Event) => {
      App.mapManager.setTimeoutClicking();
      App.setMode(AppModes.List);
      e.preventDefault();
      e.stopPropagation();
    });

    $('#mobile-search-icon').click((e) => {
      App.searchBarComponent.showMobileSearchBar();
      e.preventDefault();
      e.stopPropagation();
    });

    $('.show-as-map-button').click(() => {
      App.setMode(AppModes.Map);
    });
  }

  updatePosition() {
    if (!App.mode) return;

    if (App.mode == AppModes.Map) {
      const top = 15 + $('.search-results:visible').height();
      $('#gogo-controls-mobile').velocity(
        { top: top, right: 0 },
        { duration: 250, queue: false, easing: 'easeOutQuad' }
      );
      $('#gogo-controls-mobile').addClass('map').removeClass('list');
    } else {
      const top = $('#directory-content').height() - $('#gogo-controls-mobile').height() - 5;
      $('#gogo-controls-mobile').velocity(
        { top: top, right: 15 },
        { duration: 250, queue: false, easing: 'easeOutQuad' }
      );
      $('#gogo-controls-mobile').addClass('list').removeClass('map');
    }
  }

  hide(delay = 250) {
    $('#gogo-controls-mobile').fadeOut(delay);
  }

  show(delay = 400) {
    $('#gogo-controls-mobile').fadeIn(delay);
  }
}
