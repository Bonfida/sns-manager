import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "../utils/tailwind";
import { WrapModal } from "./WrapModal";
import { Trans } from "@lingui/macro";
import { useNavigation } from "@react-navigation/native";
import { domainViewScreenProp } from "@src/types";

export const SuccessSubdomainModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const navigation = useNavigation<domainViewScreenProp>();

  const msg = getParam<string>("msg");
  const subdomain = getParam<string>("subdomain");

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <View style={tw`flex flex-row items-center`}>
          <Feather name="check-circle" size={24} color="#16a34a" />
          <Text style={tw`ml-2 text-lg font-bold`}>
            <Trans>Success!</Trans>
          </Text>
        </View>
        <Text style={tw`pl-2 mt-2 text-sm`}>{msg}</Text>

        <View style={tw`flex flex-col items-center gap-2 mt-4`}>
          <TouchableOpacity
            onPress={() => {
              closeModal();
              navigation.navigate("domain-view", { domain: subdomain });
            }}
            style={tw`bg-blue-900 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>
              <Trans>View subdomain</Trans>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={closeModal}
            style={tw`bg-blue-grey-400 w-full px-4 h-[40px] rounded-lg flex flex-row justify-center items-center`}
          >
            <Text style={tw`text-sm font-bold text-white`}>
              <Trans>Close</Trans>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapModal>
  );
};
