import { capitalize } from "../../utils/string-helpers";

export class PostalAddress
{
  streetAddress : string;
  addressLocality: string;
  postalCode: string;

  constructor($addressJson)
  {
    this.streetAddress = capitalize($addressJson.streetAddress || '');
    this.addressLocality = capitalize($addressJson.addressLocality || '');
    this.postalCode = $addressJson.postalCode;
  }

  getFormatedAddress()
  {
    let result = "";
    if (this.streetAddress) result += this.streetAddress + ', ';
    if (this.postalCode) result += this.postalCode + ' ';
    if (this.addressLocality) result += this.addressLocality;
    return result;
  }
}