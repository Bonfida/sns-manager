import { isTokenized } from "@bonfida/name-tokenizer";
import { useQuery } from "@tanstack/react-query";
import { NameRegistryState, getDomainKeySync } from "@bonfida/spl-name-service";
import { QueryKeys } from "@src/lib";
import { useSolanaConnection } from "../hooks/xnft-hooks";

export const useDomainInfo = (domain: string) => {
  const connection = useSolanaConnection();

  const queryFn = async () => {
    if (!connection) return;
    const { pubkey } = getDomainKeySync(domain);
    const { registry, nftOwner } = await NameRegistryState.retrieve(
      connection,
      pubkey,
    );

    const _isTokenized = await isTokenized(connection, pubkey);

    return {
      owner: nftOwner?.toBase58() || registry.owner.toBase58(),
      isTokenized: _isTokenized,
    };
  };

  return useQuery({
    queryKey: [QueryKeys.domainInfo, domain],
    queryFn,
    staleTime: 1000 * 30,
  });
};
