declare let $: any;
import { App } from '../../gogocarto';
import { Element, Event } from '../../classes/classes';

export class ImagesComponent {
  private dom;
  private element: Element;

  indexCurrentImage = 0;
  domImages: any;
  onNewImageDisplayed = new Event<any>();

  constructor(dom: any, element: Element) {
    this.dom = $(dom);
    this.element = element;

    this.initialize();
  }

  get currentImage() {
    return this.domImages ? this.domImages.eq(this.indexCurrentImage) : null;
  }

  private initialize() {
    if (this.element.images.length > 0) this.initImages();
    if (this.element.images.length > 1) this.initNavigationButtons();
  }

  private initImages() {
    this.domImages = this.dom.find('.img-container img');
    // first update to display first image
    this.updateImage();

    // Display bigger image in a modal on click
    this.dom.find('.img-clickable-area').click(() => {
      // don't display modal in small screen
      if (App.component.width() < 800) return;

      // When the user clicks the image, opens a new modal with the image
      const modal = $('#modal-image');
      modal.find('.modal-footer').attr('option-id', this.element.colorOptionId);
      modal.find('img').attr('src', this.currentImage[0].src);
      modal.openModal();
    });
  }

  private initNavigationButtons() {
    const navBtns = this.dom.find('.img-navigation-btn.next, .img-navigation-btn.prev');
    navBtns.css('opacity', 0).show().animate({ opacity: 1 }, 300);

    // navigation throught images
    this.dom.find('.img-navigation-btn.next').click(() => {
      this.indexCurrentImage++;
      this.updateImage();
    });

    this.dom.find('.img-navigation-btn.prev').click(() => {
      this.indexCurrentImage--;
      this.updateImage();
    });
  }

  private updateImage() {
    // modulo index inside proper range
    this.indexCurrentImage = (this.indexCurrentImage + this.element.images.length) % this.element.images.length;
    // Hide all images
    this.domImages.css('display', 'none');
    // Display the image of the given index
    this.currentImage.css('display', 'block');

    // trigger event to warn other components that image as changed
    if (this.currentImage.height()) this.onImageDisplayed();
    else
      this.currentImage.load(() => {
        this.onImageDisplayed();
      });
  }

  private onImageDisplayed() {
    this.onNewImageDisplayed.emit(this.currentImage);
    this.verticalAlignCurrentImage();
  }

  verticalAlignCurrentImage() {
    if (!this.currentImage) return;

    const imgBannerHeight = this.dom.find('.img-overlay').height();
    // if component not yet loaded, timeout the update
    if (imgBannerHeight == 0) {
      setTimeout(() => this.verticalAlignCurrentImage(), 100);
      return;
    }
    this.currentImage.css('margin-top', 0);
    let marginTop = (imgBannerHeight - this.currentImage.height()) / 2;
    if (marginTop > 0) marginTop = 0;
    this.currentImage.animate({ marginTop: `${marginTop}px` }, 400);
  }
}
