import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { usePublicKeys, useSolanaConnection } from "./xnft-hooks";
import { useAsync } from "react-async-hook";

export const useFavoriteDomain = (owner: string | undefined) => {
  const connection = useSolanaConnection();
  const publicKey = usePublicKeys().get("solana");
  owner = owner || publicKey;

  const fn = async () => {
    if (!connection || !owner) return;
    const fav = await getFavoriteDomain(connection, new PublicKey(owner));
    return fav;
  };

  return useAsync(fn, [owner, !!connection]);
};
