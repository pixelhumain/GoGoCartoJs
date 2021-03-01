import { Event } from '../../classes/event.class';
import { slugify, capitalize } from '../../utils/string-helpers';
import { AppModule, AppStates, AppModes, AppDataType } from '../../app.module';
import { Element, HistoryState, ViewPort } from '../../classes/classes';
import * as Cookies from '../../utils/cookies';

import { App } from '../../gogocarto';
declare let $;
declare let Routing;

$(document).ready(function () {
  // Gets history state from browser
  window.onpopstate = (event: PopStateEvent) => {
    //console.log("\n\nOnpopState ", event.state.filters);
    const historystate: HistoryState = event.state;
    if (!historystate) return;
    // transform jsonViewport into ViewPort object (if we don't do so,
    // the ViewPort methods will not be accessible)
    historystate.viewport = $.extend(new ViewPort(), event.state.viewport);
    App.historyStateManager.load(event.state, true);
  };
});

export class HistoryModule {
  constructor() {}

  updateCurrState(options?) {
    if (!history.state) this.pushNewState();
    else this.updateHistory(false, options);
  }

  pushNewState(options?) {
    if (history.state === null) this.updateHistory(false, options);
    else this.updateHistory(true, options);
  }

  private updateHistory($pushState: boolean, $options?: any) {
    if (!App.config.general.activateHistoryStateAndRouting) return;
    if (App.mode == undefined) return;

    $options = $options || {};
    const historyState = new HistoryState();
    historyState.mode = App.mode;
    historyState.state = App.state;
    historyState.dataType = App.dataType;
    historyState.address = App.geocoder.getLocationSlug();
    historyState.viewport = App.mapComponent.viewport;
    historyState.id = App.stateManager.stateElementId || $options.id;
    historyState.filters = App.filterRoutingModule.getFiltersToString();
    historyState.text = App.searchBarComponent.getCurrSearchText();

    // if ($pushState) console.log('NEW STATE', AppStates[historyState.state], historyState);
    // else console.log('UPDATE STATE', AppStates[historyState.state], historyState);

    const route = this.generateRoute(historyState);

    if (!route) return;

    if ($pushState) history.pushState(historyState, '', route);
    else history.replaceState(historyState, '', route);

    if (App.config.map.saveViewportInCookies) {
      Cookies.createCookie('viewport', historyState.viewport, 0.04); // remember this only for 1hour
      Cookies.createCookie('address', historyState.address, 0.04); // remember this only for 1hour
    }
  }

  private generateRoute(historyState: HistoryState) {
    let route;
    const mode = App.mode == AppModes.Map ? 'carte' : 'liste';
    const address = historyState.address;
    const viewport = historyState.viewport;
    let addressAndViewport = '';
    if (address) addressAndViewport += address;
    // in Map Mode we add viewport
    // in List mode we add viewport only when no address provided
    if (viewport && (App.mode == AppModes.Map || !address)) addressAndViewport += viewport.toString();

    if (App.dataType == AppDataType.SearchResults && App.state == AppStates.Normal) {
      route = App.routerModule.generate('search', {
        mode: mode,
        text: historyState.text,
      });
    } else if (App.mode == AppModes.List) {
      // in list mode we don't care about state
      route = App.routerModule.generate('normal', {
        mode: mode,
        addressAndViewport: addressAndViewport,
      });
    } else {
      switch (App.state) {
        case AppStates.Normal:
          route = App.routerModule.generate('normal', {
            mode: mode,
            addressAndViewport: addressAndViewport,
          });
          break;

        case AppStates.ShowElement:
        case AppStates.ShowElementAlone:
        case AppStates.ShowDirections:
          if (!historyState.id) return;
          const element = App.elementById(historyState.id);
          if (!element) return;

          if (App.state == AppStates.ShowDirections) {
            route = App.routerModule.generate('show_directions', {
              name: capitalize(slugify(element.name)),
              id: element.id,
              addressAndViewport: addressAndViewport,
            });
          } else {
            route = App.routerModule.generate('show_element', {
              name: capitalize(slugify(element.name)) || 'id',
              id: element.id,
              addressAndViewport: addressAndViewport,
            });
          }
          break;
      }
    }

    if (route && historyState.filters) route += '?cat=' + historyState.filters;

    return route;
  }
}
