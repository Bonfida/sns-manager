import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { useSolanaConnection } from "./xnft-hooks";
import { useAsync } from "react-async-hook";
import { useWallet } from "./useWallet";

export const useFavoriteDomain = (owner: string | undefined) => {
  const connection = useSolanaConnection();
  const { publicKey } = useWallet();
  owner = owner || publicKey?.toBase58();

  const fn = async () => {
    if (!connection || !owner) return;
    const fav = await getFavoriteDomain(connection, new PublicKey(owner));
    return fav;
  };

  return useAsync(fn, [owner, !!connection]);
};
