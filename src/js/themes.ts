import { App } from './gogocarto';

export function afterTemplateLoaded() {
  if (App.config.theme == 'transiscope') {
    $('.category-wrapper .subcategories-wrapper:not(.no-withdrawal) .subcategorie-option-item .icon').addClass(
      'subIcon'
    );
  }
}
