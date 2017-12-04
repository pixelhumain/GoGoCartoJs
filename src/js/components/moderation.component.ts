declare var $ : any;
import { App } from "../gogocarto";
import { getCurrentElementIdShown, getCurrentElementInfoBarShown } from "./element-menu.component";
import { AjaxModule } from "../modules/ajax.module";

export function createListenersForMarkAsResolved()
{
  // vote-button is located on the element-info-bar of a pending element
  $(".mark-as-moderated-btn").click( function(e)
  {
    // restrict vote to specific roles
    if (!App.config.isFeatureAvailable('moderation')) 
    {
      App.loginModule.loginAction();
      return;
    }
    else
    {
      let element = App.elementModule.getElementById(getCurrentElementIdShown());

      console.log("send mark as resolved ", element.id);

      let route = App.config.features.moderation.url;
      let data = { elementId: element.id };

      App.ajaxModule.sendRequest(route, 'post', data, (response) =>
      {        
        let responseMessage = response.message;
        let success = response.success;
        
        element.update(true);
        element.isFullyLoaded = false;

        // reload Element, and add flash message
        App.infoBarComponent.showElement(element.id, () => {
          addFlashMessage(responseMessage);
        });
        
        addFlashMessage(responseMessage);        
      },
      (errorMessage) => 
      {
        addFlashMessage(errorMessage);  
      });  
    }      

    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  });
}

function addFlashMessage(message)
{
  let elementInfo = getCurrentElementInfoBarShown();
  elementInfo.find(".moderation-section").find('.basic-message').hide(); 
  elementInfo.find('.result-message').html(message).show();
  App.infoBarComponent.show();
}