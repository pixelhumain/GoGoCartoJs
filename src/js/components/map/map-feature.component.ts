import { App } from '../../gogocarto';
import { Element } from '../../classes/classes';

export class MapFeatureComponent {
  private element: Element;
  private featureLayer_: L.GeoJSON;

  constructor(element: Element) {
    this.element = element;
    if (App.map()) {
      this.initialize();
    } else {
      App.mapComponent.onMapReady.do(() => this.initialize());
    }
  }

  private defaultStyle() {
    const props = this.element.geoJSONFeature.properties || {};
    const elementColor =
      App.taxonomyModule.getOptionById(this.element.colorOptionId).color || App.config.colors.textDark;
    return {
      fillColor: props['fill'] || elementColor,
      fillOpacity: props['fill-opacity'] || 0.4,
      color: props['stroke'] || elementColor,
      opacity: props['stroke-opacity'] || 1,
      weight: props['stroke-width'] || 2.5,
    };
  }

  private initialize() {
    this.featureLayer_ = L.geoJSON(this.element.geoJSONFeature, {
      style: () => this.defaultStyle(),
    }).addTo(App.map());

    this.featureLayer_.on('click', (ev: any) => {
      App.mapManager.handleMarkerClick(this.element.marker);
    });
    this.featureLayer_.on('mouseover', (ev: any) => {
      this.element.showBigSize();
    });
    this.featureLayer_.on('mouseout', (ev: any) => {
      this.element.showNormalSize();
    });
  }

  update() {
    this.featureLayer.setStyle(() => this.defaultStyle());
  }

  showBigSize() {
    this.featureLayer.setStyle(() => {
      return { weight: this.defaultStyle().weight * 1.5 };
    });
  }

  showNormalSize() {
    this.featureLayer.setStyle((feature) => {
      return { weight: this.defaultStyle().weight };
    });
  }

  get featureLayer(): L.GeoJSON {
    return this.featureLayer_;
  }
}
