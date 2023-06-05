import { Text, TouchableOpacity, View } from "react-native";
import { useRecoilState } from "recoil";
import { cartState } from "../atoms/cart";
import { useRent } from "../hooks/useRent";
import tw from "../utils/tailwind";
import { ReactNode } from "react";
import { format } from "../utils/price/format";
import { FIDA_MINT, tokenList } from "../utils/tokens/popular-tokens";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useModal } from "react-native-modalfy";
import { useStorageMap } from "../hooks/useStorageMap";

export const OrderSummary = ({
  mint,
  setMint,
  total,
  totalUsd,
}: {
  mint: string;
  setMint: (x: string) => void;
  total: number;
  totalUsd: number;
}) => {
  const { openModal } = useModal();
  const [cart] = useRecoilState(cartState);
  const [map] = useStorageMap();
  const totalStorage = cart
    .map((e) => map.get(e) || 1_000)
    .reduce((acc, x) => acc + x, 0);

  const rent = useRent(totalStorage);

  const token = tokenList.find((e) => e.mintAddress === mint);

  const isFida = mint === FIDA_MINT;

  return (
    <View>
      <Text style={tw`mb-3 text-xl font-bold`}>Order summary</Text>
      {/* Sub Total */}
      <Row
        value={`${format(total, true)} ${token?.tokenSymbol}`}
        label="Total"
      />
      {/* Total USD */}
      <Row value={`${format(totalUsd, true)} USD`} label="Total USD" />
      {/* Gas cost */}
      <Row
        value={`◎${rent.loading ? 0 : (rent.result || 0)?.toFixed(3)}`}
        label="Gas"
      />

      {/* Discount */}
      <Row
        value={isFida ? "5%" : "0%"}
        label={
          <>
            Discount
            <TouchableOpacity
              style={tw`ml-1`}
              onPress={() => openModal("DiscountExplainerModal")}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={12}
                color="black"
              />
            </TouchableOpacity>
          </>
        }
      />
    </View>
  );
};

const Row = ({ label, value }: { label: ReactNode; value: ReactNode }) => {
  return (
    <View
      style={tw`flex flex-row items-center justify-between pb-2 my-2 border-b-[1px] border-black/10`}
    >
      <Text style={tw`text-sm text-blue-grey-500`}>{label}</Text>
      <Text style={tw`text-sm font-semibold text-blue-grey-900`}>{value}</Text>
    </View>
  );
};
