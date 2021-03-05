import { Element, ElementBase, ElementStatus, PostalAddress } from '../../classes/classes';
import { capitalize, slugify, splitLongText } from '../../utils/string-helpers';
import { App } from '../../gogocarto';
declare let $, L, moment;

export class ElementJsonParserModule {
  // contains the ontology of the compact Json. This mapping must be provided in the elements ajax response
  compactMapping = ['id', ['name'], 'latitude', 'longitude', 'status', 'moderationState'];

  load(elementJson: any, element: Element | ElementBase) {
    // patch to handle compactJson stored inside a "compactJson" property (use with Semantic Bus)
    if (elementJson.compactJson) {
      const id = elementJson.id;
      elementJson = elementJson.compactJson;
      elementJson.id = id;
    }

    // when we get the compact json representation of the element from the server
    // the elementJson is a simple array with the more important element attribute
    if ($.isArray(elementJson) && elementJson.length >= 5) this.loadFromCompactJson(elementJson, element);
    else this.loadFromFullJson(elementJson, element);
    if (App.config.infobar.displayDateField)
      element.dateToDisplay = moment(element.data[App.config.infobar.displayDateField]);
  }

  private loadFromCompactJson(elementJson: any, element: Element | ElementBase) {
    element.id = elementJson.id; // the element has been modified before to fixs bad ids
    for (let i = 0; i < this.compactMapping[1].length; ++i) {
      const attrName = this.compactMapping[1][i];
      let value = elementJson[1][i];
      if (attrName == 'images') element.images = value;
      else if (attrName == 'name') element.name = capitalize(value);
      else if (attrName == 'address') {
        if (typeof value == 'string') value = JSON.parse(value);
        element.address = new PostalAddress(value);
      } else element.data[attrName] = value;
    }
    element.position = L.latLng(elementJson[2], elementJson[3]);
    App.elementOptionValuesModule.createOptionValues(elementJson[4], element);
    element.status = elementJson.length >= 6 ? elementJson[5] : 1;
    element.moderationState = elementJson.length >= 7 ? elementJson[6] : 0;
  }

  private loadFromFullJson(elementJson: any, element: Element | ElementBase) {
    // MADATORY DATA
    element.id = elementJson.id || elementJson['@id'];
    element.position = L.latLng(
      elementJson.latitude || elementJson.lat || (elementJson.geo && elementJson.geo.latitude),
      elementJson.longitude || elementJson.lng || elementJson.long || (elementJson.geo && elementJson.geo.longitude)
    );
    element.name = capitalize(elementJson.name || elementJson.title);
    element.address = new PostalAddress(elementJson.address);
    App.elementOptionValuesModule.createOptionValues(
      elementJson.categoriesFull || elementJson.categories || elementJson.taxonomy,
      element
    );

    // OPTIONAL DATA
    element.status = elementJson.status == undefined ? 1 : elementJson.status;
    element.moderationState = elementJson.moderationState || 0;
    element.searchScore = elementJson.searchScore;

    // SPECIFIC DATA
    element.openHours = elementJson.openHours;
    App.elementFormaterModule.calculateFormatedOpenHours(element);
    element.stamps = elementJson.stamps || [];
    element.geoJSONFeature = elementJson.geoJSONFeature;

    element.images = [];
    if (elementJson.image) element.images.push(elementJson.image);
    else if (elementJson.images) element.images = [].concat(elementJson.images);
    element.images = element.images.filter((imageUrl) => imageUrl.length > 5);

    element.files = [];
    if (elementJson.file) element.files.push(elementJson.file);
    else if (elementJson.files) element.files = [].concat(elementJson.files);
    element.files = element.files.filter((url) => url.length > 5);

    // CUSTOM DATA
    element.data = elementJson;

    // ADMIN HISTORY DATA
    element.reports = elementJson.reports;
    element.contributions = elementJson.contributions;
    element.pendingContribution = elementJson.pendingContribution;
    element.votes = elementJson.votes;

    // PENDING ELEMENTS
    if (elementJson.modifiedElement && element.status != -5) {
      const modifiedElement = new ElementBase(elementJson.modifiedElement);

      // calcul and store diff optionsValues in modified element
      App.elementOptionValuesModule.createOptionValues(
        elementJson.categoriesFull || elementJson.categories || elementJson.taxonomy,
        element
      );
      const diffOptionValues = App.elementDiffModule.getDiffOptionValues(
        element.optionsValues,
        modifiedElement.optionsValues
      );
      modifiedElement.optionsValues = diffOptionValues;

      element.modifiedElement = modifiedElement;
    }

    element.isFullyLoaded = true;
  }
}
