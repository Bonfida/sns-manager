import { View, Text, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { Feather } from "@expo/vector-icons";
import { useRecoilState } from "recoil";
import { cartState } from "../atoms/cart";
import { priceFromLength } from "../utils/price/price-from-length";

export const AvailableRow = ({ domain }: { domain: string }) => {
  const [cart, setCart] = useRecoilState(cartState);
  const inCart = cart.includes(domain);
  const price = priceFromLength(domain);

  const handle = () => {
    if (cart.includes(domain)) {
      setCart((prev) => prev.filter((e) => e !== domain));
    } else {
      setCart((prev) => [...prev, domain]);
    }
  };
  return (
    <View style={tw`border-[1px] border-black/10 rounded-lg my-1`}>
      <View style={tw`flex flex-row items-center justify-between px-4`}>
        <View style={tw`px-4 py-3`}>
          <Text style={tw`font-semibold`}>{domain}.sol</Text>
          <Text style={tw`text-blue-grey-600 mt-1`}>${price}</Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={handle}
            style={tw`bg-blue-900 rounded-md p-2`}
          >
            {inCart ? (
              <Feather name="trash-2" size={18} color="white" />
            ) : (
              <Feather name="shopping-cart" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={tw`w-full rounded-b-lg h-[20px] bg-cyan-700 flex flex-row justify-center items-center`}
      >
        <Text style={tw`font-bold text-white`}>Available</Text>
      </View>
    </View>
  );
};
