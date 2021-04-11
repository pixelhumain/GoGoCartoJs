import { AppStates, AppModes } from '../../app.module';
import { Element, ViewPort, Event } from '../../classes/classes';
import * as Cookies from '../../utils/cookies';
import { App } from '../../gogocarto';
import { MapFeatureComponent } from './map-feature.component';

declare module 'leaflet' {
  function markerClusterGroup(options?: any): any;
}

/**
 * The Map Component who encapsulate the map
 *
 * MapComponent publics methods must be as independant as possible
 * from technology used for the map (leaflet ...)
 *
 * Map component is like an interface between the map and the rest of the App
 */
export class MapComponent {
  onMapReady = new Event<any>();
  onMapLoaded = new Event<any>();
  onClick = new Event<any>();
  onIdle = new Event<any>();

  //Leaflet map
  map_: L.Map = null;

  markersGroup = null;
  featuresGroup = null;
  isInitialized = false;
  isMapLoaded = false;
  oldZoom = -1;
  viewport: ViewPort = null;
  // requested bounds who could not be displayed when map not initialized (see fitbounds method)
  waitingBounds: L.LatLngBounds = null;

  getMap() {
    return this.map_;
  }
  getCenter(): L.LatLng {
    return this.viewport ? L.latLng(this.viewport.lat, this.viewport.lng) : null;
  }
  getBounds(): L.LatLngBounds {
    return this.isMapLoaded ? this.map_.getBounds() : null;
  }
  getZoom() {
    return this.map_.getZoom();
  }
  getOldZoom() {
    return this.oldZoom;
  }

  show() {
    $('#directory-content-map').show();
  }

  hide() {
    $('#directory-content-map').hide();
  }

