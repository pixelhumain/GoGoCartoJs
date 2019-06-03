import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { TemplateElementModule } from "../element/template-element.module";
import { TemplateElementFiltersModule } from "../element/template-element-filters.module";

declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateModule
{
	nunjucksEnvironment: any;
	elementTemplate : TemplateElementModule = new TemplateElementModule();
	elementFilters : TemplateElementFiltersModule = new TemplateElementFiltersModule();

	constructor()
	{
		// we can configure this path and the templates names from GoGoCarto
		// to override default templates
		// As default templates are precompiled into javascript templates.js file
		// if there is some templates we did not override, nunjucks will get the precompiled one
		this.nunjucksEnvironment = nunjucks.configure('../src/views', { autoescape: true });
	}	

	initialize()
	{
		this.elementTemplate.initialize();
		this.nunjucksEnvironment = this.elementFilters.addGoGoFilters(this.nunjucksEnvironment);
		// mapping between entries and strings (for i18n)
		this.nunjucksEnvironment.addFilter('i18n', function(entry) {
		    return App.config.translate(entry);
		});
	}

	render(templateName : string, options : any = {}) : string
	{
		let fileUrl = '';

		switch(templateName)
		{
			case 'layout'              : fileUrl = 'layout.html.njk'; break;
			case 'marker'              : fileUrl = 'components/map/marker.html.njk'; break;
			case 'marker-popup-default': fileUrl = 'components/map/marker-popup-default.html.njk'; break;
			case 'gogo-styles'         : fileUrl = 'gogo-styles.html.njk'; break;
			case 'element'             : fileUrl = 'components/element/element.html.njk'; break;
			case 'element-body-default': fileUrl = 'components/element/default-body-content.html.njk'; break;
			case 'element-header-default': fileUrl = 'components/element/default-header-content.html.njk'; break;
			case 'vote-modal-content'  : fileUrl = 'components/modals/element/vote-content.html.njk'; break;
			default: console.warn('[GoGoCarto] No template associated to templateName', templateName);
		}

		return this.nunjucksEnvironment.render(fileUrl, options);
	}

	compile(template:string): any
	{
		return nunjucks.compile(template, this.nunjucksEnvironment);
	}	
}