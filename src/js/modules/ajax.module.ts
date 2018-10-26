/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

import { Event } from "../classes/event.class";
import { AppModule, AppStates } from "../app.module";
import { Element } from "../classes/classes";

import { App } from "../gogocarto";
declare var $ : any, L : any;
declare let Routing;

export class Request
{
	constructor(public route : string, public data : any) {};
}

export class AjaxModule
{
	onNewElements = new Event<any[]>();

	isRetrievingElements : boolean = false;

	currElementIdRetrieving : number;
	currBoundsRetrieving : L.LatLngBounds[];

	requestWaitingToBeExecuted : boolean = false;
	waitingRequestFullRepresentation : boolean = null;

	currRequest : Request = null;

	loaderTimer = null;

	allElementsReceived = false;

	constructor() { }  

	sendRequest(route : string, method : string, data : any, callbackSuccess?, callbackFailure?)
	{
		//console.log("SendAjaxRequest to " + route, data);
		$.ajax({
			url: route,
			method: method,
			data: data,
			success: response => { if (response && callbackSuccess) callbackSuccess(response); },
			error: response => { if (callbackFailure) callbackFailure(response.data); }
		});
	}

	getElementById(elementId, callbackSuccess?, callbackFailure?)
	{
		if (elementId == this.currElementIdRetrieving) return;		
		this.currElementIdRetrieving = elementId;
		
		$.ajax({
			url: this.getSingleElementApiUrl(elementId),
			method: "post",
			data: { },
			success: response => 
			{	        
				if (response)
				{					
					let elementJson;	
					if (response.data) elementJson = Array.isArray(response.data) ? response.data[0] : response.data;			
					else elementJson = response;

					if (callbackSuccess) callbackSuccess(elementJson); 					
				}	
				else if (callbackFailure) callbackFailure(response); 
				
				this.currElementIdRetrieving = null;				       
			},
			error: response => { if (callbackFailure) callbackFailure(response); this.currElementIdRetrieving = null; }
		});
	};

	getElementsInBounds($bounds : L.LatLngBounds[], getFullRepresentation : boolean = false, expectedFilledBounds : L.LatLngBounds)
	{
		if (this.currBoundsRetrieving && $bounds[0].equals(this.currBoundsRetrieving[0])) return;		
		this.currBoundsRetrieving = $bounds;

		// if invalid location we abort
		if (!$bounds || $bounds.length == 0 || !$bounds[0]) { return; }

		let boundsResult = this.convertBoundsIntoParams($bounds);

		let bnds = boundsResult.boundsJson;
		let dataRequest : any = { 
															bounds : boundsResult.boundsString, 
															boundsJson : JSON.stringify(boundsResult.boundsJson),
															categories : App.currMainId != "all" ? [App.currMainId] : null,
															fullRepresentation : getFullRepresentation, 
															ontology : getFullRepresentation ? 'gogofull' : 'gogocompact',
															stampsIds : App.request.stampsIds
														};		
		let route;
		if (getFullRepresentation) route = App.config.data.elements;
		else route = App.config.data.elementsCompactApiUrl || App.config.data.elements;
		
		this.sendAjaxElementRequest(new Request(route, dataRequest), expectedFilledBounds);
	}	

	private convertBoundsIntoParams($bounds : L.LatLngBounds[]) 
	{
		let stringifiedBounds = "";
		let digits = 5;
		let boundsLessDigits = [];
		for (let bound of $bounds)
		{
			let southWest = L.latLng(L.Util.formatNum(bound.getSouthWest().lat, digits), L.Util.formatNum(bound.getSouthWest().lng, digits))
			let nortEast = L.latLng(L.Util.formatNum(bound.getNorthEast().lat, digits), L.Util.formatNum(bound.getNorthEast().lng, digits))
			bound = L.latLngBounds(southWest, nortEast);
			boundsLessDigits.push(bound);
			stringifiedBounds += bound.toBBoxString() + ";";
		}

		// some API endpoint needs a fixed number of bounds equals to 4
		if ($bounds.length < 4)
		{
			let emptyBound = L.latLngBounds(L.latLng(0,0), L.latLng(0,0));
			for (var i = $bounds.length; i < 4; i++) boundsLessDigits.push(emptyBound);			
		}

		return {boundsString: stringifiedBounds, boundsJson: boundsLessDigits};
	}

	private getSingleElementApiUrl($elementId : any) : string
	{
		let route = "";
		if (App.config.data.elementByIdUrl) 
		{
			route = App.config.data.elementByIdUrl;
			if (route.indexOf('{ID}') > 0) route = route.replace('{ID}', $elementId.toString());
			else 
			{
				if (route.slice(-1) != '/') route += '/';
				route += $elementId;
			}
		}
		else route = App.config.data.elements + '/' + $elementId;
		return route;
	}

	private sendAjaxElementRequest($request : Request, $expectedFilledBounds = null)
	{
		if (this.allElementsReceived) { /*console.log("All elements already received");*/ return; }

		// console.log("Ajax send elements request ", $request);

		if (this.isRetrievingElements)
		{		
			//console.log("Ajax isRetrieving");
			this.requestWaitingToBeExecuted = true;
			this.waitingRequestFullRepresentation = $request.data.fullRepresentation;
			return;
		}

		this.isRetrievingElements = true;
		this.currRequest = $request;
		// let start = new Date().getTime();			
		
		$.ajax({
			url: $request.route,
			method: "post",
			data: $request.data,
			beforeSend: () =>
			{ 				
				this.loaderTimer = setTimeout(function() { $('#directory-loading').show(); }, 1500); 
			},
			success: response =>
			{	
				if (response.data !== null)
				{
					// let end = new Date().getTime();					
					// console.log("receive " + response.data.length + " elements in " + (end-start) + " ms. fullRepresentation", response.fullRepresentation);				

					response.fullRepresentation = response.ontology == "gogocompact" ? false : true;
					
					if ($expectedFilledBounds)
						App.boundsModule.updateFilledBoundsWithBoundsReceived($expectedFilledBounds, $request.data.mainOptionId,  $request.data.fullRepresentation);

					if (response.allElementsSends || !App.config.data.requestByBounds) this.allElementsReceived = true;

					this.onNewElements.emit(response);				
				}			     
			},
			complete: () =>
			{
			  this.isRetrievingElements = false;
			  this.currBoundsRetrieving = null; 
			  clearTimeout(this.loaderTimer);
			  setTimeout( () => $('#directory-loading').hide(), 250);
			  if (this.requestWaitingToBeExecuted)
			  {
			  	 //console.log("REQUEST WAITING TO BE EXECUTED, fullRepresentation", this.waitingRequestFullRepresentation);
			  	 App.elementsManager.checkForNewElementsToRetrieve(this.waitingRequestFullRepresentation);
			  	 this.requestWaitingToBeExecuted = false;
			  }
			},
		});
	};
}