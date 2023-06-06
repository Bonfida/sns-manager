import { useAsync } from "react-async-hook";
import axios from "axios";

export interface Result {
  key: string;
  domain: string;
}

export interface Response {
  s: "ok" | "error";
  result: Result[];
}

const get = async (key: string | undefined | null) => {
  if (!key) return;
  const { data }: { data: Response } = await axios.get(
    `https://sns-sdk-proxy.bonfida.workers.dev/domains/${key}`
  );
  if (data.s !== "ok") return;
  data.result.sort((a, b) => a.domain.localeCompare(b.domain));
  return data.result;
};

export const useDomains = (owner: string | null | undefined) => {
  return useAsync(get, [owner]);
};
