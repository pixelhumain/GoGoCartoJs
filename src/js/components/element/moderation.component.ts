declare var $ : any;
import { App } from "../../gogocarto";
import { Element } from "../../classes/classes";

export class ModerationComponent
{
  private dom;
  private element : Element;

  constructor(dom : any, element : Element)
  {
    this.dom = $(dom); 
    this.element = element;  
    this.initialize();
  }

  private initialize()
  {
    // vote-button is located on the element-info-bar of a pending element
    var that = this;
    this.dom.find(".mark-as-moderated-btn").click( function(e)
    {
      // restrict vote to specific roles
      if (!App.config.isFeatureAvailable('moderation')) 
      {
        App.loginModule.loginAction();
        return;
      }
      else
      {
        let comment = $(this).siblings('.moderation-input-comment').val();       
        let route = App.config.features.moderation.url;
        let data = { elementId: that.element.id, comment: comment };
        
        App.ajaxModule.sendRequest(route, 'post', data, (response) =>
        {        
          let responseMessage = response.message;
          let success = response.success;
          
          that.element.update(true);
          that.element.isFullyLoaded = false;

          // reload Element, and add flash message
          App.infoBarComponent.showElement(that.element.id, () => {
            that.element.component.addFlashMessage(responseMessage);
          });
          
          that.element.component.addFlashMessage(responseMessage);        
        },
        (errorMessage) => 
        {
          that.element.component.addFlashMessage(errorMessage);  
        });  
      }      

      e.stopPropagation();e.stopImmediatePropagation();e.preventDefault();
    });
  }
}

