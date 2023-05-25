import { View, Text, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { MaterialIcons } from "@expo/vector-icons";
import { WrapModal } from "./WrapModal";

export const ErrorModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const message = getParam<string>("msg", "Something went wrong");

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <View style={tw`flex flex-row items-center`}>
          <MaterialIcons name="error-outline" size={24} color="#dc2626" />
          <Text style={tw`ml-2 text-lg font-bold`}>Something went wrong</Text>
        </View>
        <Text style={tw`pl-2 mt-2 text-sm`}>{message}</Text>
      </View>
    </WrapModal>
  );
};
