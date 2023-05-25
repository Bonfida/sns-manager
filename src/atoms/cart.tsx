import { atom } from "recoil";

export const cartState = atom({ key: "cart", default: [] as string[] });
