import { parsePriceData } from "@pythnetwork/client";
import { PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { tokenList } from "../utils/tokens/popular-tokens";
import { useSolanaConnection } from "./xnft-hooks";
import { useAsync } from "react-async-hook";

export interface Pyth {
  price: number;
  decimals: number;
}

const FIDA_FEED = new PublicKey("ETp9eKXVv1dWwHSpsXRUuXHmw24PwRkttCGVgpZEY9zF");
const BTC_FEED = new PublicKey("GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU");
const SRM_FEED = new PublicKey("3NBReDRTLKMQEKiLD5tGcx4kXbTf88b7f2xLS9UuGjym");
const SOL_FEED = new PublicKey("H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG");
const ETH_FEED = new PublicKey("JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB");
const FTT_FEED = new PublicKey("8JPJJkmDScpcNmBRKGZuPuG2GYAveQgP3t5gFuMymwvF");
const RAY_FEED = new PublicKey("AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB");
const USDC_FEED = new PublicKey("Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD");
const USDT_FEED = new PublicKey("3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL");
const MSOL_FEED = new PublicKey("E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9");
const BONK_FEED = new PublicKey("8ihFLu5FimgTQ1Unh4dVyEHUGodJ5gJQCrQf4KUVB9bN");
const BAT_FEED = new PublicKey("AbMTYZ82Xfv9PtTQ5e1fJXemXjzqEEFHP3oDLRTae6yz");

const FEEDS = new Map<string, PublicKey>([
  ["EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp", FIDA_FEED],
  ["9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", BTC_FEED],
  ["SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", SRM_FEED],
  ["So11111111111111111111111111111111111111112", SOL_FEED],
  ["2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", ETH_FEED],
  ["AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3", FTT_FEED],
  ["4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", RAY_FEED],
  ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", USDC_FEED],
  ["Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", USDT_FEED],
  ["mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", MSOL_FEED],
  ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", BONK_FEED],
  ["EPeUFDgHRxs9xxEPVaL6kfGQvCon7jmAWKVUHuux1Tpz", BAT_FEED],
]);

const getPrice = async (connection: Connection, feed: PublicKey) => {
  const oracleData = (await connection.getAccountInfo(feed))?.data;
  if (!oracleData) {
    throw new Error("Unable to retrieve oracle data");
  }
  const parsed = parsePriceData(oracleData);
  return parsed.price || parsed.previousPrice;
};

export const usePyth = () => {
  const connection = useSolanaConnection();
  const fn = async () => {
    if (!connection) return;
    const results = new Map<string, Pyth>();
    for (let x of FEEDS.keys()) {
      const _ = {
        price: await getPrice(connection, FEEDS.get(x)!),
        decimals: tokenList.find((e) => e.mintAddress === x)?.decimals!,
      };
      results.set(x, _);
    }

    return results;
  };
  return useAsync(fn, [!!connection]);
};
