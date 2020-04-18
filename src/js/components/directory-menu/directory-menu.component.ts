declare let $, jQuery: any;

import { AppModule } from '../../app.module';
import { Category, Option } from '../../modules/taxonomy/taxonomy.module';
import { App } from '../../gogocarto';
import { Event } from '../../classes/classes';

export class DirectoryMenuComponent {
  openMenu = false;
  width: number;
  dom;

  isPanning = false;
  dragTarget;
  overlay;

  onShow = new Event<any>();
  onHide = new Event<any>();

  ANIM_50 = { duration: 50, queue: false, easing: 'easeOutElastic' };
  ANIM_200 = { duration: 200, queue: false, easing: 'easeOutElastic' };
  ANIM_300 = { duration: 300, queue: false, easing: 'easeOutElastic' };
  ANIM_400 = { duration: 300, queue: false, easing: 'easeOutElastic' };

  constructor() {}

  initialize() {
    this.dom = $('#directory-menu');
    this.dragTarget = $('.directory-menu-drag-target');
    this.overlay = $('#directory-menu-overlay');

    this.dragTarget.css({ left: 0 });

    this.dragTarget.click(() => {
      this.hide();
    });
    this.overlay.click(() => {
      this.hide();
    });

    $('.btn-close-menu.large-screen').tooltip();

    if (App.component.isMobileScreen()) {
      this.initTouchMenu();
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.dom.show();
    this.onShow.emit();

    this.dom.velocity({ left: 0 }, this.ANIM_200);
    this.overlay.show().velocity({ opacity: 1 }, this.ANIM_200);

    // Fixs strange bug those container were not taking full width, they need a redraw for the width to be calculating again
    setTimeout(() => {
      this.dom.find('#other-categories, .show-only-container ').css('width', '99%');
    }, 0);

    setTimeout(() => {
      App.filtersComponent.updateMainOptionBackground();

      const dragTargetWidth = App.component.width() - this.width + 20;
      this.dragTarget.css({
        width: dragTargetWidth + 'px',
        right: 0,
        left: '',
      });
      App.component.updateMapSize();
      App.component.updateComponentsSize();

      // same fix as above
      this.dom.find('#other-categories, .show-only-container ').css('width', '100%');
    }, 400);
  }

  hide() {
    this.onHide.emit();

    this.overlay.velocity({ opacity: 0 }, this.ANIM_300);
    this.dragTarget.css({ width: '20px', right: '', left: '0' });
    this.dom.velocity({ left: -1 * (this.width + 20) }, this.ANIM_300);

    setTimeout(() => {
      this.overlay.hide();
      this.dom.hide();

      $('.show-directory-menu-button').show();
      this.dom.find('.tooltipped').tooltip('remove');
      $('.btn-close-menu.large-screen').hideTooltip();

      App.component.updateMapSize();
      App.component.updateComponentsSize();
    }, 400);
  }

  initTouchMenu() {
    this.dragTarget
      .hammer({
        prevent_default: false,
      })
      .bind('pan', (e) => {
        if (e.gesture.pointerType == 'touch') {
          const direction = e.gesture.direction;
          let x = e.gesture.center.x;
          const y = e.gesture.center.y;
          const velocityX = e.gesture.velocityX;

          // Keep within boundaries
          if (x > this.width) {
            x = this.width;
          } else if (x < 0) {
            x = 0;
          }

          if (x < this.width / 2) {
            this.openMenu = false;
          } else {
            this.openMenu = true;
          }

          this.dom.css('left', x - this.width).show();

          // Percentage overlay
          let overlayPerc;
          overlayPerc = x / this.width;
          this.overlay.show().velocity({ opacity: overlayPerc }, this.ANIM_50);
        }
      })
      .bind('panend', (e) => {
        if (e.gesture.pointerType == 'touch') {
          const velocityX = e.gesture.velocityX;

          // If velocityX <= 0.3 then the user is flinging the menu closed so ignore this.openMenu
          if ((this.openMenu && velocityX <= 0.3) || velocityX < -0.5) {
            this.show();
          } else if (!this.openMenu || velocityX > 0.3) {
            this.hide();
          }
        }
      });
  }

  updateSize() {
    // update menu width
    let menuwidth,
      pageWidth = App.component.width();

    let menuSmallWidth = App.config.menu.width ? App.config.menu.width : 260;
    let menuBigWidth = App.config.menu.width ? App.config.menu.width : 290;
    if (App.config.menu.showOnePanePerMainOption) {
      menuSmallWidth += 50;
      menuBigWidth += 50;
    }

    if (pageWidth > 850) {
      menuwidth = pageWidth > 1450 ? menuBigWidth : menuSmallWidth;
    } else {
      menuwidth = Math.min(Math.min(Math.max(pageWidth - 60, menuSmallWidth), menuBigWidth), pageWidth - 50);
    }

    this.dom.css('width', menuwidth + 'px');
    this.width = menuwidth;

    if (menuwidth < 340 || App.config.menu.smallWidthStyle) this.dom.addClass('small-width');
    else this.dom.removeClass('small-width');
  }
}
