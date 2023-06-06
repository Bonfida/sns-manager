import {
  Record,
  getFavoriteDomain,
  getRecord,
} from "@bonfida/spl-name-service";
import { useSolanaConnection } from "./xnft-hooks";
import { useAsync } from "react-async-hook";
import { useWallet } from "./useWallet";

export enum ProgressStep {
  Favorite = 0,
  Pic = 1,
  Backpack = 2,
  Twitter = 3,
  Telegram = 4,
  Discord = 5,
}

export interface Progress {
  step: ProgressStep;
  value: string | undefined;
}

const RECORDS = [
  Record.Pic,
  Record.Backpack,
  Record.Twitter,
  Record.Telegram,
  Record.Discord,
];

export const useUserProgress = () => {
  const { publicKey } = useWallet();
  const connection = useSolanaConnection();

  const fn = async () => {
    const res: Progress[] = [];
    if (!publicKey || !connection) return;

    let favDomain: string;
    try {
      const fav = await getFavoriteDomain(connection, publicKey);
      favDomain = fav.reverse;
      res.push({ step: ProgressStep.Favorite, value: favDomain });
    } catch (err) {
      console.error(err);
      return res;
    }

    const promises = RECORDS.map((e) => getRecord(connection, favDomain, e));
    const records = await Promise.allSettled(promises);

    records.map((e, idx) => {
      const step = (1 + idx) as ProgressStep;
      if (e.status === "fulfilled") {
        const des = e.value.data?.toString("utf-8");
        res.push({ step, value: des });
      } else {
        res.push({ step, value: undefined });
      }
    });

    return res;
  };

  return useAsync(fn, [publicKey, !!connection]);
};
