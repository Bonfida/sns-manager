import axios from "axios";
import { Buffer } from "buffer";

export interface Response {
  hash: string;
}

export const uploadToIPFS = async (image: string) => {
  if (!image) return;
  const blob = await (await fetch(image)).arrayBuffer();

  const { data }: { data: Response } = await axios.post(
    "https://ipfs-proxy.bonfida.com/v2/ipfs/add",
    Buffer.from(blob),
    { headers: { "Content-Type": "application/octet-stream" } }
  );

  return {
    hash: data.hash,
    url: `https://cloudflare-ipfs.com/ipfs/${data.hash}`,
  };
};
