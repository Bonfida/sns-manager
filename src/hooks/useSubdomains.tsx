import {
  NAME_PROGRAM_ID,
  findSubdomains,
  getDomainKeySync,
  getNameAccountKeySync,
  ROOT_DOMAIN_ACCOUNT,
  getHashedNameSync,
  REVERSE_LOOKUP_CLASS,
  deserializeReverse,
} from "@bonfida/spl-name-service";
import { useSolanaConnection } from "./xnft-hooks";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@src/lib";

export interface SubdomainResult {
  key: string;
  subdomain: string;
}

export const useSubdomains = (domain: string) => {
  const connection = useSolanaConnection();

  const queryFn = async () => {
    if (!connection) return;
    const { pubkey: key } = getDomainKeySync(domain);

    const subdomains = await findSubdomains(connection, key);
    subdomains.sort((a, b) => a.localeCompare(b));

    return subdomains;
  };

  return useQuery({
    queryKey: [QueryKeys.subdomainsFromUser, domain],
    queryFn,
    staleTime: 1000 * 30,
  });
};

const deserializeReverseSub = (
  e: AccountInfo<Buffer> | null,
): string | undefined => {
  if (!e?.data) return undefined;
  const reverse = deserializeReverse(e.data.slice(96));
  return reverse?.replace("\0", "");
};

export const useSubdomainsFromUser = (owner: string) => {
  const connection = useSolanaConnection();

  const queryFn = async () => {
    if (!connection) return;
    const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
      filters: [{ memcmp: { offset: 32, bytes: owner } }],
    });

    // Very likely .sol subs but can be something else
    const maybeSubs = accounts.filter(
      (e) =>
        !e.account.data.slice(0, 32).equals(ROOT_DOMAIN_ACCOUNT.toBuffer()),
    );

    // Get the reverse accounts
    const subsRev = (
      await connection.getMultipleAccountsInfo(
        maybeSubs.map((e) => {
          const hashed = getHashedNameSync(e.pubkey.toBase58());
          const key = getNameAccountKeySync(
            hashed,
            REVERSE_LOOKUP_CLASS,
            new PublicKey(e.account.data.slice(0, 32)),
          );
          return key;
        }),
      )
    ).map(deserializeReverseSub);

    const parentsWithSubsRevKey = subsRev
      .map((e, idx) => {
        if (e !== undefined) {
          const parentKey = new PublicKey(
            maybeSubs[idx].account.data.slice(0, 32),
          );
          const hashed = getHashedNameSync(parentKey.toBase58());
          const key = getNameAccountKeySync(hashed, REVERSE_LOOKUP_CLASS);
          return key;
        }
        return undefined;
      })
      .filter((e) => !!e) as PublicKey[];

    const parentRev = (
      await connection.getMultipleAccountsInfo(parentsWithSubsRevKey)
    )
      .map(deserializeReverseSub)
      .filter((e) => !!e) as string[];

    const result = subsRev
      .map((e, idx) => {
        if (!e) return;
        const parentKey = new PublicKey(
          maybeSubs[idx].account.data.slice(0, 32),
        );
        const parent = parentRev.find((e) =>
          getDomainKeySync(e).pubkey.equals(parentKey),
        );
        if (!parent) return undefined;
        const subdomain = e + "." + parent;
        return {
          subdomain,
          key: getDomainKeySync(subdomain).pubkey.toBase58(),
        };
      })
      .filter((e) => !!e) as SubdomainResult[];
    return result;
  };

  return useQuery({
    queryKey: [QueryKeys.subdomainsFromUser, owner],
    queryFn,
    staleTime: 1000 * 30,
  });
};
