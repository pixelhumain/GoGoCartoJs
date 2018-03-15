export function slugify(text) : string
{
  if (!text) return '';
  return text.toString()//.toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function unslugify(text : string) : string
{
  if (!text) return '';
  return text.toString().replace(/\-+/g, ' ');
}

export function capitalize(text : string) : string
{
  if (!text) return "";
  return text.length > 1 ? text.substr(0,1).toUpperCase()+text.substr(1,text.length) : text;
}

export function parseUriId($uriId : string) : string
{
  if (!$uriId) return "";
  let splited = $uriId.toString().split('/');
  return splited[splited.length - 1];
}

export function splitLongText(text : string, length : number, size : number = 50) 
{
  // if the text is just a bit longer than the length, we cut it more so the text2 is not so short
  if (text.length < length + size) {
    length = length - size;
  }
  let startOffset = length - size;
  let offset = text.slice(startOffset, length).split(/\.|!|\?/g)[0].length;
  if (offset == size) offset = text.slice(startOffset, length).split(' ')[0].length;
  offset += startOffset + 1;
  let text1 = text.slice(0, offset);
  let text2 = text.slice(offset);
  return { first: text1, second: text2 };
}