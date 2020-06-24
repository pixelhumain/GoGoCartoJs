import { AppModule } from '../../app.module';

import { App } from '../../gogocarto';
import { GoGoConfig } from '../../classes/config/gogo-config.class';
import { Event } from '../../classes/classes';
import { TemplateNames, TemplateConfig } from '../../classes/config/template-config.class';
import * as commonmark from 'commonmark';

declare let $;

export class TemplateElementModule {
  onReady = new Event<any>();
  isReady = false;

  bodyConfig: TemplateConfig;
  bodyTemplate: any = null; // nunjucks template

  headerConfig: TemplateConfig;
  headerTemplate: any = null; // nunjucks template

  markerPopupConfig: TemplateConfig;
  markerPopupTemplate: any = null; // nunjucks template

  initialize() {
    this.bodyConfig = new TemplateConfig(App.config.infobar.bodyTemplate, TemplateNames.ElementBody);
    this.headerConfig = new TemplateConfig(App.config.infobar.headerTemplate, TemplateNames.ElementHeader);
    this.markerPopupConfig = new TemplateConfig(App.config.marker.popupTemplate, TemplateNames.MarkerPopup);

    this.getHtmlElementData(this.bodyConfig);
    this.getHtmlElementData(this.headerConfig);
    this.getHtmlElementData(this.markerPopupConfig);
  }

  private getHtmlElementData(htmlElementConfig: TemplateConfig) {
    if (!htmlElementConfig.content) {
      this.checkTemplatesReady();
      return;
    } // nothing to do
    switch (htmlElementConfig.type.toLowerCase()) {
      case 'string':
        let content = htmlElementConfig.content;
        if (Array.isArray(content)) content = content.join('\n');
        this.compile(htmlElementConfig, content);
        break;
      case 'url':
        $.ajax({
          dataType: 'text',
          url: htmlElementConfig.content,
          success: (data) => {
            this.compile(htmlElementConfig, data);
          },
          error: () => {
            console.error('Error while getting the template at url', htmlElementConfig.content);
          },
        });
        break;
    }
  }

  // If there is a body template configured, then we use it. We use the default body otherwise.
  renderBody(element): any {
    let renderedTemplate;
    if (this.bodyTemplate) renderedTemplate = this.bodyTemplate.render(element);
    else renderedTemplate = App.templateModule.render('element-body-default', element);
    return this.fixTemplate(renderedTemplate);
  }

  // If there is a header template configured, then we use it. We use the default header otherwise.
  renderHeader(element): any {
    let renderedTemplate;
    if (this.headerTemplate) renderedTemplate = this.headerTemplate.render(element);
    else renderedTemplate = App.templateModule.render('element-header-default', element);
    return this.fixTemplate(renderedTemplate);
  }

  // If there is a header template configured, then we use it. We use the default header otherwise.
  renderMarkerPopup(element): any {
    let renderedTemplate;
    if (this.markerPopupTemplate) renderedTemplate = this.markerPopupTemplate.render(element);
    else renderedTemplate = App.templateModule.render('marker-popup-default', element);
    return this.fixTemplate(renderedTemplate);
  }

  private fixTemplate(template) {
    template = template
      .replace(/&amp;/g, '&')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&quot;/g, '"');
    template = template.replace(/<hr \/>|<hr>/g, '<div class="info-bar-divider"></div>');
    return template;
  }

  // Compile given content as a template once for all
  private compile(htmlElementConfig: TemplateConfig, content: any) {
    if (htmlElementConfig.isMarkdown) content = this.parseMarkdownSyntax(content);
    const template = App.templateModule.compile(this.fixTemplate(content));
    switch (htmlElementConfig.name) {
      case TemplateNames.ElementBody:
        this.bodyTemplate = template;
        break;
      case TemplateNames.ElementHeader:
        this.headerTemplate = template;
        break;
      case TemplateNames.MarkerPopup:
        this.markerPopupTemplate = template;
        break;
    }
    this.checkTemplatesReady();
  }

  private checkTemplatesReady() {
    if (
      !this.isReady &&
      (!this.bodyConfig.isUrl() || this.bodyTemplate) &&
      (this.headerTemplate || !this.headerConfig.isUrl()) &&
      (this.markerPopupTemplate || !this.markerPopupConfig.isUrl())
    ) {
      this.isReady = true;
      this.onReady.emit();
    }
  }

  private parseMarkdownSyntax(markdownString: string): string {
    const parser = new commonmark.Parser();
    const htmlRenderer = new commonmark.HtmlRenderer();
    return htmlRenderer.render(parser.parse(markdownString));
  }
}
