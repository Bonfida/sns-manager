import { useSolanaConnection } from "../hooks/xnft-hooks";
import { Record } from "@bonfida/spl-name-service";
import * as snsHooks from "@bonfida/sns-react";

export type AddressRecord =
  | Record.BSC
  | Record.BTC
  | Record.DOGE
  | Record.ETH
  | Record.LTC
  // | Record.SOL
  | Record.Injective;

export type SocialRecord =
  | Record.Backpack
  | Record.Discord
  | Record.Email
  | Record.Github
  | Record.Reddit
  | Record.Telegram
  | Record.Twitter
  | Record.Url;

export type CrossChainRecord = Record.BSC | Record.Injective;

export const EVM_RECORDS = [Record.BSC, Record.ETH];

export const SOCIAL_RECORDS: SocialRecord[] = [
  Record.Backpack,
  Record.Discord,
  Record.Email,
  Record.Github,
  Record.Reddit,
  Record.Telegram,
  Record.Twitter,
  Record.Url,
];

export const ADDRESS_RECORDS: AddressRecord[] = [
  Record.BSC,
  Record.BTC,
  Record.DOGE,
  Record.ETH,
  Record.LTC,
  // Record.SOL,
  Record.Injective,
];

export const useRecords = (domain: string | undefined, records: Record[]) => {
  const connection = useSolanaConnection();
  const res = snsHooks.useDeserializedRecords(
    connection!,
    domain || "",
    records
  );
  const { result, ...rest } = res;

  return {
    result: result?.map((e, idx) => {
      return { record: records[idx], value: e };
    }),
    ...rest,
  };
};

export const useSocialRecords = (domain: string) => {
  return useRecords(domain, SOCIAL_RECORDS);
};

export const useAddressRecords = (domain: string) => {
  return useRecords(domain, ADDRESS_RECORDS);
};

export const usePicRecord = (domain: string | undefined) => {
  const { result, loading, execute } = useRecords(domain, [Record.Pic]);
  const des = result ? result[0] : undefined;
  return { pic: des, loading, execute };
};
