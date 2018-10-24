import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { Event } from "../../classes/classes";

declare var $;
declare var nunjucks;
declare var commonmark;

enum HtmlElement {
  Body,
  Header
}

export class TemplateElementModule
{
  onReady = new Event<any>();

  bodyConfig : any;
  bodyTemplate : any; // nunjucks template

  headerConfig : any;
  headerTemplate : any; // nunjucks template
  initialize()
  {
    this.bodyConfig = App.config.infobar.bodyTemplate;
    this.bodyConfig.type = HtmlElement.Body;

    this.headerConfig = App.config.infobar.headerTemplate;
    this.headerConfig.type = HtmlElement.Header;

    this.getHtmlElementData(this.bodyConfig);

    this.getHtmlElementData(this.headerConfig);
  }

  private getHtmlElementData(htmlElementConfig: any)
  {
    if (!htmlElementConfig.content) { this.onReady.emit(); return; } // nothing to do
    
    switch(htmlElementConfig.type)
    {
      case "string":
        let content = htmlElementConfig.content;
        if (Array.isArray(content)) content = content.join('\n');
        this.compile(htmlElementConfig, content);
        this.onReady.emit();
        break;
      case "url":
        $.ajax({
          dataType: 'text',
          url: htmlElementConfig.content,
          success: (data) => { this.compile(htmlElementConfig, data);this.onReady.emit(); },
          error: () => { this.showError(htmlElementConfig.type, htmlElementConfig.content); }
        });
        break;
    }
  }

  private showError(htmlElementConcerned: HtmlElement, urlConcerned: string)
  {
    let errorMessage;
    switch(htmlElementConcerned)
    {
      case HtmlElement.Body:
        errorMessage = "Error while getting the body template at url :";
        break;
      case HtmlElement.Header:
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
    template = template.replace('<hr />', '<div class="info-bar-divider"></div>');
    template = template.replace(/<h1>|<h2>|<h4>|<h5>/g, '<h3>');
    template = template.replace(/<\/h1>|<\/h2>|<\/h4>|<\/h5>/g, '</h3>');
    return template;
  }

  // Compile given content as a template once for all
  private compile(htmlElementConfig : any, content: any)
  {
    if (htmlElementConfig.isMarkdown) content = this.parseMarkdownSyntax(content);
    let template = App.templateModule.compile(content);
    switch(htmlElementConfig.type)
    {
      case HtmlElement.Body:
        this.bodyTemplate = template;
        break;
      case HtmlElement.Header:
        this.headerTemplate = template;
        break;
    }
  }

  private parseMarkdownSyntax(markdownString: string): string
  {
    let parser = new commonmark.Parser()
    let htmlRenderer = new commonmark.HtmlRenderer();
    return htmlRenderer.render(parser.parse(markdownString));
  }  
}