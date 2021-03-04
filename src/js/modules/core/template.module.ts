import { App } from '../../gogocarto';
import { TemplateElementModule } from '../element/template-element.module';
import { TemplateElementFiltersModule } from '../element/template-element-filters.module';
import * as nunjucks from 'nunjucks';

declare let $, moment;

export class TemplateModule {
  nunjucksEnvironment: any;
  elementTemplate: TemplateElementModule = new TemplateElementModule();
  elementFilters: TemplateElementFiltersModule = new TemplateElementFiltersModule();

  constructor() {
    // we can configure this path and the templates names from GoGoCarto
    // to override default templates
    // As default templates are precompiled into javascript templates.js file
    // if there is some templates we did not override, nunjucks will get the precompiled one
    this.nunjucksEnvironment = nunjucks.configure('../src/views', {
      autoescape: true,
    });
    this.nunjucksEnvironment = this.elementFilters.addGoGoFilters(this.nunjucksEnvironment);
    // mapping between entries and strings (for i18n)
    this.nunjucksEnvironment.addFilter('i18n', function (entry) {
      return App.config.translate(entry);
    });
    this.nunjucksEnvironment.addFilter('is_string', function (obj) {
      return typeof obj == 'string';
    });
    this.nunjucksEnvironment.addFilter('is_array', function (obj) {
      return Array.isArray(obj);
    });
    this.nunjucksEnvironment.addFilter('is_object', function (obj) {
      return typeof obj == 'object';
    });
    this.nunjucksEnvironment.addFilter('name_from_url', function (url) {
      const splited = url.split('/');
      const name = splited[splited.length - 1];
      return name.replace(/[a-z0-9]{13}_/, ''); // remove 13 character hash on the beginning of the file name, method used by gogocarto
    });
    this.nunjucksEnvironment.addFilter('add_protocol_if_need', function (url) {
      if (!url.startsWith('http')) return 'http://' + url;
      else return url;
    });
    // Date Filter, copied from https://github.com/techmsi/nunjucks-date/blob/master/src/index.js
    const meridiemRegEx = new RegExp('(a{1,2}|p).?m{1}?.?', 'i'); // Capture the a or the p in the meridiem
    const getMeridiemFormat = (dateString, format) =>
      moment(dateString).format(format).replace(meridiemRegEx, '$1.m.');
    const getFormat = (dateString, format) =>
      moment(dateString).format(format);
    this.nunjucksEnvironment.addFilter('date', function (dateString, ...args) {
      const isMeridiemOnly = typeof args[0] === 'boolean';
      let [format = null, isMeridiem = null] = args;  
      if (!format) format = App.config.translate('date.defaultFormat')
      if (!args.length) return getFormat(dateString, format);
      if (format && isMeridiem) return getMeridiemFormat(dateString, format);
      if (format && !isMeridiemOnly) return getFormat(dateString, format);
      else return getMeridiemFormat(dateString, format);
    });
  }  

  initialize() {
    this.elementTemplate.initialize();
  }

  render(templateName: string, options: any = {}): string {
    let fileUrl = '';

    switch (templateName) {
      case 'layout':
        fileUrl = 'layout.html.njk';
        break;
      case 'marker':
        fileUrl = 'components/map/marker.html.njk';
        break;
      case 'marker-popup-default':
        fileUrl = 'components/map/marker-popup-default.html.njk';
        break;
      case 'gogo-styles':
        fileUrl = 'gogo-styles.html.njk';
        break;
      case 'element':
        fileUrl = 'components/element/element.html.njk';
        break;
      case 'element-body-default':
        fileUrl = 'components/element/default-body-content.html.njk';
        break;
      case 'element-header-default':
        fileUrl = 'components/element/default-header-content.html.njk';
        break;
      case 'vote-modal-content':
        fileUrl = 'components/modals/element/vote-content.html.njk';
        break;
      default:
        console.warn('[GoGoCarto] No template associated to templateName', templateName);
    }

    return this.nunjucksEnvironment.render(fileUrl, options);
  }

  compile(template: string): any {
    return nunjucks.compile(template, this.nunjucksEnvironment);
  }
}
