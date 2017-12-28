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

export function capitalize(text)
{
   return text ? text.substr(0,1).toUpperCase()+text.substr(1,text.length) : "";
}