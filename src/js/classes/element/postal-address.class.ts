import { capitalize } from "../../utils/string-helpers";

export class PostalAddress
{
  streetAddress : string = '';
  addressLocality: string = '';
  postalCode: string = '';
  formatedAddress : string = '';

  constructor($addressJson)
  {
    if (typeof $addressJson == "string")
      this.formatedAddress = $addressJson
    else
    {
      this.streetAddress = capitalize($addressJson.streetAddress || '');
      this.addressLocality = capitalize($addressJson.addressLocality || '');
      this.postalCode = $addressJson.postalCode;
      this.formatedAddress = $addressJson.customFormatedAddress || '';
    }      
  }

  getFormatedAddress()
  {
    if (this.formatedAddress) return this.formatedAddress;
    let result = "";
    if (this.streetAddress) result += this.streetAddress + ', ';
    if (this.postalCode) result += this.postalCode + ' ';
    if (this.addressLocality) result += this.addressLocality;
    return result;
  }
}