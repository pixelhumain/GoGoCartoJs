import { AppModule, AppStates } from "../../app.module";
import { Element, ViewPort, Event } from "../../classes/classes";
import { GeocodeResult, RawBounds } from "../../modules/geocoder.module";
import * as Cookies from "../../utils/cookies";
import { App } from "../../gogocarto";
declare var $, L : any;

/**
* The Map Component who encapsulate the map
*
* MapComponent publics methods must be as independant as possible
* from technology used for the map (leaflet ...)
*
* Map component is like an interface between the map and the rest of the App
*/
export class MapComponent
{
	onMapReady = new Event<any>();
	onMapLoaded = new Event<any>();
	onClick = new Event<any>();
	onIdle = new Event<any>();

	//Leaflet map
	map_ : L.Map = null;

	markerClustererGroup = null;
	isInitialized : boolean = false;
	isMapLoaded : boolean = false;
	oldZoom = -1;
	viewport : ViewPort = null;
	// requested bounds who could not be displayed when map not initialized (see fitbounds method)
	waitingBounds : L.LatLngBounds = null;

	getMap(){ return this.map_; }; 
	getCenter() : L.LatLng { return this.viewport ? L.latLng(this.viewport.lat, this.viewport.lng) : null; }
	getBounds() : L.LatLngBounds { return this.isMapLoaded ? this.map_.getBounds() : null; }
	getZoom() { return this.map_.getZoom(); }
	getOldZoom() { return this.oldZoom; }

	show() { $('#directory-content-map').show(); }
	
	hide() { $('#directory-content-map').hide(); }

	initialize() 
	{	
		if (this.isInitialized) { this.resize(); return; }

		let configTileLayers = App.config.map.tileLayers;
		let baseLayers = {};
		for(let tileLayer of configTileLayers)
		{
			baseLayers[tileLayer.name] = L.tileLayer(tileLayer.url, {attribution: tileLayer.attribution});
		}

		// Get defaultBaseLayer from Cookie if possible
		let baseLayerId = Cookies.readCookie('defaultBaseLayer');
		let defaultBaseLayer = baseLayers.hasOwnProperty(baseLayerId) ? baseLayers[baseLayerId] : baseLayers[App.config.map.defaultTileLayer];

		this.map_ = L.map('directory-content-map', {
		    zoomControl: false,
		    layers: [defaultBaseLayer]
		});

		this.markerClustererGroup = L.markerClusterGroup({
		    spiderfyOnMaxZoom: true,
		    showCoverageOnHover: false,
		    zoomToBoundsOnClick: true,
		    spiderfyOnHover: false,
		    spiderfyMaxCount: Infinity,
		    spiderfyDistanceMultiplier: 1.1,
		    chunkedLoading: true,
		    animate: false,
		    maxClusterRadius: (zoom) =>
		    {
		    	if (zoom > 10) return 60;
		    	if (zoom > 7) return 70;
		    	else return 70;
		    }
		});

		this.markerClustererGroup.on('spiderfied', (clusters, markers) =>
		{
			App.elementsModule.updateElementsIcons(true);
		});

		this.addMarkerClusterGroup();		

		L.control.zoom({position:'topright'}).addTo(this.map_);		
		L.control.layers(baseLayers, {}, {position:'topright', collapsed: false}).addTo(this.map_);

		this.map_.on('singleclick', (e) => { this.onClick.emit(); });
		this.map_.on('moveend', (e) => 
		{ 
			let visibleMarkersLength = $('.leaflet-marker-icon:visible').length;		
			App.boundsModule.extendMapBounds(this.oldZoom, this.map_.getZoom(), visibleMarkersLength);

			this.oldZoom = this.map_.getZoom();
			this.updateViewPort();
			
			this.onIdle.emit(); 
		});
		this.map_.on('load', (e) => 
		{ 
			this.isMapLoaded = true; 
			this.onMapLoaded.emit();			
		});

		this.resize();		

		this.isInitialized = true;

		// if we began with List Mode, when we initialize map
		// there is already an address geocoded or a viewport defined
		if (this.waitingBounds) this.fitBounds(this.waitingBounds, false);
		else if (this.viewport) setTimeout( () => { this.setViewPort(this.viewport); },200);
		//console.log("map init done");
		this.onMapReady.emit();
	};

