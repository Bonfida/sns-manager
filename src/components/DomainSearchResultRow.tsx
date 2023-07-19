import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRecoilState } from "recoil";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useNavigation } from "@react-navigation/native";

import { domainViewScreenProp } from "@src/types";

import tw from "@src/utils/tailwind";
import { tokenIconBySymbol } from "@src/utils/tokens/popular-tokens";
import { priceFromLength } from "@src/utils/price/price-from-length";
import { cartState } from "@src/atoms/cart";

export const DomainSearchResultRow = (
  { domain, available = false }:
  { domain: string; available?: boolean; }
) => {
  const [cart, setCart] = useRecoilState(cartState);
  const inCart = cart.includes(domain);
  const price = priceFromLength(domain);
  const navigation = useNavigation<domainViewScreenProp>();

  const handle = () => {
    if (cart.includes(domain)) {
      setCart((prev) => prev.filter((e) => e !== domain));
    } else {
      setCart((prev) => [...prev, domain]);
    }
  };

  return (
    <View style={tw`border-0 rounded-xl my-2 bg-background-secondary flex items-center flex-row py-3 px-4 gap-4`}>
      <View style={tw`mr-auto`}>
        <Text style={tw`text-base text-content-secondary`}>
          {/* TODO: handle long name */}
          {domain}.sol
        </Text>
      </View>
      {!available && (
        <View style={tw`rounded-[100px] border border-[#0F7420] px-3 bg-[#0F7420] bg-opacity-10`}>
          <Text style={tw`font-semibold text-xs leading-6 text-[#0F7420]`}>
            <Trans>
              Purchased
            </Trans>
          </Text>
        </View>
      )}
      <View
        style={[
          tw`flex items-center flex-row justify-between min-w-[93px]`,
          available ? tw`gap-2` : tw`gap-1`
        ]}
      >
        <View style={tw`flex items-center flex-row gap-1`}>
          <Image
            style={tw`h-[16px] w-[16px]`}
            source={{ uri: tokenIconBySymbol('USDC') }}
            resizeMode="contain"
          />
          <Text style={tw`font-medium text-content-primary text-sm`}>
            {/* TODO: locale formatting */}
            {price}
          </Text>
        </View>
        <TouchableOpacity
          onPress={available ? handle : () => navigation.navigate("domain-view", { domain })}
          style={[
            tw`p-2 h-[32px] w-[32px] flex items-center justify-center`,
            available && tw`border border-brand-primary rounded-md`,
            available && !inCart && tw`bg-brand-primary`,
          ]}
        >
          {available ? (
            inCart ? (
              <MaterialCommunityIcons name="delete-outline" size={24} color={tw.color('brand-primary')} />
            ) : (
              <Feather name="shopping-cart" size={18} color="white" />
            )
          ) : (
            <Feather name="arrow-right" size={14} color="#ADAEB2" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
