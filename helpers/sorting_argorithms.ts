
export function mergeSort(arr: any[], key: string): any[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), key);
  const right = mergeSort(arr.slice(mid), key);

  return merge(left, right, key);
}

function merge(left: any[], right: any[], key: string): any[] {
  let result: any[] = [];
  let i = 0,
    j = 0;

  while (i < left.length && j < right.length) {
    if (left[i][key] < right[j][key]) result.push(left[i++]);
    else result.push(right[j++]);
  }

  return result.concat(left.slice(i), right.slice(j));
}

export function quickSort(arr: any[], key: string): any[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[0];
  const left = arr.slice(1).filter((item) => item[key] < pivot[key]);
  const right = arr.slice(1).filter((item) => item[key] >= pivot[key]);

  return [...quickSort(left, key), pivot, ...quickSort(right, key)];
}
