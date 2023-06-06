import { atom } from "recoil";

export const referrerState = atom<undefined | number>({
  key: "referrer",
  default: undefined,
});