	addMarkerClusterGroup() { this.map_.addLayer(this.markerClustererGroup); }

	resize()
	{
		//console.log("Resize, curr viewport :");
		// Warning !I changed the leaflet.js file library myself
		// because the options doesn't work properly
		// I changed it to avoid panning when resizing the map
		// be careful if updating the leaflet library this will
		// not work anymore
		if (this.map_) this.map_.invalidateSize(false);
	}

	addMarker(marker : L.Marker)
	{
		this.markerClustererGroup.addLayer(marker);
	}

	addMarkers(markers : L.Marker[])
	{
		if (this.markerClustererGroup) this.markerClustererGroup.addLayers(markers);
	}

	removeMarker(marker : L.Marker)
	{
		this.markerClustererGroup.removeLayer(marker);
	}

	removeMarkers(markers : L.Marker[])
	{
		if (this.markerClustererGroup) this.markerClustererGroup.removeLayers(markers);
	}

	clearMarkers()
	{
		if (this.markerClustererGroup) this.markerClustererGroup.clearLayers();
	}

	fitElementsBounds(elements : Element[])
	{
		let bounds = L.latLngBounds();
		for(let element of elements) bounds.extend(element.position);
		this.fitBounds(bounds);
	}

	// fit map view to bounds
	fitBounds(bounds : L.LatLngBounds, animate : boolean = true)
	{
		// console.log("fitbounds", bounds);
		if (!this.isInitialized)
		{
			this.waitingBounds = bounds;
			return;
		}
		/*if (this.isMapLoaded && animate) App.map().flyToBounds(bounds);
		else*/ App.map().fitBounds(bounds);
		setTimeout( () => { App.mapManager.handleMapIdle(); console.log("force idle"); }, 500);
	}		

	fitDefaultBounds()
	{
		this.fitBounds(App.boundsModule.defaultBounds);
	}

	panToLocation(location : L.LatLng, zoom?, animate : boolean = true)
	{
		zoom = zoom || this.getZoom() || 12;
		console.log("panTolocation", location);

		/*if (this.isMapLoaded && animate) this.map_.flyTo(location, zoom);
		else*/ this.map_.setView(location, zoom);
	};

	// the actual displayed map radius (distance from croner to center)
	mapRadiusInKm() : number
	{
		if (!this.isMapLoaded) return 0;
		return Math.floor(this.map_.getBounds().getNorthEast().distanceTo(this.map_.getCenter()) / 1000);
	}

	// distance from last saved location to a position
	distanceFromLocationTo(position : L.LatLng)
	{
		if (!App.geocoder.getLocation()) return null;
		return App.geocoder.getLocation().distanceTo(position) / 1000;
	}

	contains(position : L.LatLngExpression) : boolean
	{
		if (position && this.isMapLoaded)
		{
			 return this.map_.getBounds().contains(position);
		}
		console.log("MapComponent->contains : map not loaded or element position undefined");
		return false;		
	}

	extendedContains(position : L.LatLngExpression) : boolean
	{
		if (this.isMapLoaded && position)
		{
			 return App.boundsModule.extendedBounds.contains(position);
		}
		//console.log("MapComponent->contains : map not loaded or element position undefined");
		return false;
	}

	updateViewPort()
	{
		if (!this.viewport) this.viewport = new ViewPort();
		this.viewport.lat =  this.map_.getCenter().lat;
		this.viewport.lng =  this.map_.getCenter().lng;
		this.viewport.zoom = this.getZoom();
	}	

	setViewPort($viewport : ViewPort, $panMapToViewport : boolean = true)
	{		
		if (this.map_ && $viewport && $panMapToViewport)
		{
			//console.log("setViewPort", $viewport);
			let timeout = App.state == AppStates.ShowElementAlone ? 500 : 0;
			setTimeout( () => { this.map_.setView(L.latLng($viewport.lat, $viewport.lng), $viewport.zoom) }, timeout);
		}
		this.viewport = $viewport;
	}

	isMapBounds() { return this.getMap() && this.getMap().getBounds(); }
}
