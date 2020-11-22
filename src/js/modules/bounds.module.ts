import { AppModule, AppStates } from '../app.module';
import { Element } from '../classes/classes';
import { GoGoConfig } from '../classes/config/gogo-config.class';
import { App } from '../gogocarto';
declare let L;

export class BoundsModule {
  // we extend visible viexport to load elements on this area, so the user see them directly when panning or zoom out
  extendedBounds: L.LatLngBounds;

  // the bounds where elements has already been retrieved
  // we save one filledBound per mainOptionId
  // and one filledBound per level of element representation
  fullRepresentationFilledBound: L.LatLngBounds[] = [];
  compactRepresentationFilledBound: L.LatLngBounds[] = [];

  // indicate if we already retrieved all elements of the max bounds
  fullRepresentationRetrievingComplete: boolean[] = [];
  compactRepresentationRetrievingComplete: boolean[] = [];

  // we don't download elements outside of maxBounds
  maxBounds: L.LatLngBounds;
  defaultBounds: L.LatLngBounds;
  defaultCenter: L.LatLng;

  constructor(config: GoGoConfig) {
    this.maxBounds = config.map.maxBounds;
    this.defaultBounds = config.map.defaultBounds;
    this.defaultCenter = config.map.defaultCenter;
  }

  initialize() {
    for (const mainOptionId of App.taxonomyModule.getMainOptionsIdsWithAll()) {
      this.fullRepresentationFilledBound[mainOptionId] = null;
      this.compactRepresentationFilledBound[mainOptionId] = null;
      this.fullRepresentationRetrievingComplete[mainOptionId] = false;
      this.compactRepresentationRetrievingComplete[mainOptionId] = false;
    }
  }

  createBoundsFromLocation($location: L.LatLng, $radius = 10) {
    const degree = $radius / 110 / 2;
    this.extendedBounds = L.latLngBounds(
      L.latLng($location.lat - degree, $location.lng - degree),
      L.latLng($location.lat + degree, $location.lng + degree)
    );
    // console.log("CREATE BOUNDS from loaction", this.extendedBounds);
    // if (this.extendedBounds) L.rectangle(this.extendedBounds, {color: "blue", weight: 3}).addTo(App.map());
  }

  log = false;
  // the actual displayed bounds radius (distance from corner to center)
  boundsRadiusInKm(): number {
    if (!App.mapComponent.isInitialized) return null;
    const bounds = App.map().getBounds();
    return Math.floor(bounds.getNorthEast().distanceTo(bounds.getCenter()) / 1000);
  }

  extendMapBounds($oldZoom, $newZoom, $numberMarkerVisible) {
    let ratio;
    if ($newZoom == $oldZoom) {
      ratio = 0.5 / Math.pow($numberMarkerVisible / 100, 2);
      ratio = Math.min(0.5, ratio);
      ratio = Math.round(ratio * 10) / 10;
    } else {
      ratio = 0;
    }
    if (this.log) console.log('extend map bounds', App.map().getBounds());
    App.boundsModule.extendBounds(ratio, App.map().getBounds());
  }

  extendBounds($ratio: number, $bounds: L.LatLngBounds = this.extendedBounds) {
    if (this.log) console.log('current bounds', $bounds, 'extended', this.extendedBounds, 'ratio', $ratio);
    if (this.currRetrievingComplete(true)) {
      this.extendedBounds = this.maxBounds;
      return null;
    }
    if (!$bounds) {
      if (this.log) console.log('bounds uncorrect', $bounds);
      return null;
    }
    this.extendedBounds = $bounds.pad($ratio);
    if (this.log) console.log('new bounds', this.extendedBounds);
    return this.extendedBounds;
  }

