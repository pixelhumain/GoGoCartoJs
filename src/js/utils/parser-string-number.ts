export function parseArrayNumberIntoString(array : number[]) : string
{
  let result  = '';
  let i = 0;

  for(let number of array)
  {
    if (number)
    {
        if (i % 2 == 0) result += parseNumberToString(number);
        else result += number.toString();
        i++;
    }
  }

  return result;
}

function parseNumberToString(number : number) : string
{  
  let base26 = number.toString(26);
  let i = 0; 
  let length = base26.length;

  let result = '';

  for (i = 0; i < length; i++) 
  {
    result += String.fromCharCode(96 + parseInt(base26[i],26));
  }

  return result;
}

function parseStringToNumber(string : string) : number
{  
  let i = 0; 
  let length = string.length;

  let result = 0;

  for (i = length - 1; i >= 0; i--) 
  {
    result += (string.charCodeAt(i) - 96) * Math.pow(26, length - i - 1);
  }

  return result;
}

export function parseStringIntoArrayNumber(string : string) : number[]
{
  let result : number[] = [];

  if (!string) return result;

  let array = string.match(/[a-z]+|[0-9]+/g);

  for(let element of array)
  {
    if (parseInt(element)) result.push(parseInt(element));
    else result.push(parseStringToNumber(element));
  }

  return result;
}