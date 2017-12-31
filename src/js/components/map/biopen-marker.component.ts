/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates } from "../../app.module";
import { Element } from "../../classes/element.class";

import { App } from "../../gogocarto";
declare let $;

export class BiopenMarker
{
	id_ : string;
	isAnimating_ : boolean = false;
	leafletMarker_ : L.Marker;
	isHalfHidden_ : boolean = false;
	inclination_ = "normal";
	polyline_;

	constructor(id_ : string, position_ : L.LatLng) 
	{
		this.id_ = id_;

		if (!position_)
		{
			let element = this.getElement();
			if (element === null) window.console.log("element null id = "+ this.id_);
			else position_ = element.position;
		} 

		this.leafletMarker_ = L.marker(position_, { 'riseOnHover' : true});	
			
		this.leafletMarker_.on('click', (ev) =>
		{
			App.handleMarkerClick(this);	
  	});
	
		this.leafletMarker_.on('mouseover', (ev) =>
		{
			if (this.isAnimating_) { return; }
			this.showBigSize();
		});

		this.leafletMarker_.on('mouseout', (ev) =>
		{
			if (this.isAnimating_) { return; }			
			this.showNormalSize();
		});

		this.isHalfHidden_ = false;		

		this.leafletMarker_.setIcon(L.divIcon({className: 'leaflet-marker-container', html: "<span id=\"marker-"+ this.id_ + "\" gogo-icon-marker></span>"}));
	};	

	isDisplayedOnElementInfoBar()
	{
		return App.infoBarComponent.getCurrElementId() == this.id_;
	}

	domMarker()
	{
		return $('#marker-'+ this.id_);
	}

	animateDrop() 
	{
		this.isAnimating_ = true;
		this.domMarker().animate({top: '-=25px'}, 300, 'easeInOutCubic');
		this.domMarker().animate({top: '+=25px'}, 250, 'easeInOutCubic', 
			() => {this.isAnimating_ = false;} );
	};

	update() 
	{		
		let element = this.getElement();

		let disableMarker = false;
		let showMoreIcon = true;

		let optionstoDisplay = element.getIconsToDisplay();

		let htmlMarker = App.templateModule.render('marker', 
		{
			element : element, 
			mainOptionValueToDisplay: optionstoDisplay[0],
			otherOptionsValuesToDisplay: optionstoDisplay.slice(1), 
			showMoreIcon : showMoreIcon,
			disableMarker : disableMarker,
			pendingClass : element.isPending() && App.config.isFeatureAvailable('pending') ? 'pending' : '',
			showPending : element.isPending() && App.config.isFeatureAvailable('pending'),
		});

		// save the class because it has been modified by marker cluster adding or
		// removing the "rotate" class	
		let oldClassName = (<any>this.leafletMarker_)._icon ?  (<any>this.leafletMarker_)._icon.className : 'leaflet-marker-container';
		oldClassName.replace('leaflet-marker-icon', '');
  	this.leafletMarker_.setIcon(L.divIcon({className: oldClassName, html: htmlMarker}));	

  	if (this.isDisplayedOnElementInfoBar()) this.showBigSize();
	};

	private addClassToLeafletMarker_ (classToAdd) 
	{		
		this.domMarker().addClass(classToAdd);
		this.domMarker().siblings('.marker-name').addClass(classToAdd); 
	};

	private removeClassToLeafletMarker_ (classToRemove) 
	{		
		this.domMarker().removeClass(classToRemove);
		this.domMarker().siblings('.marker-name').removeClass(classToRemove);      
	};

	showBigSize() 
	{			
		this.addClassToLeafletMarker_("BigSize");
		let domMarker = this.domMarker();
		domMarker.parent().find('.marker-name').show();
		domMarker.find('.moreIconContainer').show();
		domMarker.find('.gogo-icon-plus-circle').hide();
	};

	showNormalSize($force : boolean = false) 
	{	
		if (!$force && this.isDisplayedOnElementInfoBar()) return;

		let domMarker = this.domMarker();
		this.removeClassToLeafletMarker_("BigSize");
		domMarker.parent().find('.marker-name').hide();
		domMarker.find('.moreIconContainer').hide();
		domMarker.find('.gogo-icon-plus-circle').show();
	};

	showHalfHidden($force : boolean = false) 
	{		
		if (!$force && this.isDisplayedOnElementInfoBar()) return;

		this.addClassToLeafletMarker_("halfHidden");
		let domMarker = this.domMarker();
		domMarker.css('z-index','1');
		domMarker.find('.gogo-icon-plus-circle').addClass("halfHidden");
		domMarker.find('.moreIconContainer').addClass("halfHidden");

		this.isHalfHidden_ = true;
	};

	showNormalHidden () 
	{		
		this.removeClassToLeafletMarker_("halfHidden");
		let domMarker = this.domMarker();
		domMarker.css('z-index','10');
		domMarker.find('.gogo-icon-plus-circle').removeClass("halfHidden");
		domMarker.find('.moreIconContainer').removeClass("halfHidden");

		this.isHalfHidden_ = false;
	};

	getId () : string { return this.id_; };

	getLeafletMarker () : L.Marker { return this.leafletMarker_; };

	isHalfHidden() : boolean { return this.isHalfHidden_; }

	getElement () : Element { return App.elementsModule.getElementById(this.id_); };

	checkPolylineVisibility_ (context) 
	{		
		if (context.leafletMarker_ === null) return;
		//window.console.log("checkPolylineVisibility_ " + context.leafletMarker_.getVisible());
		context.polyline_.setVisible(context.leafletMarker_.getVisible());	
		context.polyline_.setMap(context.leafletMarker_.getMap());	

		if (App.state == AppStates.ShowDirections) 
		{
			context.polyline_.setMap(null);	
			context.polyline_.setVisible(false);
		}	
	};

	getPosition () : L.LatLng
	{	
		return this.leafletMarker_.getLatLng();
	};
}

