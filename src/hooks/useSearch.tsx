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
    // Generate alternative
    const domains = [domain, ...generateRandom(domain, 10)];
    const keys = domains.map((e) => getDomainKeySync(e).pubkey);
    const infos = await connection?.getMultipleAccountsInfo(keys);
    if (!infos) {
      return [];
    }
    return domains?.map((e, idx) => {
      return {
        domain: e,
        available: !infos[idx]?.data,
      };
    });
  };

  return useAsync(fn, [!!connection, domain]);
};
