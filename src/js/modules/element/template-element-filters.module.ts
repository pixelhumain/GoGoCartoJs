import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { Event } from "../../classes/classes";

declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateElementFiltersModule
{
  nunjucksEnvironment : any;

  public addGoGoFilters(nunjucksEnvironment)
  {
    this.nunjucksEnvironment = nunjucksEnvironment;

    // adds custom fitlers here
    this.addGoGoTags();

    return this.nunjucksEnvironment;
  }

  private addGoGoTags()
  {
    this.nunjucksEnvironment.addFilter('gogotags', function(tags) {
      let value = '<div class="tags-container">';
      for(let currentIndex=0;currentIndex<tags.length;++currentIndex)
      {
        value += '<span class="gogo-tag">' + tags[currentIndex] + '</span>';
      }
      value += '</div>'

      return value;
    });
  }
}