import { useSolanaConnection } from "../hooks/xnft-hooks";
import { NameRegistryState, getDomainKeySync } from "@bonfida/spl-name-service";
import { useAsync } from "react-async-hook";

export const useDomainInfo = (domain: string) => {
  const connection = useSolanaConnection();
  const fn = async () => {
    if (!connection) return;
    const { registry, nftOwner } = await NameRegistryState.retrieve(
      connection,
      getDomainKeySync(domain).pubkey
    );
    return { owner: nftOwner?.toBase58() || registry.owner.toBase58() };
  };
  return useAsync(fn, [!!connection, domain]);
};
