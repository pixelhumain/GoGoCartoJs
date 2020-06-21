import { AppModule, AppStates } from '../../app.module';
import { Element } from '../../classes/classes';

import { App } from '../../gogocarto';
declare let $, L: any;

export class Marker {
  element: Element;
  private isAnimating = false;
  // we use leaflet markers to display marker on map. Marker is just a extension of leafletMarker
  private leafletMarker: L.Marker;
  // we may want to half hidden somes markers in particular states (setting opacity to .5)
  private halfHidden = false;
  // we unclesterize small clusters to show directly the markers. For the markers to be visible, wi inclinate some of them to right of left
  private inclination = 'normal';

  constructor(element: Element) {
    this.element = element;
    this.leafletMarker = L.marker(this.element.position, { riseOnHover: true });
    this.leafletMarker.on('click', (ev) => {
      App.mapManager.handleMarkerClick(this);
    });
    this.leafletMarker.on('mouseover', (ev) => {
      if (!this.isAnimating) this.element.showBigSize();
    });
    this.leafletMarker.on('mouseout', (ev) => {
      if (!this.isAnimating) this.element.showNormalSize();
    });
    this.leafletMarker.setIcon(
      L.divIcon({
        className: 'leaflet-marker-container',
        html: '<span id="marker-' + this.element.id + '" gogo-icon-marker></span>',
      })
    );
  }

  update() {
    const disableMarker = false;
    const showMoreIcon = true;

    const optionsToDisplay = this.element.getIconsToDisplay();

    const htmlMarker = App.templateModule.render('marker', {
      element: this.element,
      mainOptionToDisplay: optionsToDisplay[0],
      otherOptionsToDisplay: optionsToDisplay.slice(1),
      showMoreIcon: showMoreIcon,
      disableMarker: disableMarker,
      pendingClass: this.element.isPending() && App.config.isFeatureAvailable('pending') ? 'pending' : '',
      showPending: this.element.isPending() && App.config.isFeatureAvailable('pending'),
      config: App.config,
      popup: App.templateModule.elementTemplate.renderMarkerPopup(this.element.toDisplay()),
    });

    // save the class because it has been modified by marker cluster adding or
    // removing the "rotate" class
    const oldClassName = (<any>this.leafletMarker)._icon
      ? (<any>this.leafletMarker)._icon.className
      : 'leaflet-marker-container';
    oldClassName.replace('leaflet-marker-icon', '');
    this.leafletMarker.setIcon(L.divIcon({ className: oldClassName, html: htmlMarker }));
  }

  animateDrop() {
    this.isAnimating = true;
    this.domMarker().animate({ top: '-=25px' }, 300, 'easeInOutCubic');
    this.domMarker().animate({ top: '+=25px' }, 250, 'easeInOutCubic', () => {
      this.isAnimating = false;
      this.domMarker().css('top', 'auto');
    });
  }

  showBigSize() {
    this.addClassToLeafletMarker_('BigSize');
    const domMarker = this.domMarker();
    domMarker.parent().find('.marker-popup').show();
    domMarker.find('.moreIconContainer').show();
    domMarker.find('.gogo-icon-plus-circle').hide();
  }

  showNormalSize() {
    const domMarker = this.domMarker();
    this.removeClassToLeafletMarker_('BigSize');
    if (!App.config.marker.popupAlwaysVisible) domMarker.parent().find('.marker-popup').hide();
    domMarker.find('.moreIconContainer').hide();
    domMarker.find('.gogo-icon-plus-circle').show();
  }

  private addClassToLeafletMarker_(classToAdd) {
    this.domMarker().addClass(classToAdd);
    this.domMarker().siblings('.marker-popup').addClass(classToAdd);
  }

  private removeClassToLeafletMarker_(classToRemove) {
    this.domMarker().removeClass(classToRemove);
    this.domMarker().siblings('.marker-popup').removeClass(classToRemove);
  }

  domMarker() {
    return $('#marker-' + this.element.id);
  }

  getLeafletMarker(): L.Marker {
    return this.leafletMarker;
  }

  isHalfHidden(): boolean {
    return this.halfHidden;
  }

  getPosition(): L.LatLng {
    return this.leafletMarker.getLatLng();
  }
}
