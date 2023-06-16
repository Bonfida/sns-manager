import { ens_normalize } from "@adraffy/ens-normalize";

export const trimTld = (x: string) => {
  if (x.endsWith(".sol")) return x.slice(0, -4);
  return x;
};

export const validate = (x: string): boolean => {
  x = trimTld(x);
  if (x !== x.toLowerCase()) {
    return false;
  }
  try {
    ens_normalize(x);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
