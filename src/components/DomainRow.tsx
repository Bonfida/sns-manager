import { Text, View, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { useNavigation } from "@react-navigation/native";
import { searchResultScreenProp } from "@src/types";
import { FavoriteButton } from "../components/FavoriteButton";
import { Feather } from "@expo/vector-icons";

export const DomainRow = ({
  domain,
  isFav,
  refresh,
  isOwner,
  callback,
}: {
  domain: string;
  isFav: boolean;
  refresh: () => Promise<void>;
  isOwner: boolean;
  callback?: () => void;
}) => {
  const navigation = useNavigation<searchResultScreenProp>();
  return (
    <View
      style={tw`w-full px-4 h-[50px] bg-white border-[2px] border-black/10 rounded-lg flex items-center justify-between flex-row my-1`}
    >
      <Text style={tw`font-bold`}>{domain}.sol</Text>
      <View style={tw`flex flex-row items-center`}>
        {isOwner && (
          <FavoriteButton domain={domain} isFav={isFav} refresh={refresh} />
        )}
        <TouchableOpacity
          onPress={() => {
            callback && callback();
            navigation.navigate("Search", {
              screen: "domain-view",
              params: { domain },
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
