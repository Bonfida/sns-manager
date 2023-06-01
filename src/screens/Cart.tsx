import { useRecoilState } from "recoil";
import { cartState } from "../atoms/cart";
import { Screen } from "../components/Screen";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import tw from "../utils/tailwind";
import { FIDA_MINT, tokenList } from "../utils/tokens/popular-tokens";
import { priceFromLength } from "../utils/price/price-from-length";
import { usePyth } from "../hooks/usePyth";
import { Feather } from "@expo/vector-icons";
import { registerDomainName } from "@bonfida/spl-name-service";
import { usePublicKeys, useSolanaConnection } from "../hooks/xnft-hooks";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { wrapSol } from "../utils/tokens/wrap-sol";
import { unwrapSol } from "../utils/tokens/unwrap-sol";
import { chunkIx } from "../utils/tx/chunk-tx";
import { useModal } from "react-native-modalfy";
import { OrderSummary } from "../components/OrderSummary";
import { Trans } from "@lingui/macro";

const checkEnoughFunds = async (
  connection: Connection,
  publicKey: PublicKey,
  mint: PublicKey,
  total: number
) => {
  const ata = getAssociatedTokenAddressSync(mint, publicKey);
  const balances = await connection.getTokenAccountBalance(ata);
  if (!balances.value.uiAmount) return false;
  return balances.value.uiAmount > total;
};

export const Cart = () => {
  const connection = useSolanaConnection();
  const publicKeys = usePublicKeys();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useRecoilState(cartState);
  const pyth = usePyth();
  const [mint, setMint] = useState(tokenList[0].mintAddress);
  const { openModal } = useModal();

  const discountMul = mint === FIDA_MINT ? 0.95 : 1;
  const totalUsd = cart.reduce(
    (acc, v) => acc + priceFromLength(v, discountMul),
    0
  );

  const price = pyth.result?.get(mint)?.price;

  const total = totalUsd / (price || 1);

  const handle = async () => {
    const publicKey = publicKeys.get("solana");
    if (!connection || !publicKey) return;
    if (
      !(await checkEnoughFunds(
        connection,
        new PublicKey(publicKey),
        new PublicKey(mint),
        total
      ))
    ) {
      return openModal("Error", { msg: `You do not have enough funds` });
    }
    try {
      setLoading(true);
      let ixs: TransactionInstruction[] = [];

      const buyer = new PublicKey(publicKey);
      const mintKey = new PublicKey(mint);
      const space = 1_000;
      const ata = getAssociatedTokenAddressSync(mintKey, buyer);

      for (let d of cart) {
        const [, ix] = await registerDomainName(
          connection,
          d,
          space,
          buyer,
          ata,
          mintKey
        );
        ixs.push(...ix);
      }

      // Wrap/Unwrap SOL
      if (NATIVE_MINT.equals(mintKey)) {
        const wrap = await wrapSol(
          connection,
          ata,
          buyer,
          Math.ceil(total * 1.01 * Math.pow(10, 9))
        );
        const unwrap = unwrapSol(ata, buyer);
        ixs = [...wrap, ...ixs, ...unwrap];
      }

      const chunked = chunkIx(ixs, buyer);
      const { blockhash } = await connection.getLatestBlockhash();
      let txs = chunked.map((e) => new Transaction().add(...e));
      txs.forEach((e) => {
        e.feePayer = buyer;
        e.recentBlockhash = blockhash;
      });

      txs = await window.xnft.solana.signAllTransactions(txs);
      for (let tx of txs) {
        const sig = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(sig);
        console.log(sig);
      }

      setCart([]);
      setLoading(false);
      openModal("SuccessCheckout");
    } catch (err) {
      console.error(err);
      setLoading(false);
      openModal("Error", { msg: "Something went wrong - try again" });
    }
  };

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
      <Screen>
        <View style={tw`flex flex-col justify-between`}>
          <Text style={tw`mt-4 mb-2 text-xl font-bold`}>
            <Trans>Domains</Trans> ({cart.length})
          </Text>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={tw`max-h-[200px]`}
          >
            <TouchableOpacity
              onPress={() => setCart([])}
              style={tw`flex flex-row justify-end mb-2`}
            >
              <Text style={tw`font-bold text-blue-grey-600`}>
                <Trans>Clear all</Trans>
              </Text>
            </TouchableOpacity>
            <FlatList
              style={tw`border-[1px] border-blue-600/10 rounded-lg px-2`}
              data={cart}
              renderItem={({ item, index }) => (
                <View
                  style={tw`h-[40px] flex flex-row justify-between items-center border-b-[${
                    index < cart.length - 1 ? 1 : 0
                  }px] border-black/10`}
                >
                  <Text style={tw`mr-1 font-bold`}>{item}.sol</Text>

                  <View style={tw`flex flex-row items-center`}>
                    <Text style={tw`mr-3 font-bold text-blue-grey-500`}>
                      ${priceFromLength(item, discountMul)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setCart((prev) => prev.filter((e) => e !== item))
                      }
                    >
                      <Feather name="trash-2" size={14} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </ScrollView>

          <Text style={tw`mt-4 mb-2 text-xl font-bold`}>
            <Trans>Pay with</Trans>
          </Text>
          <View style={tw`flex flex-row flex-wrap items-center`}>
            {tokenList.map((e) => {
              const selected = e.mintAddress === mint;
              return (
                <TouchableOpacity
                  onPress={() => setMint(e.mintAddress)}
                  style={[
                    tw`border-[2px] border-black/10 rounded-lg mt-3 px-5 py-2 ml-2`,
                    selected && { borderColor: "#0A558C", borderWidth: 2 },
                  ]}
                  key={e.mintAddress}
                >
                  <Image
                    style={tw`h-[25px] w-[25px]`}
                    source={{ uri: e.icon }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={tw`mt-4`}>
          <OrderSummary
            mint={mint}
            setMint={setMint}
            total={total}
            totalUsd={totalUsd}
          />
        </View>

        <View style={tw`w-full mt-4`}>
          <TouchableOpacity
            onPress={handle}
            disabled={loading || cart.length === 0}
            style={[
              tw`bg-blue-900 h-[50px] rounded-lg flex items-center justify-center flex-row`,
              cart.length === 0 && tw`bg-blue-grey-300`,
            ]}
          >
            <Text style={tw`text-lg font-bold text-white`}>
              <Trans>Confirm</Trans>
            </Text>
            {loading ? <ActivityIndicator style={tw`ml-3`} /> : null}
          </TouchableOpacity>
        </View>
      </Screen>
    </ScrollView>
  );
};
