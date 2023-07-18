import { View, Text, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { domainViewScreenProp } from "@src/types";
import { Trans } from "@lingui/macro";

export const UnavailableRow = ({ domain }: { domain: string }) => {
  const navigation = useNavigation<domainViewScreenProp>();
  return (
    <View style={tw`border-[1px] border-black/10 rounded-lg my-1`}>
      <View style={tw`flex flex-row items-center justify-between px-4`}>
        <View style={tw`px-4 py-3`}>
          <Text style={tw`font-semibold`}>{domain}.sol</Text>
          <View style={tw`flex flex-row items-center mt-1`}>
            <FontAwesome name="ban" size={14} style={tw`mr-1`} color="black" />
            <Text style={tw`text-blue-grey-600`}>
              <Trans>Taken</Trans>
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("domain-view", { domain })}
            style={tw`bg-blue-900 rounded-md p-2`}
          >
            <Feather name="user" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={tw`w-full rounded-b-lg h-[25px] bg-yellow-vivid-700 flex flex-row justify-center items-center`}
      >
        <Text style={tw`font-bold text-white`}>
          <Trans>This domain has already been purchased</Trans>
        </Text>
      </View>
    </View>
  );
};
