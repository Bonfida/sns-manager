import { useAsync } from "react-async-hook";
import axios from "axios";
import { generateRandom } from "../utils/suggestions";
import { getDomainsResult } from "./useSearch";
import { useSolanaConnection } from "./xnft-hooks";

const URL = "https://sns-api.bonfida.com/v2/suggestion";

export const useDomainSuggestions = (domain: string) => {
  const connection = useSolanaConnection();
  const fn = async () => {
    const { data }: { data: string[] } = await axios.get(`${URL}/${domain}`);
    const splitted = domain.split(".");
    const isSub = splitted.length === 2;
    if (isSub) return [];
    if (!data || data.length < 5) {
      if (!connection) return [];
      const alternatives = generateRandom(domain, 10);
      const result = getDomainsResult(connection, alternatives);
      return result;
    }
    // All domains returned by the API are available
    return data.map((e) => {
      return { domain: e, available: true };
    });
  };

  return useAsync(fn, [domain, !!connection]);
};
