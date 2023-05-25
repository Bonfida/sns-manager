import { WrapModal } from "./WrapModal";
import { View, Text } from "react-native";
import tw from "../utils/tailwind";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
          <Text style={tw`ml-2 text-lg font-bold`}>Registration discount</Text>
        </View>
        <Text style={tw`pl-2 mt-2 text-sm`}>
          If you register your domains using FIDA, you are eligible for a 5%
          discount!
        </Text>
      </View>
    </WrapModal>
  );
};
