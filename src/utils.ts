export function flatten<T>(array: Array<Array<T>>): Array<T> {
  return ([] as Array<T>).concat(...array);
}
