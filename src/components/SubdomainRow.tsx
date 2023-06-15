import { Text, View, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { useNavigation } from "@react-navigation/native";
import { searchResultScreenProp } from "../../types";
import { FavoriteButton } from "../components/FavoriteButton";
import { Feather, FontAwesome } from "@expo/vector-icons";

export const SubdomainRow = ({
  subdomain,
  callback,
}: {
  subdomain: string;
  callback?: () => void;
}) => {
  const navigation = useNavigation<searchResultScreenProp>();
  return (
    <View
      style={tw`w-full px-4 h-[50px] bg-white border-[2px] border-black/10 rounded-lg flex items-center justify-between flex-row my-1`}
    >
      <Text style={tw`font-bold`}>{subdomain}.sol</Text>
      <View style={tw`flex flex-row items-center gap-4`}>
        <TouchableOpacity
          onPress={() => {
            callback && callback();
            navigation.navigate("Search", {
              screen: "Domain View",
              params: { domain: subdomain },
            });
          }}
        >
          <Feather
            style={tw`ml-2`}
            name="chevron-right"
            size={22}
            color="rgb(143, 146, 158)"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