  updateFilledBoundsAccordingToNewMainOptionId() {
    if (App.currMainId == 'all') {
      // nothing to do
    } else {
      // if fillebounds for category 'all' contains the filledbound of other category
      // we set fillebound from other category to filledBound "all"
      this.tryToExtendFilledBoundFromAllCategory(this.fullRepresentationFilledBound);
      this.tryToExtendFilledBoundFromAllCategory(this.compactRepresentationFilledBound);
    }
  }

  private tryToExtendFilledBoundFromAllCategory($filledBound) {
    if (
      $filledBound['all'] &&
      (!$filledBound[App.currMainId] || $filledBound['all'].contains($filledBound[App.currMainId]))
    ) {
      $filledBound[App.currMainId] = $filledBound['all'];
    }
  }

  // Wait from ajax response to update new filledBounds
  updateFilledBoundsWithBoundsReceived(
    expectedBound: L.LatLngBounds,
    options: number[] | string[],
    getFullRepresentation: boolean
  ) {
    let mainOptionId = options ? (options.length == 1 ? options[0] : null) : null;
    if (mainOptionId === null || !App.config.menu.showOnePanePerMainOption) mainOptionId = 'all';
    // console.log("updateFilledBoundsWithBoundsReceived", options, mainOptionId, expectedBound);
    if (getFullRepresentation) this.fullRepresentationFilledBound[mainOptionId] = expectedBound;
    else this.compactRepresentationFilledBound[mainOptionId] = expectedBound;

    if (this.maxBounds && expectedBound.contains(this.maxBounds)) {
      if (this.log) console.log('AllBoundsRetrived, fullRespresentation', getFullRepresentation);
      if (getFullRepresentation) this.fullRepresentationRetrievingComplete[mainOptionId] = true;
      else this.compactRepresentationRetrievingComplete[mainOptionId] = true;
    }
  }

  private currFilledBound($getFullRepresentation: boolean): L.LatLngBounds {
    if ($getFullRepresentation) return this.fullRepresentationFilledBound[App.currMainId];
    else return this.compactRepresentationFilledBound[App.currMainId];
  }

  private currRetrievingComplete($getFullRepresentation: boolean): boolean {
    if ($getFullRepresentation)
      return (
        this.fullRepresentationRetrievingComplete[App.currMainId] || this.fullRepresentationRetrievingComplete['all']
      );
    else
      return (
        this.compactRepresentationRetrievingComplete[App.currMainId] ||
        this.compactRepresentationRetrievingComplete['all']
      );
  }

