import { Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import tw from "@src/utils/tailwind";
import { abbreviate } from "@src/utils/abbreviate";
import { searchResultScreenProp } from "@src/types";
import { FavoriteButton } from "@src/components/FavoriteButton";

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
    <View style={tw`border-0 rounded-xl my-2 bg-background-secondary flex items-center flex-row py-3 px-4 gap-4`}>
      {/* TODO: add avatar */}
      <Text style={tw`mr-auto`}>
        {abbreviate(`${domain}.sol`, 20, 3)}
      </Text>

      <View style={tw`flex flex-row items-center`}>
        {isOwner && (
          <FavoriteButton domain={domain} isFav={isFav} refresh={refresh} />
        )}
        <TouchableOpacity
          onPress={() => {
            callback && callback();
            navigation.navigate("domain-view", { domain });
          }}
        >
          <Feather style={tw`ml-5`} name="arrow-right" size={20} color="#ADAEB2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
