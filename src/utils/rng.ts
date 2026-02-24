export const randomInt = (min: number, max: number): number => {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

export const randomFromArray = <T>(values: T[]): T => values[randomInt(0, values.length - 1)];
