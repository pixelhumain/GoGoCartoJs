import { App } from '../../gogocarto';
import { Element } from '../../classes/classes';

export class MapFeatureComponent {
    private element: Element;
    private featureLayer_: L.GeoJSON;

    constructor(element: Element) {
        this.element = element;
        this.initialize();
    }

    private initialize() {
        this.featureLayer_ = L.geoJSON(this.element.geoJSONFeature, {
            style: function (feature) {
                let props = feature.properties || {};
                return {
                    fillColor: props['fill'] || App.config.colors.secondary,
                    fillOpacity: props['fill-opacity'] || 0.6,
                    color: props['stroke'] || App.config.colors.textDark,
                    opacity: props['stroke-opacity'] || 1,
                    weight: props['stroke-width'] || 2
                };
            }
        }).addTo(App.mapComponent.map_);

        this.featureLayer_.on('click', (ev: any) => {
            App.mapManager.handleMarkerClick(this.element.marker);
        });
        this.featureLayer_.on('mouseover', (ev: any) => {
            this.showBigSize(ev.originalEvent.target);
        });
        this.featureLayer_.on('mouseout', (ev: any) => {
            this.showNormalSize(ev.originalEvent.target);
        });
    }

    showBigSize(eventTarget) {
        this.element.marker.showBigSize();
        eventTarget.classList.add('PathHover');
    }

    showNormalSize(eventTarget) {
        this.element.marker.showNormalSize();
        eventTarget.classList.remove('PathHover');
    }

    get featureLayer(): L.GeoJSON {
        return this.featureLayer_;
    }
}