  initialize() {
    if (this.isInitialized) {
      this.resize();
      return;
    }

    const configTileLayers = App.config.map.tileLayers;
    const baseLayers = {};
    for (const tileLayer of configTileLayers) {
      baseLayers[tileLayer.name] = L.tileLayer(tileLayer.url, {
        attribution: tileLayer.attribution,
      });
    }

    // Get defaultBaseLayer from Cookie if possible
    const baseLayerId = App.config.map.saveTileLayerInCookies ? Cookies.readCookie('defaultBaseLayer') : null;
    const defaultBaseLayer = baseLayers.hasOwnProperty(baseLayerId)
      ? baseLayers[baseLayerId]
      : baseLayers[App.config.map.defaultTileLayer];

    this.map_ = L.map('directory-content-map', {
      zoomControl: false,
      attributionControl: false,
      layers: [defaultBaseLayer],
    });

    L.control
      .attribution({
        prefix:
          '<a target="_blank" href="https://pixelhumain.gitlab.io/GoGoCartoJs">GoGoCarto</a> | <a target="_blank" href="https://leafletjs.com">Leaflet</a>',
      })
      .addTo(this.map_);

    setTimeout(function () {
      $('.leaflet-control-zoom').addClass('gogo-section-controls');
      $('.leaflet-control-zoom a').addClass('gogo-color-link');
      $('.leaflet-control-layers').addClass('gogo-section-controls');
    }, 0);

    // Note : Mapbox's simplestyle-spec is used as reference for style props and default values
    // @see https://github.com/mapbox/simplestyle-spec
    if (App.config.map.geojsonLayers) {
      typeof App.config.map.geojsonLayers === 'string'
        ? this.loadRemoteGeoJSON(this.map_, App.config.map.geojsonLayers)
        : this.loadInlineGeoJSON(this.map_, App.config.map.geojsonLayers);
    }

    if (App.config.map.useClusters) {
      this.markersGroup = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnHover: false,
        spiderfyMaxCount: Infinity,
        spiderfyDistanceMultiplier: 1.1,
        chunkedLoading: true,
        animate: false,
        iconCreateFunction: function (cluster) {
          const childCount = cluster.getChildCount();

          let c = ' marker-cluster-';
          if (childCount < 10) {
            c += 'small';
          } else if (childCount < 100) {
            c += 'medium';
          } else if (childCount < 1000) {
            c += 'large';
          } else {
            c += 'large xl';
          }

          return new L.DivIcon({
            html: '<div><span>' + childCount + '</span></div>',
            className: 'marker-cluster' + c,
            iconSize: new L.Point(40, 40),
          });
        },
        maxClusterRadius: (zoom) => {
          if (zoom > 10) return 60;
          if (zoom > 7) return 70;
          else return 70;
        },
      });
    } else {
      this.markersGroup = L.layerGroup([]);
    }

    this.markersGroup.on('spiderfied', (clusters, markers) => {
      App.elementsModule.updateElementsIcons(true);
    });

    this.map_.addLayer(this.markersGroup);

    this.featuresGroup = L.layerGroup([]);
    this.map_.addLayer(this.featuresGroup);

    L.control.zoom({ position: 'topright' }).addTo(this.map_);
    L.control.layers(baseLayers, {}, { position: 'topright', collapsed: false }).addTo(this.map_);

    this.map_.on('singleclick', (e) => {
      this.onClick.emit();
    });
    this.map_.on('moveend', (e) => {
      if (App.mode != AppModes.Map) return;
      const visibleMarkersLength = $('.leaflet-marker-icon:visible').length;
      App.boundsModule.extendMapBounds(this.oldZoom, this.map_.getZoom(), visibleMarkersLength);

      this.updateViewPort();
      this.onIdle.emit();
      this.oldZoom = this.map_.getZoom();
    });
    this.map_.on('load', (e) => {
      this.isMapLoaded = true;
      this.onMapLoaded.emit();
    });

    this.resize();
    this.isInitialized = true;

    // if we began with List Mode, when we initialize map
    // there is already an address geocoded or a viewport defined
    if (this.waitingBounds) this.fitBounds(this.waitingBounds, false);
    else if (this.viewport)
      setTimeout(() => {
        this.setViewPort(this.viewport);
      }, 200);

    this.onMapReady.emit();
  }

  resize() {
    //console.log("Resize, curr viewport :");
    // Warning !I changed the leaflet.js file library myself
    // because the options doesn't work properly
    // I changed it to avoid panning when resizing the map
    // be careful if updating the leaflet library this will
    // not work anymore
    if (this.map_) this.map_.invalidateSize(false);
  }

  addMarker(marker: L.Marker) {
    this.markersGroup.addLayer(marker);
  }

  addMarkers(markers: L.Marker[]) {
    if (!this.markersGroup) return;
    if (App.config.map.useClusters) this.markersGroup.addLayers(markers);
    else {
      for (const marker of markers) this.addMarker(marker);
    }
  }

  removeMarker(marker: L.Marker) {
    this.markersGroup.removeLayer(marker);
  }

  removeMarkers(markers: L.Marker[]) {
    if (!this.markersGroup) return;
    if (App.config.map.useClusters) this.markersGroup.removeLayers(markers);
    else {
      for (const marker of markers) this.removeMarker(marker);
    }
  }

  clearMarkers() {
    if (this.markersGroup) this.markersGroup.clearLayers();
  }

  addFeature(feature: MapFeatureComponent) {
    this.featuresGroup.addLayer(feature.featureLayer);
  }

  addFeatures(features: MapFeatureComponent[]) {
    if (!this.featuresGroup) return;
    for (const feat of features) this.addFeature(feat);
  }

  removeFeatures(features: MapFeatureComponent[]) {
    if (!this.featuresGroup) return;
    for (const feat of features) this.removeFeature(feat);
  }

  removeFeature(feature: MapFeatureComponent) {
    this.featuresGroup.removeLayer(feature.featureLayer);
  }

  fitElementsBounds(elements: Element[]) {
    const bounds = L.latLngBounds([]);
    for (const element of elements) bounds.extend(element.position);
    this.fitBounds(bounds);
  }

  // fit map view to bounds
  fitBounds(bounds: L.LatLngBounds, animate = true) {
    if (!bounds) return;
    // console.log("fitbounds", bounds);
    if (!this.isInitialized) {
      this.waitingBounds = bounds;
      return;
    }
    /*if (this.isMapLoaded && animate) App.map().flyToBounds(bounds);
		else*/ App.map().fitBounds(bounds);
    setTimeout(() => {
      App.mapManager.handleMapIdle();
      console.log('force idle');
    }, 500);
  }

  fitDefaultBounds() {
    this.fitBounds(App.boundsModule.defaultBounds);
  }

  panToLocation(location: L.LatLng, zoom?, animate = true) {
    zoom = zoom || this.getZoom() || 12;
    // console.log("panTolocation", location);

    /*if (this.isMapLoaded && animate) this.map_.flyTo(location, zoom);
		else*/ this.map_.setView(location, zoom);
  }

  // distance from last saved location to a position
  distanceFromLocationTo(position: L.LatLng) {
    if (!App.geocoder.getLocation()) return null;
    return App.geocoder.getLocation().distanceTo(position) / 1000;
  }

  contains(position: L.LatLngExpression): boolean {
    if (position && this.isMapLoaded) {
      return this.map_.getBounds().contains(position);
    }
    console.log('MapComponent->contains : map not loaded or element position undefined');
    return false;
  }

  extendedContains(position: L.LatLngExpression): boolean {
    if (this.isMapLoaded && position) {
      return App.boundsModule.extendedBounds.contains(position);
    }
    //console.log("MapComponent->contains : map not loaded or element position undefined");
    return false;
  }

  updateViewPort() {
    if (!this.viewport) this.viewport = new ViewPort();
    this.viewport.lat = this.map_.getCenter().lat;
    this.viewport.lng = this.map_.getCenter().lng;
    this.viewport.zoom = this.getZoom();
  }

  setViewPort($viewport: ViewPort, $panMapToViewport = true) {
    if (this.map_ && $viewport && $panMapToViewport) {
      //console.log("setViewPort", $viewport);
      const timeout = App.state == AppStates.ShowElementAlone ? 500 : 0;
      setTimeout(() => {
        this.map_.setView(L.latLng($viewport.lat, $viewport.lng), $viewport.zoom);
      }, timeout);
    }
    this.viewport = $viewport;
  }

  isMapBounds() {
    return this.getMap() && this.getMap().getBounds();
  }

  hasZoomedIn() {
    const zoom = this.getZoom();
    const old_zoom = this.getOldZoom();
    return zoom != old_zoom && old_zoom != -1 && zoom > old_zoom;
  }

  loadInlineGeoJSON(map, layersConfig) {
    const featuresCollection = layersConfig as GeoJSONFeatureCollection;
    if (featuresCollection.features) {
      for (const geoJSONFeature of featuresCollection.features) {
        L.geoJSON(geoJSONFeature, {
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
          },
          style: function (feature) {
            const props = feature.properties || {};
            return {
              fillColor: props['fill'] || App.config.colors.secondary,
              fillOpacity: props['fill-opacity'] || 0.6,
              color: props['stroke'] || App.config.colors.textDark,
              opacity: props['stroke-opacity'] || 1,
              weight: props['stroke-width'] || 2,
            };
          },
        }).addTo(map);
      }
    }
  }

  loadRemoteGeoJSON(map, layersConfigUrl: string) {
    $.ajax({
      url: layersConfigUrl,
      method: 'get',
      success: (response) => {
        if (typeof response === 'string') response = JSON.parse(response);
        if (response.features !== null) {
          this.loadInlineGeoJSON(map, response);
        }
      },
    });
  }
}
