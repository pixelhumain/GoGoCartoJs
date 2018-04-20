/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
declare let $, jQuery : any;

import { AppModule, AppModes } from "../app.module";
import { App } from "../gogocarto";
import * as Cookies from "../utils/cookies";

export class CustomPopupComponent
{    
  options : any;

  initialize()
  {
    this.options = App.config.features.customPopup.options;
    console.log("cookie", this.getCookieId(), Cookies.readCookie(this.getCookieId()))
    if (!this.options.showOnlyOnce || !Cookies.readCookie(this.getCookieId())) this.show();
    $('#gogo-custom-popup #btn-close-custom-popup').click( () => this.hide());
  }

  hide(delay : number = 250) { 
    $('#gogo-custom-popup').fadeOut(delay); 
    Cookies.createCookie(this.getCookieId(), true);
  }

  show(delay : number = 400) { $('#gogo-custom-popup').fadeIn(delay); }

  getId() : string {
    return this.options.id || 0;
  }

  getCookieId() : string {
    return `gogoCustomPopup-${this.getId()}-Closed`
  }
}