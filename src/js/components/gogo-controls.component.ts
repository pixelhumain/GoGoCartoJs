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

export class GoGoControlComponent
{    
  handleModeChanged($mode : AppModes)
  {
    if ($mode == AppModes.Map)
    {
      $('#gogo-controls-mobile').velocity({top: 15}, {duration: 350, queue: false, easing: 'easeOutQuad'}); 
      $('#gogo-controls-mobile').addClass('map').removeClass('list');
    }
    else
    {
      let top = $('#directory-content').height() - $('#gogo-controls-mobile').height() - 5;
      $('#gogo-controls-mobile').velocity({top: top}, {duration: 350, queue: false, easing: 'easeOutQuad'}); 
      $('#gogo-controls-mobile').addClass('list').removeClass('map');
    }
  } 

  hide() { $('#gogo-controls-mobile').fadeOut(250); }

  show() { $('#gogo-controls-mobile').fadeIn(400); }  
}