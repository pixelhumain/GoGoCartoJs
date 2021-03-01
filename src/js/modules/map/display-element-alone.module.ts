import { AppModule } from '../../app.module';
import { Element } from '../../classes/classes';

import { App } from '../../gogocarto';

export class DisplayElementAloneModule {
  elementShownAlone_ = null;

  constructor() {}

  getElement(): Element {
    return this.elementShownAlone_;
  }

  begin(elementId: string, panToElementLocation = true) {
    // console.log("DisplayElementAloneModule begin", panToElementLocation);

    if (this.elementShownAlone_ !== null) {
      this.elementShownAlone_.hide();
      this.elementShownAlone_.isShownAlone = false;
    }

    const element = App.elementById(elementId);
    this.elementShownAlone_ = element;

    App.elementsModule.clearCurrentsElement();
    App.infoBarComponent.showElement(element.id);
    
    if (panToElementLocation) {
      // we set a timeout to let the infobar show up
      // if we not do so, the map will not be centered in the element.position
      setTimeout(() => {
        App.mapComponent.panToLocation(element.position, 12, false);
        App.mapComponent.resize();
        App.mapComponent.panToLocation(element.position, 12, false);
      }, 350);
    }
  }

  end() {
    if (this.elementShownAlone_ === null) return;

    App.elementsModule.updateElementsToDisplay(true);

    this.elementShownAlone_.isShownAlone = false;

    this.elementShownAlone_ = null;
  }
}
