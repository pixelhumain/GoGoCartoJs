import { nfd } from 'unorm';

export function slugify(text): string {
  if (!text) return '';
  const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
  const to = 'aaaaaeeeeeiiiiooooouuuunc------';
  for (let i = 0, len = from.length; i < len; i++) {
    text = text.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  return (
    text
      .toString() // Cast to string
      // .toLowerCase()                  // Convert the string to lowercase letters
      .trim() // Remove whitespace from both sides of a string
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/&/g, '-y-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')
  ); // Replace multiple - with single -
}

export function unslugify(text: string): string {
  if (!text) return '';
  return text.toString().replace(/\-+/g, ' ');
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.length > 1 ? text.substr(0, 1).toUpperCase() + text.substr(1, text.length) : text;
}

export function parseUriId($uriId: string): string {
  if (!$uriId) return '';
  const splited = $uriId.toString().split('/');
  return splited[splited.length - 1];
}

export function splitLongText(text: string, length: number, size = 50) {
  // if the text is just a bit longer than the length, we cut it more so the text2 is not so short
  if (text.length < length + size) {
    length = length - size;
  }
  const startOffset = length - size;
  let offset = text.slice(startOffset, length).split(/\.|!|\?/g)[0].length;
  if (offset == size) offset = text.slice(startOffset, length).split(' ')[0].length;
  offset += startOffset + 1;
  const text1 = text.slice(0, offset);
  const text2 = text.slice(offset);
  return { first: text1, second: text2 };
}

export function formatPhoneNumber(value) {
  if (!value) return '';
  if (value.length == 10) return value.replace(/(.{2})(?!$)/g, '$1 ');
  return value;
}

export function camelToProper(value) {
  if (value == null || value == '') {
    return value;
  }
  let newText = '';
  const characters = value.split('');
  for (let i = 0; i < characters.length; i++) {
    if (
      characters[i] == characters[i].toUpperCase() &&
      i != 0 &&
      characters[i + 1] &&
      !(characters[i + 1] == characters[i + 1].toUpperCase()) &&
      characters[i - 1] != ' '
    ) {
      newText += ' ';
    }
    newText += characters[i];
  }
  return newText;
}

export function snakeToProper(value) {
  const result = [];
  for (const txt of value.split('_')) {
    result.push(txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  return result.join(' ');
}

export function formatLabel(value) {
  return snakeToProper(camelToProper(value)).replace('  ', ' ');
}

export const removeDiactrics = (str: string) => nfd(str).replace(/[\u0300-\u036f]/g, '');

export function applyGlossary(value: string, glossary): string {
  for (const word in glossary) {
    const regExp = new RegExp(`(${word})`, 'i');
    value = value.replace(
      regExp,
      `<span class="glossary tooltipped" data-position="top" data-delay="0" data-tooltip="${glossary[word]}">\$1</span>`
    );
  }
  return value;
}
