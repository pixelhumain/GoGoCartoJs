import { App } from '../../gogocarto';
import * as Cookies from '../../utils/cookies';

export class FavoriteModule {
  favoriteIds_ = [];

  constructor() {
    const cookies = Cookies.readCookie('FavoriteIds');
    this.favoriteIds_ = cookies !== null ? JSON.parse(cookies) : [];
  }

  checkCookies() {
    if (App.config.isFeatureActivated('favorite')) {
      for (let j = 0; j < this.favoriteIds_.length; j++) {
        this.addFavorite(this.favoriteIds_[j], false);
      }
    }
  }

  addFavorite(favoriteId: string, modifyCookies = true) {
    const element = App.elementById(favoriteId);
    if (element === null) return;

    element.isFavorite = true;

    if (modifyCookies) {
      this.favoriteIds_.push(favoriteId);
      Cookies.createCookie('FavoriteIds', JSON.stringify(this.favoriteIds_));
    }
  }

  removeFavorite(favoriteId: string, modifyCookies = true) {
    const element = App.elementById(favoriteId);
    if (element !== null) element.isFavorite = false;

    if (modifyCookies) {
      const index = this.favoriteIds_.indexOf(favoriteId);
      if (index > -1) this.favoriteIds_.splice(index, 1);

      Cookies.createCookie('FavoriteIds', JSON.stringify(this.favoriteIds_));
    }
  }
}
