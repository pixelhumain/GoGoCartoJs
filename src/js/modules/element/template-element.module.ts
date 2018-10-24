import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { Event } from "../../classes/classes";

declare var $;
declare var nunjucks;
declare var commonmark;

export enum HtmlElement {
  Body = 'body',
  Header = 'header'
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

    this.headerConfig = App.config.infobar.headerTemplate;

    this.getHtmlElementData(this.bodyConfig, HtmlElement.Body);

    this.getHtmlElementData(this.headerConfig, HtmlElement.Header);
  }

  private getHtmlElementData(htmlElementConfig: any, htmlElementConcerned: HtmlElement)
  {
    if (!htmlElementConfig.content) { this.onReady.emit(); return; } // nothing to do
    
    switch(htmlElementConfig.type)
    {
      case "string":
        let content = htmlElementConfig.content;
        if (Array.isArray(content)) content = content.join('\n');
        this.compile(htmlElementConfig, htmlElementConcerned, content);
        this.onReady.emit();
        break;
      case "url":
        $.ajax({
          dataType: 'text',
          url: htmlElementConfig.content,
          success: (data) => { this.compile(htmlElementConfig, htmlElementConcerned, data);this.onReady.emit(); },
          error: () => { this.showError(htmlElementConcerned, htmlElementConfig.content); }
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

  renderHtmlElement(htmlElementConcerned: string, element): any
  {    
    let renderedTemplate = "";
    switch(htmlElementConcerned)
    {
      case HtmlElement.Body:
        renderedTemplate = this.renderBody(element);
        break;
      case HtmlElement.Header:
        renderedTemplate = this.renderHeader(element);
        break;
    }

    return this.fixTemplate(renderedTemplate);
  }

  // If there is a body template configured, then we use it. We use the default body otherwise.
  private renderBody(element): any
  {
    if (this.bodyTemplate)
      return this.bodyTemplate.render(element);
    else
      return App.templateModule.render('element-body-default', element);
  }

  // If there is a header template configured, then we use it. We use the default header otherwise.
  private renderHeader(element): any
  {
    if (this.headerTemplate)
      return this.headerTemplate.render(element);
    else
      return App.templateModule.render('element-header-default', element);
  }

  private fixTemplate(template) {
    template = template.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
    template = template.replace('<hr />', '<div class="info-bar-divider"></div>');
    template = template.replace(/<h1>|<h2>|<h4>|<h5>/g, '<h3>');
    template = template.replace(/<\/h1>|<\/h2>|<\/h4>|<\/h5>/g, '</h3>');
    return template;
  }

  // Compile given content as a template once for all
  private compile(htmlElementConfig : any, htmlElementConcerned: HtmlElement, content: any)
  {
    if (htmlElementConfig.isMarkdown) content = this.parseMarkdownSyntax(content);
    let template = App.templateModule.compile(content);
    switch(htmlElementConcerned)
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