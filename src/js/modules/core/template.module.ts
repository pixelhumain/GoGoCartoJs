import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";

declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateModule
{
	nunjucksEnvironment: any;

	constructor()
	{
		// we can configure this path and the templates names from GoGoCarto
		// to override default templates
		// As default templates are precompiled into javascript templates.js file
		// if there is some templates we did not override, nunjucks will get the precompiled one
		this.nunjucksEnvironment = nunjucks.configure('../src/views', { autoescape: true });

		// Add custom filters here
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
					if(config.infobar.bodyTemplate.isMarkdown)
					{
						config.infobar.bodyTemplate.content = this.parseMarkdownSyntax(content);
					}
					else
					{
						config.infobar.bodyTemplate.content = content;
					}
			    config.infobar.bodyTemplate.compiled = false;
			    callback();
			    break;
		    case "url":
					let that = this;
					$.ajax({
						dataType: 'text',
						url: config.infobar.bodyTemplate.content,
						success: (data) => {
							if(config.infobar.bodyTemplate.isMarkdown)
							{
								config.infobar.bodyTemplate.content = this.parseMarkdownSyntax(data);
							}
							else
							{
								config.infobar.bodyTemplate.content = data;
							}
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

		return this.nunjucksEnvironment.render(fileUrl, options);
	}

	compile(template:string): any
	{
		return nunjucks.compile(template, this.nunjucksEnvironment);
	}

	defaultBodyRender(options: any = {})
	{
		return this.nunjucksEnvironment.render('components/element/body.html.njk', options);
	}
}