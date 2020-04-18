export function parseArrayNumberIntoString(array: number[]): string {
  let result = '';
  let i = 0;

  for (const number of array) {
    if (number) {
      if (i % 2 == 0) result += parseNumberToString(number);
      else result += number.toString();
      i++;
    }
  }

  return result;
}

function parseNumberToString(number: number): string {
  const base26 = number.toString(26);
  let i = 0;
  const length = base26.length;

  let result = '';

  for (i = 0; i < length; i++) {
    result += String.fromCharCode(97 + parseInt(base26[i], 26));
  }

  return result;
}

function parseStringToNumber(string: string): number {
  let i = 0;
  const length = string.length;

  let result = 0;

  for (i = length - 1; i >= 0; i--) {
    result += (string.charCodeAt(i) - 97) * Math.pow(26, length - i - 1);
  }

  return result;
}

export function parseStringIntoArrayNumber(string: string): number[] {
  const result: number[] = [];

  if (!string) return result;

  const array = string.match(/[a-z]+|[0-9]+/g);

  for (const element of array) {
    if (parseInt(element)) result.push(parseInt(element));
    else result.push(parseStringToNumber(element));
  }

  return result;
}
