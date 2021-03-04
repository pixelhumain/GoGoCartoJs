declare let $: any;
import { FilterAbstractComponent } from './filter-abstract.component';
import * as noUiSlider from 'nouislider';

export class FilterNumberComponent extends FilterAbstractComponent {
  
  slider : any;

  initialize() {
    const self = this;
    if (this.filter.subtype == "value") {
      this.dom.find('input.simple-value').change(function (e) {
        self.filter.currentValue.value = $(this).val();
        self.emitFilterSet();
      });
    }
    else if (this.filter.subtype == "slider") {   
      this.slider = this.dom.find('.filter-number-slider')[0];  
      if (!this.slider) return; 
      noUiSlider.create(this.slider, {
        start: [this.filter.options.min, this.filter.options.max],
        connect: true,
        format: {
          to: (value) => value.toFixed(0),
          from: (value) => value
        },
        step: this.filter.options.step || 1,
        tooltips: true,
        range: {
          min: this.filter.options.min,
          max: this.filter.options.max,
        },
      });
      // this.dom.find('.noUi-tooltip').addClass('gogo-section-content-opposite');
      this.slider.noUiSlider.on('change.one', (values) => {
        this.filter.currentValue.min = parseFloat(values[0]);
        this.filter.currentValue.max = parseFloat(values[1]);
        this.emitFilterSet();
      });
    }
  }

  handleClear() {
    this.dom.find('input').val('');
    if (this.slider) this.slider.noUiSlider.reset();
  }
}
