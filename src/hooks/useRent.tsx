import { useAsync } from "react-async-hook";
import { useSolanaConnection } from "./xnft-hooks";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const useRent = (size: number) => {
  const connection = useSolanaConnection();
  const fn = async () => {
    if (!connection) return 0;
    const min = await connection.getMinimumBalanceForRentExemption(size);
    return min / LAMPORTS_PER_SOL;
  };

  return useAsync(fn, [size, !!connection]);
};
