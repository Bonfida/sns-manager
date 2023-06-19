import axios from "axios";
 import { Buffer } from 'buffer'

const INFURA_IPFS_URL_ENDPOINT = "https://<DEDICATED_GATEWAY_SUBDOMAIN>.infura-ipfs.io/ipfs/"
const INFURA_IPFS_API_KEY = "<INFURA_API_KEY>"
const INFURA_IPFS_API_SECRET = "<INFURA_API_KEY_SECRET>"
const INFURA_IPFS_AUTH_TOKEN = `BASIC ${Buffer.from(`${INFURA_IPFS_API_KEY}:${INFURA_IPFS_API_SECRET}`).toString("base64")}`
const INFURA_IPFS_API_ENDPOINT = "https://ipfs.infura.io:5001"

export interface Response {
  Hash: string;
  Name: string;
  Size: string;
}

export const uploadToIPFS = async (image: string, filename: string = '') => {
  if (!image) return;
  const formData = new FormData();
  const blob = await fetch(image).then(res => res.blob())
  formData.append("file", blob, filename);

  const { data }: { data: Response } = await axios.post(
    `${INFURA_IPFS_API_ENDPOINT}/api/v0/add`,
    formData,
    {headers: {Authorization: INFURA_IPFS_AUTH_TOKEN}}
  );

  return {hash: data.Hash, url: `${INFURA_IPFS_URL_ENDPOINT}${data.Hash}`}
};

export const removePinFromIPFS = async (hash: string | undefined) => {
  if(!hash) return;
  try {
    await axios.post(
      `${INFURA_IPFS_API_ENDPOINT}/api/v0/pin/rm?arg=${hash}`,
      {},
      {headers: {Authorization: INFURA_IPFS_AUTH_TOKEN}}
    );
  } catch {
    console.log("Failed to remove pin from IPFS", hash)
  }
}