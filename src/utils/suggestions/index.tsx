export function uniq<T>(array: T[]) {
  return [...new Set(array)];
}

const chars = ["-", "_"];

export const getRandomChar = () => {
  const i = Math.floor(2 * Math.random());
  return chars[i];
};

export const generateRandom = (domain: string, min = 4) => {
  const results: string[] = [];
  for (let i = 0; i < min; i++) {
    results.push(domain + getRandomChar() + Math.floor(100 * Math.random()));
  }
  return uniq(results);
};
