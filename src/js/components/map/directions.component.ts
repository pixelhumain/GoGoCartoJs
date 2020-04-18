declare let google;
import { AppModule, AppStates } from '../../app.module';
import { Element } from '../../classes/classes';
import { App } from '../../gogocarto';
declare let $, L: any;

declare let window: any;

export class DirectionsComponent {
  routingControl: any;
  isActive = false;

  constructor() {}

  initialize() {
    $('#btn-close-directions').click(() => {
      App.setState(AppStates.ShowElement, {
        id: App.infoBarComponent.getCurrElementId(),
      });
    });
  }

  clear() {
    if (!this.routingControl) return;

    this.clearRoute();
    this.hideItineraryPanel();

    App.DEAModule.end();

    this.routingControl = null;
    this.isActive = false;
  }

  private clearRoute() {
    if (this.routingControl) {
      this.routingControl.spliceWaypoints(0, 2);
      App.map().removeControl(this.routingControl);
    }
  }

  calculateRoute(origin: L.LatLng, element: Element) {
    this.clear();
    $('#directory-menu-spinner-loader').show();

    const waypoints = [origin, element.position];
    //console.log("calculate route", waypoints);
    L.Language = App.config.language;
    this.routingControl = L.Routing.control({
      router: L.Routing.mapbox(
        'pk.eyJ1IjoiZ29nb2NhcnRvIiwiYSI6ImNqYnhxeHUxZzJ3cG4zMnIyNmZiajF6dmwifQ.2G5IM4roIgpU_fvPBOpssw'
      ),
      plan: L.Routing.plan(waypoints, {
        // deleteing start and end markers
        createMarker: function (i, wp) {
          return null;
        },
        routeWhileDragging: false,
        showAlternatives: false,
      }),
      routeWhileDragging: false,
      showAlternatives: false,
      altLineOptions: {
        styles: [
          { color: 'black', opacity: 0.15, weight: 9 },
          { color: 'white', opacity: 0.8, weight: 6 },
          { color: '#00b3fd', opacity: 0.5, weight: 2 },
        ],
      },
    }).addTo(App.map());

    // show Itinerary panel without itinerary, just to show user
    // somethingis happenning an display spinner loader
    this.showItineraryPanel(element);

    this.routingControl.on('routesfound', (ev) => {
      this.showItineraryPanel(element);
    });

    // fit bounds
    this.routingControl.on('routeselected', function (e) {
      const r = e.route;
      const line = L.Routing.line(r);
      const bounds = line.getBounds();
      App.map().fitBounds(bounds);
    });

    this.routingControl.on('routingerror', (ev) => {
      $('#modal-directions-fail').openModal();
      this.clear();
    });

    this.isActive = true;
  }

  hideItineraryPanel() {
    $('#directory-menu-main-container').removeClass();
  }

  showItineraryPanel(element: Element) {
    $('#directory-menu-main-container').removeClass().addClass('directions');
    $('.leaflet-routing-container').prependTo('.directory-menu-content');
    $('#directory-menu-spinner-loader').hide();
    setTimeout(() => {
      $('.leaflet-routing-container').find('h2 .distance').addClass('gogo-color-soft');
    }, 200);
  }
}
