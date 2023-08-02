import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRecoilState } from "recoil";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useNavigation } from "@react-navigation/native";
import { domainViewScreenProp } from "@src/types";
import { abbreviate } from "@src/utils/abbreviate";
import tw from "@src/utils/tailwind";
import { tokenIconBySymbol } from "@src/utils/tokens/popular-tokens";
import { priceFromLength } from "@src/utils/price/price-from-length";
import { cartState } from "@src/atoms/cart";

export const DomainSearchResultRow = ({
  domain,
  available = false,
  price,
}: {
  domain: string;
  available?: boolean;
  price?: number | string;
}) => {
  const [cart, setCart] = useRecoilState(cartState);
  const inCart = cart.includes(domain);
  price = price ?? priceFromLength(domain);
  const navigation = useNavigation<domainViewScreenProp>();

  const handle = () => {
    if (cart.includes(domain)) {
      setCart((prev) => prev.filter((e) => e !== domain));
    } else {
      setCart((prev) => [...prev, domain]);
    }
  };

  return (
    <View
      style={tw`flex flex-row items-center gap-4 px-4 py-3 my-2 border-0 rounded-xl bg-background-secondary`}
    >
      <View style={tw`flex-auto mr-auto`}>
        <Text numberOfLines={1} style={tw`text-base text-content-secondary`}>
          {abbreviate(`${domain}.sol`, 25, 3)}
        </Text>
      </View>
      {!available && (
        <View
          style={tw`rounded-[100px] border border-content-success px-3 bg-content-success bg-opacity-10`}
        >
          <Text
            style={tw`text-xs font-semibold leading-6 text-content-success`}
          >
            <Trans>Purchased</Trans>
          </Text>
        </View>
      )}
      <View
        style={[
          tw`flex items-center flex-row justify-between min-w-[93px]`,
          available ? tw`gap-2` : tw`gap-1`,
        ]}
      >
        <View style={tw`flex flex-row items-center gap-1`}>
          <Image
            style={tw`h-[16px] w-[16px]`}
            source={{ uri: tokenIconBySymbol("USDC") }}
            resizeMode="contain"
          />
          <Text style={tw`text-sm font-medium text-content-primary`}>
            {/* TODO: locale formatting */}
            {price}
          </Text>
        </View>
        <TouchableOpacity
          onPress={
            available
              ? handle
              : () => navigation.navigate("domain-view", { domain })
          }
          style={[
            tw`p-2 h-[32px] w-[32px] flex items-center justify-center`,
            available && tw`border rounded-md border-brand-primary`,
            available && !inCart && tw`bg-brand-primary`,
          ]}
        >
          {available ? (
            inCart ? (
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={tw.color("brand-primary")}
              />
            ) : (
              <Feather name="shopping-cart" size={18} color="white" />
            )
          ) : (
            <Feather name="arrow-right" size={20} color="#ADAEB2" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
