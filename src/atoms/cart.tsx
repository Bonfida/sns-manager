import { atom } from "recoil";

export const cartState = atom({ key: "cart", default: [] as string[] });

export const storageState = atom({
  key: "storage",
  default: new Map() as Map<string, number>,
});
