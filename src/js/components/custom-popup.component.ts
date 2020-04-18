declare let $, jQuery: any;

import { AppModule, AppModes } from '../app.module';
import { App } from '../gogocarto';
import * as Cookies from '../utils/cookies';

export class CustomPopupComponent {
  options: any;

  initialize() {
    if (!App.config.isFeatureAvailable('customPopup')) return;
    this.options = App.config.features.customPopup.options;
    // console.log("cookie", this.getCookieId(), Cookies.readCookie(this.getCookieId()))
    if ((!this.options.showOnlyOnce || !Cookies.readCookie(this.getCookieId())) && this.options.text.length > 0)
      this.show();
    $('#gogo-custom-popup #btn-close-custom-popup').click(() => this.hide());
  }

  hide(delay = 250) {
    $('#gogo-custom-popup').fadeOut(delay);
    Cookies.createCookie(this.getCookieId(), true);
  }

  show(delay = 400) {
    $('#gogo-custom-popup').fadeIn(delay);
  }

  getId(): string {
    return this.options.id || 0;
  }

  getCookieId(): string {
    return `gogoCustomPopup-${this.getId()}-Closed`;
  }
}
