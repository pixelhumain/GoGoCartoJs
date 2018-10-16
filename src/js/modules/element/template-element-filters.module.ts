import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { Event } from "../../classes/classes";

declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateElementFiltersModule
{
  filters = [ 'gogocommitment', 'gogoemail', 'gogoopenhours', 'gogotags', 'gogotelephone', 'gogourls', 'gogowebsite' ];

  public addGoGoFilters(nunjucksEnvironment)
  {
    // adds custom fitlers here
    for(const currentFilter of this.filters)
    {
      nunjucksEnvironment.addFilter(currentFilter, function(value, kwargs) {
        let objectArgument = {};
        if(kwargs)
        {
          $.extend(objectArgument, kwargs);
        }
        objectArgument[currentFilter] = value;
        return nunjucksEnvironment.render("templates/element-filters/"+ currentFilter +".html.njk", objectArgument);
      });
    }

    return nunjucksEnvironment;
  }
}