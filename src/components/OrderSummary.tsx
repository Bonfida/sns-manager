import { Text, TouchableOpacity, View } from "react-native";
import { ReactNode } from "react";
import { useModal } from "react-native-modalfy";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import tw from "@src/utils/tailwind";
import { format } from "@src/utils/price/format";
import { FIDA_MINT, tokenList } from "@src/utils/tokens/popular-tokens";

export const OrderSummary = ({
  mint,
  total,
  totalUsd,
}: {
  mint: string;
  total: number;
  totalUsd: number;
}) => {
  const { openModal } = useModal();

  const token = tokenList.find((e) => e.mintAddress === mint);

  const isFida = mint === FIDA_MINT;
  const fullFidaPrice = total * 1.05;

  return (
    <View>
      <Text style={tw`mb-1 text-base font-medium`}>
        <Trans>Order summary</Trans>
      </Text>

      <Row
        value={
          <Text style={tw`flex flex-col items-end`}>
            <Text>
              {isFida && (
                <>
                  <Text style={tw`line-through`}>
                    {`${format(fullFidaPrice, true)} ${token?.tokenSymbol}`}
                  </Text>{" "}
                </>
              )}

              <Text style={[isFida && tw`text-content-success`]}>
                {`${format(total, true)} ${token?.tokenSymbol}`}
              </Text>
            </Text>

            <Text style={tw`text-xs font-medium text-content-tertiary`}>
              {format(totalUsd)}
            </Text>
          </Text>
        }
        label={t`Total`}
      />

      {/* Discount */}
      <Row
        value={isFida ? "5%" : "0%"}
        label={
          <>
            <Trans>Discount</Trans>
            <TouchableOpacity
              style={tw`ml-1`}
              onPress={() => openModal("DiscountExplainerModal")}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={12}
                color={tw.color("brand-primary")}
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
      style={tw`flex flex-row items-start justify-between my-2 border-b border-[#F1EEFF]`}
    >
      <Text style={tw`text-sm font-semibold text-content-secondary`}>
        {label}
      </Text>
      <Text style={tw`text-sm font-semibold text-content-secondary`}>
        {value}
      </Text>
    </View>
  );
};
