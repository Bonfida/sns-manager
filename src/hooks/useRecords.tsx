import { useSolanaConnection } from "../hooks/xnft-hooks";
import {
  ETH_ROA_RECORDS,
  GUARDIANS,
  Record,
  SELF_SIGNED,
} from "@bonfida/spl-name-service";
import { useRecordsV2 } from "@bonfida/sns-react";
import { Validation } from "@bonfida/sns-records";
import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useDomainInfo } from "./useDomainInfo";

export type AddressRecord =
  | Record.BSC
  | Record.BTC
  | Record.DOGE
  | Record.ETH
  | Record.LTC
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
  Record.Injective,
];

interface Result {
  record: Record;
  roa: boolean;
  stale: boolean;
  deserialized: string | undefined;
}

type ExecuteFunction<T> = () => Promise<T>;

interface Data<T> {
  result: Result[];
  execute: ExecuteFunction<T>;
  loading: boolean;
}

export const useRecords = (domain: string | undefined, records: Record[]) => {
  const connection = useSolanaConnection();
  const res = useRecordsV2(connection!, domain || "", records, true);
  const domainInfo = useDomainInfo(domain!);

  const execute: ExecuteFunction<void> = useCallback(async () => {
    try {
      await domainInfo.refetch();
      await res.execute();
    } catch (error) {
      console.error(error);
    }
  }, [domainInfo, res]);

  const [data, setData] = useState<Data<void>>({
    result: [],
    execute,
    loading: true,
  });

  useEffect(() => {
    if (!res || !res.result || !domainInfo || !domainInfo.data) {
      return setData({
        execute,
        result: [],
        loading: res.loading || domainInfo.isLoading,
      });
    }

    const _data = [];
    for (let i = 0; i < records.length; i++) {
      let r = res.result[i];
      // By default assume it's stale and no RoA
      let stale = true;
      let roa = false;

      const header = r?.retrievedRecord.header;
      const stalenessId = r?.retrievedRecord.getStalenessId();
      const roaId = r?.retrievedRecord.getRoAId();
      const owner = new PublicKey(domainInfo.data.owner);

      // Check staleness
      if (
        stalenessId?.equals(owner.toBuffer()) &&
        header?.stalenessValidation === Validation.Solana
      ) {
        stale = false;
      }

      // Check RoA
      const validation = ETH_ROA_RECORDS.has(r?.record!)
        ? Validation.Ethereum
        : Validation.Solana;
      const selfSigned = SELF_SIGNED.has(r?.record!);
      const verifier = selfSigned
        ? r?.retrievedRecord.getContent()
        : GUARDIANS.get(r?.record!)?.toBuffer();

      if (
        verifier &&
        roaId?.equals(verifier) &&
        header?.rightOfAssociationValidation === validation
      ) {
        roa = true;
      }
      _data.push({
        deserialized: r?.deserializedContent,
        roa,
        stale,
        record: records[i],
      });
    }
    setData({
      result: _data,
      execute,
      loading: domainInfo.isLoading || res.loading,
    });
  }, [
    res.loading,
    JSON.stringify(res.result?.map((e) => e?.deserializedContent)),
    domainInfo.data?.owner,
    domainInfo.data?.isTokenized,
    domain,
    ...records,
    domainInfo.isLoading,
  ]);

  return data;
};

export const createUseRecords = (records: Record[]) => (domain: string) =>
  useRecords(domain, records);

export const useSocialRecords = createUseRecords(SOCIAL_RECORDS);
export const useAddressRecords = createUseRecords(ADDRESS_RECORDS);

export interface PicRecord {
  uri: string | undefined;
  loading: boolean;
  execute: ExecuteFunction<void>;
}

export const usePicRecord = (domain: string | undefined) => {
  const {
    result,
    execute: executeRecords,
    loading,
  } = useRecords(domain, [Record.Pic]);
  const execute: ExecuteFunction<void> = useCallback(async () => {
    try {
      await executeRecords();
    } catch (error) {
      console.error(error);
    }
  }, [loading, domain]);

  const [data, setData] = useState<PicRecord>({
    uri: undefined,
    loading: true,
    execute: execute,
  });

  useEffect(() => {
    if (result[0]?.deserialized && !result[0]?.stale) {
      setData({ uri: result[0].deserialized, loading: false, execute });
    }
    if (!loading) {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, [loading, domain]);

  return data;
};
