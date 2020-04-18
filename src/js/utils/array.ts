export function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  const aIncludeB = a.every((element) => b.indexOf(element) > -1);
  if (!aIncludeB) return false;

  const bIncludeA = b.every((element) => a.indexOf(element) > -1);
  return bIncludeA;
}
