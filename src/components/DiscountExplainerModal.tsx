import { WrapModal } from "./WrapModal";
import { View, Text } from "react-native";
import tw from "../utils/tailwind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

export const DiscountExplainerModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <View style={tw`flex flex-row items-center`}>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color="#16a34a"
          />
          <Text style={tw`ml-2 text-lg font-bold`}>
            <Trans>Registration discount</Trans>
          </Text>
        </View>
        <Text style={tw`pl-2 mt-2 text-sm`}>
          <Trans>
            If you register your domains using FIDA, you are eligible for a 5%
            discount!
          </Trans>
        </Text>
      </View>
    </WrapModal>
  );
};
