import { Connection, PublicKey } from "@solana/web3.js";

export const checkAccountExists = async (
  connection: Connection,
  key: PublicKey
) => {
  const info = await connection.getAccountInfo(key);
  if (!!info?.data) return true;
  return false;
};
