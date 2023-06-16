import { getDomainKeySync } from "@bonfida/spl-name-service";
import { useSolanaConnection } from "./xnft-hooks";
import { Connection } from "@solana/web3.js";
import { useAsync } from "react-async-hook";

export interface Result {
  domain: string;
  available: boolean;
}

function uniq<T>(array: T[]) {
  return [...new Set(array)];
}

const chars = ["-", "_"];

const getRandomChar = () => {
  const i = Math.floor(2 * Math.random());
  return chars[i];
};

const generateRandom = (domain: string, min = 4) => {
  const results: string[] = [];
  for (let i = 0; i < min; i++) {
    results.push(domain + getRandomChar() + Math.floor(100 * Math.random()));
  }
  return uniq(results);
};

export const useSearch = (domain: string) => {
  const connection = useSolanaConnection();
  const fn = async (): Promise<Result[]> => {
    if (!domain) return [];

    const splitted = domain.split(".");
    const isSub = splitted.length === 2;

    const getDomainsResult = async (domains: string[]): Promise<Result[]> => {
      const keys = domains.map((e) => getDomainKeySync(e).pubkey);
      const infos = await connection?.getMultipleAccountsInfo(keys);
      if (!infos) {
        return [];
      }

      return domains.map((e, idx) => ({
        domain: e,
        available: !infos[idx]?.data,
      }));
    };

    if (isSub) {
      const parsedDomain = splitted[1];
      const subdomainKey = getDomainKeySync(domain).pubkey;
      const subdomainInfo = await connection?.getAccountInfo(subdomainKey);

      const domainsAlternatives = generateRandom(parsedDomain, 10);
      const domainsAlternativesResult = await getDomainsResult(
        domainsAlternatives
      );
      // if the subdomain doesn't exists check if the domain is available
      if (!subdomainInfo?.data) {
        const domainKey = getDomainKeySync(parsedDomain).pubkey;
        const domainInfo = await connection?.getAccountInfo(domainKey);

        return [
          { domain: parsedDomain, available: !domainInfo?.data },
          ...domainsAlternativesResult,
        ];
      } else {
        return [
          { domain, available: !subdomainInfo.data },
          ...domainsAlternativesResult,
        ];
      }
    }

    const domains = [domain, ...generateRandom(domain, 10)];
    return getDomainsResult(domains);
  };

  return useAsync(fn, [!!connection, domain]);
};
