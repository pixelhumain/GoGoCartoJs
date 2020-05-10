declare let $: any;

import { AppModule, AppModes } from '../../app.module';
import { App } from '../../gogocarto';
import * as Cookies from '../../utils/cookies';

export class MapControlsComponent {
  listenerLayerChangeHasBeenCreated = false;

  initialize() {
    $('#export-iframe-btn').click(() => {
      $('#export-iframe-btn').hideTooltip();
      this.updateIframeCode();
      $('#modal-iframe').openModal();
    });

    $('#map-default-view-btn').click(() => {
      App.geocoder.geocodeAddress('', (result) => {
        App.mapComponent.fitBounds(App.geocoder.getBounds(), true);
      });
    });

    $('#geolocalize-btn').click(() => {
      App.searchBarComponent.geolocateUser();
    });

    $('.feature-button').tooltip();

    $('#directory-content-map #change-layers').click((e) => {
      $('#directory-content-map #change-layers').hideTooltip();
      this.showControlLayers();
      e.preventDefault();
      e.stopPropagation();
    });

    $('#directory-content-map #close-layers-panel').click((e) => {
      this.hideControlLayers();
      e.preventDefault();
      e.stopPropagation();
    });

    // update iframe code when params change
    $('#modal-iframe .iframe-param').change(() => {
      this.updateIframeCode();
    });

    $('.layers-button').tooltip();
  }

  private updateIframeCode() {
    let src = window.location.origin + window.location.pathname;
    src += window.location.search.length > 0 ? window.location.search + '&' : '?';
    src += 'iframe=1';
    if ($('#part-taxonomy-checkbox').is(':checked')) src += '&fullTaxonomy=0';
    if ($('#hide-header').is(':checked')) src += '&noheader=1';

    const stampsIds = [];
    $('#modal-iframe .iframe-param.stamp-param').each(function () {
      if ($(this).is(':checked')) {
        stampsIds.push($(this).data('id'));
      }
    });
    if (stampsIds.length > 0) src += '&stampsIds=' + stampsIds.join(',');

    src += window.location.hash;

    const width = $('#iframe-width').val() ? $('#iframe-width').val() : '800';
    const height = $('#iframe-height').val() ? $('#iframe-height').val() : '600';

    const iframeCode = `<iframe width="${width}" height="${height}" src="${src}" frameborder="0" marginheight="0" marginwidth="0"></iframe>`;
    $('#modal-iframe #iframe-code').val(iframeCode);
  }

  private createListenerForLayers() {
    if (this.listenerLayerChangeHasBeenCreated) return;

    if (App.config.map.saveTileLayerInCookies) {
      // listen for base layer selection, to store value in cookie
      $('#directory-content-map .leaflet-control-layers-selector').change(function (e) {
        Cookies.createCookie('defaultBaseLayer', $(this).siblings('span').text(), 100);
      });
    }

    this.listenerLayerChangeHasBeenCreated = true;
  }

  showControlLayers() {
    $('#directory-content-map .leaflet-control-layers').show();
    $('#directory-content-map #close-layers-panel').show();
    this.createListenerForLayers();
  }

  hideControlLayers() {
    $('#directory-content-map .leaflet-control-layers').hide();
    $('#directory-content-map #close-layers-panel').hide();
  }
}
