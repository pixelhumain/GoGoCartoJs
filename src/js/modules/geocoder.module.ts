declare let GeocoderJS;
import { App } from "../gogocarto";
declare var L, $;

import { AppModule } from "../app.module";
import { slugify } from "../utils/string-helpers";
import { ViewPort, Event } from "../classes/classes";

/** results type returned by geocoderJS */
export interface GeocodeResult
{
	getCoordinates() : L.LatLngTuple;
	getFormattedAddress() : string;
	getBounds() : RawBounds;
}

// south, west, north, east
export type RawBounds = [number, number, number, number];

/**
* Interface between GeocoderJS and the App
* Allow to change geocode technology without changing code in the App
*/
export class GeocoderModule
{
	geocoder : any = null;
	lastAddressRequest : string = '';
	lastResults : GeocodeResult[] = null;
	lastResultBounds : L.LatLngBounds = null;

	private location : L.LatLng = null;

	onGeocodeResult = new Event<any>();
	onGeolocalizationResult = new Event<ViewPort>();

	getLocation() : L.LatLng
	{
		return this.location;
	}

	getBounds() : L.LatLngBounds
	{
		if (!this.lastResultBounds) return null;
		return this.lastResultBounds;
	}

	getLocationSlug() : string { return slugify(this.lastAddressRequest); }
	getLocationAddress() : string { return this.lastAddressRequest; }
	setLocationAddress($address : string) { this.lastAddressRequest = $address; }

	private latLngBoundsFromRawBounds(rawbounds : RawBounds) : L.LatLngBounds
	{
		let corner1 = L.latLng(rawbounds[0], rawbounds[1]);
		let corner2 = L.latLng(rawbounds[2], rawbounds[3]);
		return L.latLngBounds(corner1, corner2);
	}

	constructor()
	{
		this.geocoder = GeocoderJS.createGeocoder({ 'provider': 'openstreetmap', 'useSSL':true});
		//this.geocoder = GeocoderJS.createGeocoder({'provider': 'google', 'useSSL':true });
	}

	geocodeAddress( address, callbackComplete?, callbackFail? )
	{
		// console.log("geocode address : ", address);
		this.lastAddressRequest = address;

		// if no address, we show france
		if (address == '')
		{
			console.log("default location");
			this.lastResults = [];
			this.lastResultBounds = App.boundsModule.defaultBounds;

			this.onGeocodeResult.emit();

			// leave time for map to load
			if (callbackComplete) setTimeout( () => { callbackComplete(this.lastResults); }, 200);
		}
		else
		{
			// fake geocoder when no internet connexion
			let fake = false;

			if (!fake)
			{
				this.geocoder.geocode( address, (results : GeocodeResult[]) =>
				{
					if (results !== null && results.length > 0)
					{
						this.lastResults = results;
						this.lastResultBounds = this.latLngBoundsFromRawBounds(this.lastResults[0].getBounds());

						if (this.lastResults && this.lastResults[0]) this.location = L.latLng(this.lastResults[0].getCoordinates());
						else location = null;

						this.onGeocodeResult.emit();

						if (callbackComplete) callbackComplete(results);
					}
					else
					{
						if (callbackFail) callbackFail();
					}
				});
			}
			else
			{
				let result = {
					bounds: [.069185,-0.641415,44.1847351,-0.4699835],
					city: 'Labrit',
					formattedAddress: "Labrit 40420",
					latitude:44.1049567,
					longitude:-0.5445296,
					postal_code:"40420",
					region:"Nouvelle-Aquitaine",
					getBounds() { return this.bounds; },
					getCoordinates() { return [this.latitude, this.longitude]; },
					getFormattedAddress() { return this.formattedAddress; }
				}

				let results = [];
				results.push(result);

				this.lastResults = results;
				this.lastResultBounds = this.latLngBoundsFromRawBounds(this.lastResults[0].getBounds());

				callbackComplete(results);
			}
		}
	}

	geolocateUser(callbackComplete?, callbackError?, forceApi = false)
	{
		if ('geolocation' in navigator && !forceApi) {
			var geocodeOptions = {
			  enableHighAccuracy: true,
			  maximumAge        : 30000,
			  timeout           : 27000
			};

			navigator.geolocation.getCurrentPosition((position) => {
					// associate zoom to accuracy
					let zoom = 17 - Math.log(position.coords.accuracy / 3000) * Math.LOG2E;
					zoom = Math.min(zoom, 16);
					zoom = Math.max(zoom, 8);
					let viewPort = new ViewPort(position.coords.latitude, position.coords.longitude, zoom);
					this.handleGeolocalisationResponse(viewPort);
					callbackComplete(viewPort);
				},
				(error) => { this.geocodeError(callbackComplete, callbackError, error) },
				geocodeOptions
			);
		}
		else
		{
			console.log("geocode with API");
			$.getJSON("http://www.geoplugin.net/json.gp", (data) => {  // "http://ip-api.com/json/"
		    console.log("result", data);
		    if (data) {
			    let viewPort = new ViewPort(parseFloat(data.geoplugin_latitude), parseFloat(data.geoplugin_longitude), 14);
			    this.handleGeolocalisationResponse(viewPort);
			    callbackComplete(viewPort);
			   } else {
			   	 this.geocodeError(callbackComplete, callbackError);
			   }
			}).error(() => { this.geocodeError(callbackComplete, callbackError); });
		}
	}

	private geocodeError(callbackComplete, callbackError, error : any = {})
	{
		console.error("Erreur while geolocating", error);
		if (error.code == 1) {
			// permission denied with navigator geoloc
			App.component.toastMessage("Géolocalisation refusée", 6000);
		}
		else if (!error.code)
		{
			// Geocode with API failed
			App.component.toastMessage("La géolocalisation a échouée", 6000);
		}
		else
		{
			// error from navigator geoloc (unavailable or timeout), try with json API
			this.geolocateUser(callbackComplete, callbackError, true);
		}

		// Real error, we initialize to default bounds
		if (error.code == 1 || !error.code)
		{
			let viewport = new ViewPort(App.boundsModule.defaultCenter.lat, App.boundsModule.defaultCenter.lng, 7);
			this.handleGeolocalisationResponse(viewport);
			callbackError(viewport);
		}
	}
	private handleGeolocalisationResponse(viewPort : ViewPort)
	{
		this.location = viewPort.toLocation();
    this.onGeolocalizationResult.emit(viewPort);
	}
}