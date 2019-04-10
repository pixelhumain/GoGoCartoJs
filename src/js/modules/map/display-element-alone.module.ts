import { AppModule } from "../../app.module";
import { Element } from "../../classes/classes";

import { App } from "../../gogocarto";

export class DisplayElementAloneModule
{
	elementShownAlone_ = null;

	constructor() {}

	getElement() : Element { return this.elementShownAlone_; }

	begin(elementId : string, panToElementLocation : boolean = true) 
	{	
		// console.log("DisplayElementAloneModule begin", panToElementLocation);		

		if (this.elementShownAlone_ !== null) 
		{
			this.elementShownAlone_.hide();
			this.elementShownAlone_.isShownAlone = false;
		}

		let element = App.elementById(elementId);	
		this.elementShownAlone_ = element;			

		App.elementsModule.clearCurrentsElement();

		setTimeout( () => {
			App.infoBarComponent.showElement(element.id);	

			// we set a timeout to let the infobar show up
			// if we not do so, the map will not be centered in the element.position	
			if (panToElementLocation)
			{		
				App.mapComponent.resize();
				App.mapComponent.panToLocation(element.position, 12, false);
				setTimeout( () => { App.mapComponent.resize();App.mapComponent.panToLocation(element.position, 12, false); }, 500);
			}			
		}, 300);		
	};

	end() 
	{
		if (this.elementShownAlone_ === null) return;

		App.elementsModule.updateElementsToDisplay(true);
		
		this.elementShownAlone_.isShownAlone = false;	

		this.elementShownAlone_ = null;	
	};
}

