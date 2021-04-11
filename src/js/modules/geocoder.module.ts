import { App } from '../gogocarto';
import { ViewPort, Event } from '../classes/classes';
import { slugify } from '../utils/string-helpers';
import UniversalGeocoder, { Geocoded, GeocoderProvider } from 'universal-geocoder';
import { GoGoConfig } from '../classes/config/gogo-config.class';
import { BoundingBox } from 'universal-geocoder/src/types';

declare let L, $;

// south, west, north, east
export type RawBounds = [number, number, number, number];

/**
 * Interface between Universal Geocoder and GoGoCartoJS.
 * Allow to change geocoding technology without changing code in GoGoCartoJS.
 */
export class GeocoderModule {
  private geocoder: GeocoderProvider = null;
  private lastAddressRequest = '';
  private lastResults: Geocoded[] = [];
  private lastResultBounds: L.LatLngBounds = null;
  private location: L.LatLng = null;

  public onGeocodeResult = new Event<any>();
  public onGeolocalizationResult = new Event<ViewPort>();

  public initialize(): void {
    this.geocoder = UniversalGeocoder.createGeocoder({
      provider: App.config.search.geocodingProvider,
      useSsl: true,
      ...(App.config.search.geocodingProvider === GoGoConfig.GEOCODING_PROVIDER_NOMINATIM
        ? { userAgent: 'GoGoCartoJS' }
        : {}),
      ...(App.config.search.geocodingProvider === GoGoConfig.GEOCODING_PROVIDER_MAPBOX
        ? { apiKey: App.config.search.meta.apiKey }
        : {}),
    });
  }

  public getLocation(): null | L.LatLng {
    return this.location;
  }

  public getBounds(): null | L.LatLngBounds {
    return this.lastResultBounds;
  }

  public getLocationSlug(): string {
    return slugify(this.lastAddressRequest);
  }

  public getLocationAddress(): string {
    return this.lastAddressRequest;
  }

  public latLngBoundsFromRawBounds(rawbounds: BoundingBox): L.LatLngBounds {
    if (!rawbounds) return null
    const corner1 = L.latLng(rawbounds.latitudeSW, rawbounds.longitudeSW);
    const corner2 = L.latLng(rawbounds.latitudeNE, rawbounds.longitudeNE);

    return L.latLngBounds(corner1, corner2);
  }

  public geocodeAddress(
    address: string,
    callbackComplete?: (results: Geocoded[]) => void,
    callbackFail?: () => void
  ): void {
    if (!this.geocoder) return;

    this.lastAddressRequest = address;

    // if no address, we show france
    if (address == '') {
      this.lastResults = [];
      this.lastResultBounds = App.boundsModule.defaultBounds;

      this.onGeocodeResult.emit();

      // leave time for map to load
      if (callbackComplete) {
        setTimeout(() => {
          callbackComplete(this.lastResults);
        }, 200);
      }

      return;
    }

    // fake geocoder when no internet connexion
    const fake = false;

    if (!fake) {
      this.geocoder.geocode(
        {
          text: address,
          locale: App.config.language,
          bounds: {
            latitudeSW: App.config.map.maxBounds.getSouthWest().lat,
            longitudeSW: App.config.map.maxBounds.getSouthWest().lng,
            latitudeNE: App.config.map.maxBounds.getNorthEast().lat,
            longitudeNE: App.config.map.maxBounds.getNorthEast().lng,
          },
          shape: "geojson",
          limit: 1          
        },
        (results: Geocoded[]) => {
          if (results.length <= 0) {
            if (callbackFail) {
              callbackFail();
            }
            return;
          }

          this.lastResults = results;
          this.lastResultBounds = this.latLngBoundsFromRawBounds(this.lastResults[0].getBounds());

          if (this.lastResults && this.lastResults[0]) {
            this.location = L.latLng(this.lastResults[0].getCoordinates());
          } else {
            this.location = null;
          }

          this.onGeocodeResult.emit();

          if (callbackComplete) {
            callbackComplete(results);
          }
        }
      );
    } else {
      const result = {
        bounds: [0.069185, -0.641415, 44.1847351, -0.4699835],
        city: 'Labrit',
        formattedAddress: 'Labrit 40420',
        latitude: 44.1049567,
        longitude: -0.5445296,
        postal_code: '40420',
        region: 'Nouvelle-Aquitaine',
        getBounds() {
          return this.bounds;
        },
        getCoordinates() {
          return [this.latitude, this.longitude];
        },
        getFormattedAddress() {
          return this.formattedAddress;
        },
      };

      const results = [];
      results.push(result);

      this.lastResults = results;
      this.lastResultBounds = this.latLngBoundsFromRawBounds(this.lastResults[0].getBounds());

      callbackComplete(results);
    }
  }

  public geolocateUser(
    callbackComplete?: (viewPort: ViewPort) => void,
    callbackError?: (viewPort: ViewPort) => void,
    forceApi = false
  ): void {
    if ('geolocation' in navigator && !forceApi) {
      const geocodeOptions = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // associate zoom to accuracy
          let zoom = 17 - Math.log(position.coords.accuracy / 3000) * Math.LOG2E;
          zoom = Math.min(zoom, 16);
          zoom = Math.max(zoom, 8);
          const viewPort = new ViewPort(position.coords.latitude, position.coords.longitude, zoom);
          this.handleGeolocalisationResponse(viewPort);
          callbackComplete(viewPort);
        },
        (error) => {
          this.geocodeError(callbackComplete, callbackError, error);
        },
        geocodeOptions
      );
    } else {
      $.getJSON('https://www.geoplugin.net/json.gp', (data) => {
        if (!data) {
          this.geocodeError(callbackComplete, callbackError);
          return;
        }

        const viewPort = new ViewPort(parseFloat(data.geoplugin_latitude), parseFloat(data.geoplugin_longitude), 14);
        this.handleGeolocalisationResponse(viewPort);
        callbackComplete(viewPort);
      }).error(() => {
        this.geocodeError(callbackComplete, callbackError);
      });
    }
  }

  private geocodeError(
    callbackComplete?: (viewPort: ViewPort) => void,
    callbackError?: (viewPort: ViewPort) => void,
    error: any = {}
  ): void {
    if (error.code == 1) {
      // permission denied with navigator geoloc
      App.component.toastMessage(App.config.translate('geolocation.error.refused'), 6000);
    } else if (!error.code) {
      // Geocode with API failed
      App.component.toastMessage(App.config.translate('geolocation.error.failed'), 6000);
    } else {
      // error from navigator geoloc (unavailable or timeout), try with json API
      this.geolocateUser(callbackComplete, callbackError, true);
    }

    // Real error, we initialize to default bounds
    if (error.code == 1 || !error.code) {
      const viewport = new ViewPort(App.boundsModule.defaultCenter.lat, App.boundsModule.defaultCenter.lng, 7);
      this.handleGeolocalisationResponse(viewport);
      callbackError(viewport);
    }
  }

  private handleGeolocalisationResponse(viewPort: ViewPort): void {
    this.location = viewPort.toLocation();
    this.onGeolocalizationResult.emit(viewPort);
  }
}
