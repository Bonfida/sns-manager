import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "../utils/tailwind";
import { useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "@src/types";
import { WrapModal } from "./WrapModal";
import { Trans } from "@lingui/macro";

export const SuccessCheckoutModal = ({
  modal: { closeModal },
}: {
  modal: { closeModal: () => void };
}) => {
  const navigation = useNavigation<profileScreenProp>();

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`flex flex-row items-center`}>
        <Feather name="check-circle" size={24} color="#16a34a" />
        <Text style={tw`ml-2 text-lg font-bold`}>
          <Trans>Congrats!</Trans>
        </Text>
      </View>
      <Text style={tw`pl-2 mt-2 text-sm`}>
        <Trans>All your domains have been purchased</Trans>
      </Text>
      <TouchableOpacity
        onPress={() => {
          closeModal();
          navigation.navigate("Profile", {});
        }}
        style={tw`mt-4 bg-blue-900 px-4 h-[40px] rounded-lg flex flex-row justify-center items-center`}
      >
        <Text style={tw`text-sm font-bold text-white`}>
          <Trans>Go to Profile</Trans>
        </Text>
      </TouchableOpacity>
    </WrapModal>
  );
};
