import { App } from './gogocarto';

declare const $: any, window: Window, Materialize: any;

export class AppComponent {
  inforBarAnimationTimer;

  constructor() {
    App.directoryMenuComponent.onShow.do(() => {
      this.handleDirectoryMenuShow();
    });
    App.directoryMenuComponent.onHide.do(() => {
      this.handleDirectoryMenuHide();
    });
  }

  initialize() {
    this.updateComponentsSize();

    let res;
    window.onresize = () => {
      if (res) {
        clearTimeout(res);
      }
      res = setTimeout(() => {
        console.log('On resize update component size');
        this.updateComponentsSize();
        App.directoryMenuComponent.updateSize();
      }, 200);
    };

    setTimeout(() => {
      this.updateComponentsSize(false);
    }, 1000);
    setTimeout(() => {
      this.updateComponentsSize(false);
    }, 2000);
    setTimeout(() => {
      this.updateComponentsSize(false);
    }, 5000);
  }

  toastMessage($message, $duration = 3000) {
    Materialize.toast($message, $duration, 'rounded');
  }

  handleDirectoryMenuShow() {
    if (!this.isMobileScreen()) {
      $('#directory-content').velocity(
        { 'margin-left': App.directoryMenuComponent.width },
        { duration: 300, queue: false, easing: 'swing' }
      );
      $('#map-gogo-controls').velocity({ 'padding-left': '10px' }, { duration: 300, queue: false, easing: 'swing' });
      $('.show-directory-menu-button').hide();
      setTimeout(() => {
        $('#directory-content').css('margin-left', App.directoryMenuComponent.width);
      }, 400);
    }
    setTimeout(() => {
      App.mapComponent.resize();
    }, 400);
  }

  handleDirectoryMenuHide() {
    $('.show-directory-menu-button').fadeIn(200);
    $('#directory-content').velocity({ 'margin-left': '0' }, { duration: 100, queue: false, easing: 'swing' });
    $('#map-gogo-controls').velocity({ 'padding-left': '0px' }, { duration: 100, queue: false, easing: 'swing' });
    setTimeout(() => {
      App.mapComponent.resize();
    }, 200);
  }

  isMobileScreen() {
    return this.width() < 850;
  }

  mapWidth() {
    return $('#directory-content').width();
  }

  width() {
    return $('.gogocarto-container').width();
  }

  updateComponentsSize($refreshInfoBar = true) {
    App.directoryMenuComponent.updateSize();

    App.searchBarComponent.update();

    App.gogoControlComponent.updatePosition();

    // update img controls for element list
    $('#directory-content-list .element-item').each(function () {
      $(this).find('.img-overlay').css('height', $(this).find('.img-container').height());
    });

    let infoBarHasChangeDisplayMode = false;
    // show element info bar aside or at the bottom depending of direcoty-content width
    if (this.mapWidth() > 900) {
      if (!App.infoBarComponent.isDisplayedAside()) {
        App.infoBarComponent.displayAside();
        infoBarHasChangeDisplayMode = true;
      }
    } else {
      if (!App.infoBarComponent.isDisplayedBottom()) {
        App.infoBarComponent.displayBottom();
        infoBarHasChangeDisplayMode = true;
      }
      $('#directory-content-map').stop(true).css('margin-right', '0');
    }

    if (App.infoBarComponent.isDisplayedAside()) {
      let infoBarWidth;
      if (App.config.infobar.width) infoBarWidth = App.config.infobar.width;
      else infoBarWidth = this.mapWidth() > 1100 ? '540px' : '470px';

      if (infoBarWidth == '470px') $('#element-info-bar').addClass('small-width');
      else $('#element-info-bar').removeClass('small-width');

      if (infoBarHasChangeDisplayMode) $('#element-info-bar').css('width', infoBarWidth);
      else $('#element-info-bar').animate({ width: infoBarWidth }, 350, 'swing');

      this.updateDirectoryContentMarginIfInfoBarDisplayedAside(!infoBarHasChangeDisplayMode, infoBarWidth);
    } else {
      if ($refreshInfoBar) $('#element-info-bar').stop(true);
      $('#element-info-bar').css('width', '100%');
    }

    if ($('#directory-menu').is(':visible') && !this.isMobileScreen()) {
      setTimeout(function () {
        $('#directory-content').css('margin-left', App.directoryMenuComponent.width);
      }, 0);
    } else $('#directory-content').css('margin-left', 0);
  }

  updateDirectoryContentMarginIfInfoBarDisplayedAside(animate = false, width: string = App.infoBarComponent.width()) {
    if (!App.infoBarComponent.isVisible) return;

    if (animate) $('#directory-content-map').stop(true).animate({ 'margin-right': width }, 350, 'swing');
    else $('#directory-content-map').stop(true).css('margin-right', width);

    App.component.updateMapSize();
  }

  updateMapSize() {
    if (!App.infoBarComponent.isDisplayedAside()) $('#directory-content-map').stop(true).css('margin-right', '0');
    if (App.mapComponent)
      setTimeout(function () {
        App.mapComponent.resize();
      }, 0);
  }
}