  calculateFreeBounds($getFullRepresentation = false) {
    const freeBounds = [];
    let expectedBounds;

    // if we already complete the retrieving (i.e. all element are already received)
    if (this.currRetrievingComplete($getFullRepresentation))
      return {
        status: 'allRetrieved',
        freeBounds: null,
        expectedFillBounds: null,
      };

    const currFilledBound = this.currFilledBound($getFullRepresentation);

    //console.log("calculateFreebounds extendedBounds = ", this.extendedBounds);

    //if (currFilledBound) L.rectangle(currFilledBound, {color: "red", weight: 3}).addTo(App.map());
    //if (this.extendedBounds) L.rectangle(this.extendedBounds, {color: "blue", weight: 3}).addTo(App.map());

    let freeBound1, freeBound2, freeBound3, freeBound4;

    if (!currFilledBound || !currFilledBound.intersects(this.extendedBounds)) {
      // first initialization or no intersection
      freeBounds.push(this.extendedBounds);
      expectedBounds = this.extendedBounds;
    } else {
      if (!currFilledBound.contains(this.extendedBounds)) {
        if (this.extendedBounds.contains(currFilledBound)) {
          // extended contains filledbounds
          freeBound1 = L.latLngBounds(this.extendedBounds.getNorthWest(), currFilledBound.getNorthEast());
          freeBound2 = L.latLngBounds(freeBound1.getNorthEast(), this.extendedBounds.getSouthEast());
          freeBound3 = L.latLngBounds(currFilledBound.getSouthEast(), this.extendedBounds.getSouthWest());
          freeBound4 = L.latLngBounds(freeBound1.getSouthWest(), currFilledBound.getSouthWest());

          expectedBounds = this.extendedBounds;
          freeBounds.push(freeBound1, freeBound2, freeBound3, freeBound4);
        } else {
          // extended cross over filled
          if (
            this.extendedBounds.getWest() > currFilledBound.getWest() &&
            this.extendedBounds.getEast() < currFilledBound.getEast()
          ) {
            if (this.extendedBounds.getSouth() < currFilledBound.getSouth()) {
              // extended centered south from filledBounds
              freeBound1 = L.latLngBounds(this.extendedBounds.getSouthWest(), currFilledBound.getSouthEast());
            } else {
              // extended centered south from filledBounds
              freeBound1 = L.latLngBounds(this.extendedBounds.getNorthWest(), currFilledBound.getNorthEast());
            }
          } else if (this.extendedBounds.getWest() < currFilledBound.getWest()) {
            if (
              this.extendedBounds.getSouth() > currFilledBound.getSouth() &&
              this.extendedBounds.getNorth() < currFilledBound.getNorth()
            ) {
              // extended centered east from filledBounds
              freeBound1 = L.latLngBounds(this.extendedBounds.getNorthWest(), currFilledBound.getSouthWest());
            } else if (this.extendedBounds.getSouth() < currFilledBound.getSouth()) {
              // extendedbounds southWest from filledBounds
              freeBound1 = L.latLngBounds(currFilledBound.getSouthEast(), this.extendedBounds.getSouthWest());
              freeBound2 = L.latLngBounds(currFilledBound.getNorthWest(), freeBound1.getNorthWest());
            } else {
              // extendedbounds northWest from filledBounds
              freeBound1 = L.latLngBounds(currFilledBound.getNorthEast(), this.extendedBounds.getNorthWest());
              freeBound2 = L.latLngBounds(currFilledBound.getSouthWest(), freeBound1.getSouthWest());
            }
          } else {
            if (
              this.extendedBounds.getSouth() > currFilledBound.getSouth() &&
              this.extendedBounds.getNorth() < currFilledBound.getNorth()
            ) {
              // extended centered west from filledBounds
              freeBound1 = L.latLngBounds(currFilledBound.getNorthEast(), this.extendedBounds.getSouthEast());
            } else if (this.extendedBounds.getSouth() < currFilledBound.getSouth()) {
              // extendedbounds southeast from filledBounds
              freeBound1 = L.latLngBounds(currFilledBound.getSouthWest(), this.extendedBounds.getSouthEast());
              freeBound2 = L.latLngBounds(currFilledBound.getNorthEast(), freeBound1.getNorthEast());
            } else {
              // extendedbounds northEast from filledBounds
              freeBound1 = L.latLngBounds(currFilledBound.getNorthWest(), this.extendedBounds.getNorthEast());
              freeBound2 = L.latLngBounds(currFilledBound.getSouthEast(), freeBound1.getSouthEast());
            }
          }

          freeBounds.push(freeBound1);
          if (freeBound2) freeBounds.push(freeBound2);

          expectedBounds = L.latLngBounds(
            L.latLng(
              Math.max(currFilledBound.getNorth(), this.extendedBounds.getNorth()),
              Math.max(currFilledBound.getEast(), this.extendedBounds.getEast())
            ),
            L.latLng(
              Math.min(currFilledBound.getSouth(), this.extendedBounds.getSouth()),
              Math.min(currFilledBound.getWest(), this.extendedBounds.getWest())
            )
          );
        }
      } else {
        // extended bounds included in filledbounds
        return {
          status: 'included',
          freeBounds: null,
          expectedFillBounds: currFilledBound,
        };
      }
    }

    return {
      freeBounds: freeBounds,
      expectedFillBounds: expectedBounds,
      status: 'success',
    };
  }
}
