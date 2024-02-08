import { getFavoriteDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { useSolanaConnection } from "./xnft-hooks";
import { useWallet } from "./useWallet";
import { QueryKeys } from "@src/lib";
import { useQuery } from "@tanstack/react-query";

export const useFavoriteDomain = (owner: string | undefined) => {
  const connection = useSolanaConnection();
  const { publicKey } = useWallet();
  owner = owner || publicKey?.toBase58();

  const queryFn = async () => {
    if (!connection || !owner) return;
    const fav = await getFavoriteDomain(connection, new PublicKey(owner));
    return fav;
  };

  return useQuery({
    queryKey: [QueryKeys.favoriteDomain, owner],
    queryFn,
    staleTime: 1000 * 30,
  });
};
