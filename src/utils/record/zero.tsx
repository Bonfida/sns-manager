import { Buffer } from "buffer";

export const removeZeroRight = (buf: Buffer) => {
  let c = 0;
  for (let i of buf) {
    if (i === 0) break;
    c += 1;
  }
  return buf.slice(0, c);
};
