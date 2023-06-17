import { isTokenized } from "@bonfida/name-tokenizer";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { NameRegistryState, getDomainKeySync } from "@bonfida/spl-name-service";
import { useAsync } from "react-async-hook";

export const useDomainInfo = (domain: string) => {
  const connection = useSolanaConnection();
  const fn = async () => {
    if (!connection) return;
    const { pubkey } = getDomainKeySync(domain);
    const { registry, nftOwner } = await NameRegistryState.retrieve(
      connection,
      pubkey
    );

    const _isTokenized = await isTokenized(connection, pubkey);

    return {
      owner: nftOwner?.toBase58() || registry.owner.toBase58(),
      isTokenized: _isTokenized,
    };
  };
  return useAsync(fn, [!!connection, domain]);
};
