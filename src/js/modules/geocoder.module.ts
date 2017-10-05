declare let GeocoderJS;
import { App } from "../gogocarto";
declare var L, $;

import { AppModule } from "../app.module";
import { slugify, capitalize, unslugify } from "../commons/commons";
import { Event } from "../utils/event";

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
	onGeolocalizationResult = new Event<L.LatLng>();

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
		//this.geocoder = GeocoderJS.createGeocoder({ 'provider': 'openstreetmap', 'countrycodes' : 'fr'});
		this.geocoder = GeocoderJS.createGeocoder({'provider': 'google', 'useSSL':true });
	}

	geocodeAddress( address, callbackComplete?, callbackFail? ) 
	{
		//console.log("geocode address : ", address);
		this.lastAddressRequest = address;

		// if no address, we show france
		if (address == '')
		{
			console.log("default location");
			this.lastResults = [];
			this.lastResultBounds = App.boundsModule.maxBounds;

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

	geolocateUser(callbackComplete?)
	{
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition((position) => {
				let latlng = L.latLng(position.coords.latitude, position.coords.longitude);
				this.handleGeolocalisationResponse(latlng, callbackComplete);
			});
		else
			$.getJSON("http://freegeoip.net/json/", (data) => {
		    let latlng = L.latLng(data.latitude, data.longitude);
		    this.handleGeolocalisationResponse(latlng, callbackComplete);
			});
	}

	private handleGeolocalisationResponse(latlng, callbackComplete)
	{
		this.location = latlng;
    this.onGeolocalizationResult.emit(latlng);
    callbackComplete(latlng);
	}
}