import {
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { Tx } from "../../hooks/useWallet";

export const sendTx = async (
  connection: Connection,
  feePayer: PublicKey,
  ixs: TransactionInstruction[],
  signTransaction: (tx: Transaction) => Promise<Transaction>
) => {
  let tx = new Transaction().add(...ixs);
  tx.feePayer = feePayer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(sig, "processed");
  return sig;
};
