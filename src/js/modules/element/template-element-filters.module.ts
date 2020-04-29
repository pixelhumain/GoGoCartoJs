import { AppModule } from '../../app.module';

import { App } from '../../gogocarto';
import { GoGoConfig } from '../../classes/config/gogo-config.class';
import { Event } from '../../classes/classes';

import { splitLongText, formatPhoneNumber } from '../../utils/string-helpers';

declare let $;

export class TemplateElementFiltersModule {
  filters = [
    'gogo_text',
    'gogo_email',
    'gogo_openhours',
    'gogo_tags',
    'gogo_vimeo',
    'gogo_url',
    'gogo_title',
    'gogo_separator',
    'gogo_taxonomy',
    'gogo_textarea',
    'gogo_tel',
    'gogo_files',
    'gogo_elements'
  ];

  public addGoGoFilters(nunjucksEnvironment) {
    const me = this;
    // adds custom fitlers here
    for (const currentFilter of this.filters) {
      nunjucksEnvironment.addFilter(currentFilter, function (value, kwargs) {
        const objectArgument = {};
        if (kwargs) $.extend(objectArgument, kwargs);
        objectArgument['value'] = value;
        objectArgument['config'] = App.config;
        $.extend(objectArgument, me.addNeededFunction(currentFilter));
        return nunjucksEnvironment.render(
          'components/element/element-filters/' + currentFilter + '.html.njk',
          objectArgument
        );
      });
    }

    return nunjucksEnvironment;
  }

  private addNeededFunction(filter: string): object {
    const functionToAdd = {};
    switch (filter) {
      case 'gogo_textarea':
        functionToAdd['splitLongText'] = splitLongText;
        break;
      case 'gogo_tel':
        functionToAdd['formatPhoneNumber'] = formatPhoneNumber;
        break;
      default:
    }
    return functionToAdd;
  }
}
