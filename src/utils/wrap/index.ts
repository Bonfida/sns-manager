import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { NAME_TOKENIZER_ID, createNft } from "@bonfida/name-tokenizer";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import axios from "axios";
import { trimTld } from "../validate";

interface CreateNftResponse {
  signature: string;
  imageHash: string;
  metadataHash: string;
  blockhash: string;
}

export const wrap = async (domain: string, publicKey: PublicKey) => {
  const instructions: TransactionInstruction[] = [];
  const { pubkey } = getDomainKeySync(domain);

  const { data }: { data: CreateNftResponse } = await axios.post(
    "https://naming-api.bonfida.com/make-image",
    { domain: trimTld(domain) },
    { headers: { "Content-type": "application/json" } },
  );

  const ix = await createNft(
    domain,
    `https://cloudflare-ipfs.com/ipfs/${data.metadataHash}`,
    pubkey,
    publicKey,
    publicKey,
    NAME_TOKENIZER_ID,
  );

  instructions.push(...ix);

  return {
    instructions,
    metadataSignature: Buffer.from(data.signature, "base64"),
    blockhash: data.blockhash,
  };
};
