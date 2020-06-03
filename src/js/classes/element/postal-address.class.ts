import { capitalize } from '../../utils/string-helpers';

export class PostalAddress {
  streetAddress = '';
  addressLocality = '';
  postalCode = '';
  formatedAddress = '';
  addressCountry = '';

  constructor($addressJson) {
    if (typeof $addressJson == 'string') this.formatedAddress = $addressJson;
    else if ($addressJson) {
      this.streetAddress = capitalize($addressJson.streetAddress || '');
      this.addressLocality = capitalize($addressJson.addressLocality || '');
      this.postalCode = $addressJson.postalCode;
      this.formatedAddress = $addressJson.customFormatedAddress || '';
      this.addressCountry = $addressJson.addressCountry || '';
    }
  }

  getFormatedAddress() {
    if (this.formatedAddress) return this.formatedAddress;
    let result = '';
    if (this.streetAddress) result += this.streetAddress + ', ';
    if (this.postalCode) result += this.postalCode + ' ';
    if (this.addressLocality) result += this.addressLocality;
    return result;
  }
}
