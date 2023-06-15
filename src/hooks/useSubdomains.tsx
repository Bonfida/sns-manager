import { useAsync } from "react-async-hook";
import { findSubdomains, getDomainKeySync } from "@bonfida/spl-name-service";
import { useSolanaConnection } from "./xnft-hooks";

export const useSubdomains = (domain: string) => {
  const connection = useSolanaConnection();

  const fn = async () => {
    if (!connection) return;
    const { pubkey: key } = getDomainKeySync(domain);

    console.log(key.toBase58());

    if (!key) return;
    const subs = await findSubdomains(connection, key);
    console.log("subs", subs);
    return subs;
  };

  return useAsync(fn, [!!connection, domain]);
};
