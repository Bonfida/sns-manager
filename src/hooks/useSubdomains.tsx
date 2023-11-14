import { useAsync } from "react-async-hook";
import {
  NAME_PROGRAM_ID,
  findSubdomains,
  getDomainKeySync,
  NameRegistryState,
  resolve,
  reverseLookup,
} from "@bonfida/spl-name-service";
import { useSolanaConnection } from "./xnft-hooks";
import { Connection, PublicKey } from "@solana/web3.js";

export interface SubdomainResult {
  key: string;
  subdomain: string;
}

async function findOwnedNameAccountsForUser(
  connection: Connection,
  userAccount: PublicKey,
): Promise<PublicKey[]> {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: userAccount.toBase58(),
      },
    },
  ];
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters,
  });
  return accounts.map((a) => a.pubkey);
}

export const useSubdomains = (domain: string) => {
  const connection = useSolanaConnection();

  const fn = async () => {
    if (!connection) return;
    const { pubkey: key } = getDomainKeySync(domain);

    const subdomains = await findSubdomains(connection, key);
    subdomains.sort((a, b) => a.localeCompare(b));

    return subdomains;
  };

  return useAsync(fn, [!!connection, domain]);
};

export const useSubdomainsFromUser = (owner: string) => {
  const connection = useSolanaConnection();

  const fn = async () => {
    if (!connection) return;

    const ownedAccounts = await findOwnedNameAccountsForUser(
      connection,
      new PublicKey(owner),
    );

    const nameRegistriesState = (
      await NameRegistryState.retrieveBatch(connection, ownedAccounts)
    ).filter(
      (registryState): registryState is NameRegistryState =>
        registryState !== undefined,
    );

    const uniqueRegistryStateParents = nameRegistriesState.filter(
      (nameRegistryState, idx) =>
        nameRegistriesState.findIndex((e) =>
          e.parentName.equals(nameRegistryState.parentName),
        ) === idx,
    );

    const userOwnedSubdomainsPromises = uniqueRegistryStateParents.map(
      async (registryState) => {
        const domain = await reverseLookup(
          connection,
          registryState.parentName,
        );
        const subdomains = await findSubdomains(
          connection,
          registryState.parentName,
        );

        const ownedSubdomains: SubdomainResult[] = [];
        for (let sub of subdomains) {
          const subdomain = sub + "." + domain;
          const subdomainOwner = await resolve(connection, subdomain);
          const key = getDomainKeySync(subdomain).pubkey;

          if (subdomainOwner.equals(new PublicKey(owner))) {
            ownedSubdomains.push({
              key: key.toBase58(),
              subdomain,
            });
          }
        }

        return ownedSubdomains;
      },
    );

    const userSubdomainsResult: SubdomainResult[] = [];
    const userOwnedSubdomains = await Promise.allSettled(
      userOwnedSubdomainsPromises,
    );
    userOwnedSubdomains.map((e) => {
      if (e.status === "fulfilled") {
        userSubdomainsResult.push(...e.value);
      }
    });

    userSubdomainsResult.sort((a, b) => a.subdomain.localeCompare(b.subdomain));

    return userSubdomainsResult;
  };

  return useAsync(fn, [!!connection, owner]);
};
