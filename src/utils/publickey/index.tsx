import { PublicKey } from "@solana/web3.js";

export const isPubkey = (x: string) => {
  try {
    new PublicKey(x);
    return true;
  } catch (err) {
    return false;
  }
};
