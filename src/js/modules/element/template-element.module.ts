import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { Event } from "../../classes/classes";
import { TemplateNames, TemplateConfig } from '../../classes/config/template-config.class';
declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateElementModule
{
  onReady = new Event<any>();
  isReady : boolean = false;

  bodyConfig : TemplateConfig;
  bodyTemplate : any = null; // nunjucks template

  headerConfig : TemplateConfig;
  headerTemplate : any = null; // nunjucks template
  
  initialize()
  {
    this.bodyConfig = new TemplateConfig(App.config.infobar.bodyTemplate, TemplateNames.ElementBody);
    this.headerConfig = new TemplateConfig(App.config.infobar.headerTemplate, TemplateNames.ElementHeader);

    this.getHtmlElementData(this.bodyConfig);
    this.getHtmlElementData(this.headerConfig);
  }

  private getHtmlElementData(htmlElementConfig: TemplateConfig)
  {
    if (!htmlElementConfig.content) { this.checkTemplatesReady(); return; } // nothing to do
    switch(htmlElementConfig.type.toLowerCase())
    {
      case "string":
        let content = htmlElementConfig.content;
        if (Array.isArray(content)) content = content.join('\n');
        this.compile(htmlElementConfig, content);
        break;
      case "url":
        $.ajax({
          dataType: 'text',
          url: htmlElementConfig.content,
          success: (data) => { this.compile(htmlElementConfig, data); },
          error: () => { this.showError(htmlElementConfig.name, htmlElementConfig.content); }
        });
        break;
    }
  }  

  private showError(htmlElementConcerned: TemplateNames, urlConcerned: string)
  {
    let errorMessage;
    switch(htmlElementConcerned)
    {
      case TemplateNames.ElementBody:
        errorMessage = "Error while getting the body template at url :";
        break;
      case TemplateNames.ElementHeader:
        errorMessage = "Error while getting the header template at url :";
        break;
    }
    console.error(errorMessage, urlConcerned);
  }

  // If there is a body template configured, then we use it. We use the default body otherwise.
  renderBody(element): any
  {
    let renderedTemplate;
    if (this.bodyTemplate)
      renderedTemplate = this.bodyTemplate.render(element);
    else
      renderedTemplate = App.templateModule.render('element-body-default', element);
    return this.fixTemplate(renderedTemplate);
  }

  // If there is a header template configured, then we use it. We use the default header otherwise.
  renderHeader(element): any
  {
    let renderedTemplate;
    if (this.headerTemplate)
      renderedTemplate = this.headerTemplate.render(element);
    else
      renderedTemplate = App.templateModule.render('element-header-default', element);
    return this.fixTemplate(renderedTemplate);
  }

  private fixTemplate(template) {
    template = template.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
    template = template.replace(/<hr \/>|<hr>/g, '<div class="info-bar-divider"></div>');
    template = template.replace(/<h1>|<h2>|<h4>|<h5>/g, '<h3>');
    template = template.replace(/<\/h1>|<\/h2>|<\/h4>|<\/h5>/g, '</h3>');
    return template;
  }

  // Compile given content as a template once for all
  private compile(htmlElementConfig : TemplateConfig, content: any)
  {
    if (htmlElementConfig.isMarkdown) content = this.parseMarkdownSyntax(content);
    let template = App.templateModule.compile(content);
    switch(htmlElementConfig.name)
    {
      case TemplateNames.ElementBody:
        this.bodyTemplate = template;
        break;
      case TemplateNames.ElementHeader:
        this.headerTemplate = template;
        break;
    }
    this.checkTemplatesReady();
  }

  private checkTemplatesReady()
  {
    if ( !this.isReady && (!this.bodyConfig.isUrl() || this.bodyTemplate) && (this.headerTemplate || !this.headerConfig.isUrl()) )
    {
      this.isReady = true;
      this.onReady.emit();
    }
  }

  private parseMarkdownSyntax(markdownString: string): string
  {
    let parser = new commonmark.Parser()
    let htmlRenderer = new commonmark.HtmlRenderer();
    return htmlRenderer.render(parser.parse(markdownString));
  }  
}