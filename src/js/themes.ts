import { App } from "./gogocarto";
declare var $;

export function afterTemplateLoaded() {
  if (App.config.theme == "transiscope") {
    $('.subcategorie-option-item .icon').addClass('bgdColorAs');
  $('.category-wrapper .subcategories-wrapper:not(.no-withdrawal) .subcategorie-option-item .icon').addClass('subIcon');     
  }
  
}  
  