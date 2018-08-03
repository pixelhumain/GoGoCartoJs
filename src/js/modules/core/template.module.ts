import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";

declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateModule
{
	constructor()
	{
		// we can configure this path and the templates names from GoGoCarto
		// to override default templates
		// As default templates are precompiled into javascript templates.js file
		// if there is some templates we did not override, nunjucks will get the precompiled one
		nunjucks.configure('../src/views', { autoescape: true });
	}

	initialize(config: GoGoConfig, callback: () => void)
	{
		if(config.infobar.bodyTemplate)
		{
			switch(config.infobar.bodyTemplate.type)
			{
				case "string":
					let content = config.infobar.bodyTemplate.content;
					if(Array.isArray(content))
					{
						content = content.join('\n');
					}
			    config.infobar.bodyTemplate.content = this.parseMarkdownSyntax(content);
			    config.infobar.bodyTemplate.compiled = false;
			    callback();
			    break;
		    case "url":
					let that = this;
					$.ajax({
						dataType: 'text',
						url: config.infobar.bodyTemplate.content,
						success: (data) => {
							config.infobar.bodyTemplate.content = that.parseMarkdownSyntax(data);
							config.infobar.bodyTemplate.compiled = false;
							callback();
						},
						error: () => { console.error("Error while getting the body template at url ", config.infobar.bodyTemplate.content)}
					});
					break;
		  }
		}
		else
		{
			callback();
		}
	}

	private parseMarkdownSyntax(markdownString: string): string
	{
		let parser = new commonmark.Parser()
		let htmlRenderer = new commonmark.HtmlRenderer();
		return htmlRenderer.render(parser.parse(markdownString));
	}

	render(templateName : string, options : any = {}) : string
	{
		let fileUrl = '';

		switch(templateName)
		{
			case 'layout': fileUrl = 'layout.html.njk'; break;
			case 'marker': fileUrl = 'components/map/marker.html.njk'; break;
			case 'gogo-styles': fileUrl = 'gogo-styles.html.njk'; break;
			case 'element': fileUrl = 'components/element/element.html.njk'; break;
			case 'vote-modal-content': fileUrl = 'components/modals/element/vote-content.html.njk'; break;
			default: console.warn('[GoGoCarto] No template associated to templateName', templateName);
		}

		return nunjucks.render(fileUrl, options);
	}
}