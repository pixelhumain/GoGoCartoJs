import { AppModule } from "../../app.module";

import { App } from "../../gogocarto";
import { GoGoConfig } from "../../classes/config/gogo-config.class";
import { Event } from "../../classes/classes";

declare var $;
declare var nunjucks;
declare var commonmark;

export class TemplateElementModule
{
  onReady = new Event<any>();

  bodyConfig : any;
  bodyTemplate : any; // nunjucks template

  initialize()
  {
    this.bodyConfig = App.config.infobar.bodyTemplate;

    if (!this.bodyConfig.content) { this.onReady.emit(); return; } // nothng to do
    
    switch(this.bodyConfig.type)
    {
      case "string":
        let content = this.bodyConfig.content;
        if (Array.isArray(content)) content = content.join('\n');
        this.compileBody(content);          
        break;
      case "url":
        $.ajax({
          dataType: 'text',
          url: this.bodyConfig.content,
          success: (data) => { this.compileBody(data); },
          error: () => { console.error("Error while getting the body template at url ", this.bodyConfig.content)}
        });
        break;
    }
  }

  // Compile the body template once for all
  compileBody(content : any)
  {
    if (this.bodyConfig.isMarkdown) content = this.parseMarkdownSyntax(content);
    this.bodyTemplate = App.templateModule.compile(content);    
    this.onReady.emit();
  }  

  // If there is a body template configured, then we use it. We use the default body otherwise.
  renderBody(element)
  {    
    let renderedTemplate = "";
    console.log("renderBody", element);
    if (this.bodyTemplate)
      renderedTemplate = this.bodyTemplate.render(element);      
    else
      renderedTemplate = App.templateModule.render('element-body-default', {element: element});

    return this.fixTemplate(renderedTemplate);
  }

  private fixTemplate(template) {
    template = template.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
    template = template.replace('<hr />', '<div class="info-bar-divider"></div>');
    template = template.replace(/<h1>|<h2>|<h4>|<h5>/g, '<h3>');
    template = template.replace(/<\/h1>|<\/h2>|<\/h4>|<\/h5>/g, '</h3>');
    return template;
  }

  private parseMarkdownSyntax(markdownString: string): string
  {
    let parser = new commonmark.Parser()
    let htmlRenderer = new commonmark.HtmlRenderer();
    return htmlRenderer.render(parser.parse(markdownString));
  }  
}