/**
 * This file is part of the MonVoisinFaitDuBio project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license    MIT License
 * @Last Modified time: 2016-12-13
 */

import { Event } from "../utils/event";
import { AppModule, AppStates } from "../app.module";
import { Element } from "../classes/element.class";

import { App } from "../gogocarto";
declare var $ : any;
declare let Routing;

export class Request
{
	constructor(public route : string, public data : any) {};
}

export class DataAroundRequest
{
	constructor(public originLat : number, public originLng : number, public distance :number, public maxResults : number, public mainOptionId : number) {};
}

export class AjaxModule
{
	onNewElements = new Event<any[]>();

	isRetrievingElements : boolean = false;

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
			success: response => 
			{	        
				//console.log("Ajax response", response);
				if (response)
				{					
					if (callbackSuccess) callbackSuccess(response); 						
				}				       
			},
			error: response =>
			{
				if (callbackFailure) callbackFailure(response.data); 		
			}
		});
	}

	getElementById(elementId, callbackSuccess?, callbackFailure?)
	{
		let start = new Date().getTime();
		let route = App.config.data.elementsApiUrl + '/' + elementId;

		$.ajax({
			url: route,
			method: "get",
			data: { },
			success: response => 
			{	        
				if (response)
				{
					let end = new Date().getTime();
					// console.log("receive elementById in " + (end-start) + " ms", response);		
					
					let elementJson;	
					if (response.data) elementJson = Array.isArray(response.data) ? response.data[0] : response.data;			
					else elementJson = response;

					if (callbackSuccess) callbackSuccess(elementJson); 
					//this.onNewElement.emit(response);							
				}	
				else if (callbackFailure) callbackFailure(response); 				       
			},
			error: response =>
			{
				if (callbackFailure) callbackFailure(response); 		
			}
		});
	};

	getElementsInBounds($bounds : L.LatLngBounds[], getFullRepresentation : boolean = false, expectedFilledBounds : L.LatLngBounds)
	{
		// if invalid location we abort
		if (!$bounds || $bounds.length == 0 || !$bounds[0]) { return; }

		let result = this.convertBoundsIntoParams($bounds);

		let dataRequest : any = { bounds : result.boundsString, 
															boundsJson : result.boundsJson,
															mainOptionId : App.currMainId, 
															fullRepresentation : getFullRepresentation, 
															ontology : getFullRepresentation ? 'gogofull' : 'gogocompact' };
		

		let route = App.config.data.elementsApiUrl;
		
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

		return {boundsString: stringifiedBounds, boundsJson: JSON.stringify(boundsLessDigits)};
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

		let start = new Date().getTime();			
		
		$.ajax({
			url: $request.route,
			method: "get",
			data: $request.data,
			beforeSend: () =>
			{ 				
				this.loaderTimer = setTimeout(function() { $('#directory-loading').show(); }, 1500); 
			},
			success: response =>
			{	
				console.log(response);

				if (response.data !== null)
				{
					let end = new Date().getTime();					
					// console.log("receive " + response.data.length + " elements in " + (end-start) + " ms. fullRepresentation", response.fullRepresentation);				

					if ($expectedFilledBounds)
					{
						App.boundsModule.updateFilledBoundsWithBoundsReceived($expectedFilledBounds, $request.data.mainOptionId,  $request.data.fullRepresentation);
					}
					this.onNewElements.emit(response);				
				}
			  
			  if (response.allElementsSends) this.allElementsReceived = true;

				//if (response.exceedMaxResult && !this.requestWaitingToBeExecuted) this.sendAjaxElementRequest(this.currRequest);     
			},
			complete: () =>
			{
			  this.isRetrievingElements = false;
			  clearTimeout(this.loaderTimer);
			  setTimeout( () => $('#directory-loading').hide(), 250);
			  if (this.requestWaitingToBeExecuted)
			  {
			  	 //console.log("REQUEST WAITING TO BE EXECUTED, fullRepresentation", this.waitingRequestFullRepresentation);
			  	 App.checkForNewElementsToRetrieve(this.waitingRequestFullRepresentation);
			  	 this.requestWaitingToBeExecuted = false;
			  }
			},
		});
	};
}