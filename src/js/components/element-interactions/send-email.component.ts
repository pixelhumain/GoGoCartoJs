import { Element } from "../../classes/element.class";
import { App } from "../../gogocarto";
import { capitalize } from "../../utils/string-helpers";
import { getCurrentElementIdShown, getCurrentElementInfoBarShown } from "../element/element-menu.component";
declare var $ : any;

export function initializeSendingMail()
{
  $('#popup-send-mail #submit-mail').click(() => { handleSubmitMail(); });
}

export function createListenersForSendEmail(object, element)
{
  object.find('.send-mail-btn').click(function()
  {
    $('#popup-send-mail .elementName').text(capitalize(element.name));

    $('#popup-send-mail .input-mail-content').val('');
    $('#popup-send-mail .input-mail-subject').val('');
    $('#popup-send-mail #content-error').hide();
    $('#popup-send-mail #mail-error').hide();

    if (App.loginModule.getUserMail())
    {
      $('#popup-send-mail .input-mail').hide();
      $('#popup-send-mail .input-mail').val(App.loginModule.getUserMail());
    }
    else
    {
      $('#popup-send-mail .input-mail').val('');
      $('#popup-send-mail .input-mail').show();
    }

    $('#popup-send-mail').openModal();
  });
}

function handleSubmitMail()
{  
  let userMail = $('#popup-send-mail .input-mail').val();
  let mailSubject = $('#popup-send-mail .input-mail-subject').val();
  let mailContent = $('#popup-send-mail .input-mail-content').val();

  $('#popup-send-mail #message-error').hide();
  $('#popup-send-mail #content-error').hide();
  $('#popup-send-mail #mail-error').hide();

  let errors = false;
  if (!mailSubject || !mailContent)
  {
    $('#popup-send-mail #content-error').show();
    errors = true;
  }
  if (!userMail || $('#popup-send-mail .input-mail').hasClass('invalid'))
  {
    $('#popup-send-mail #mail-error').show();
    $('#popup-send-mail .input-mail').show();
    errors = true;
  }
  if (!errors)
  {      
    let elementId = getCurrentElementIdShown();  
    let comment = $('#popup-send-mail .input-comment').val();        

    let route = App.config.features.sendMail.url;
    let data = { elementId: elementId, subject: mailSubject, content: mailContent, userMail : userMail };

    App.ajaxModule.sendRequest(route, 'post', data, (response) =>
    {
      let success = response.success;
      let responseMessage = response.message;

      if (success)
      {
        $('#popup-send-mail').closeModal();
        let elementInfo = getCurrentElementInfoBarShown();
        elementInfo.find('.result-message').html(responseMessage).show();
        App.infoBarComponent.show();
      }
      else
      {
        $('#popup-send-mail #message-error').text(responseMessage).show();
      }
    },
    (errorMessage) => 
    {
      $('#popup-send-mail #message-error').text(errorMessage).show();
    });      
  }  
}