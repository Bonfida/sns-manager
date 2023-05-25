import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "../utils/tailwind";
import { WrapModal } from "./WrapModal";

export const SuccessModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const msg = getParam<string>("msg");

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <View style={tw`flex flex-row items-center`}>
          <Feather name="check-circle" size={24} color="#16a34a" />
          <Text style={tw`ml-2 text-lg font-bold`}>Success!</Text>
        </View>
        <Text style={tw`pl-2 mt-2 text-sm`}>{msg}</Text>
        <TouchableOpacity
          onPress={() => {
            closeModal();
          }}
          style={tw`mt-4 bg-blue-900 px-4 h-[40px] rounded-lg flex flex-row justify-center items-center`}
        >
          <Text style={tw`text-sm font-bold text-white`}>Close</Text>
        </TouchableOpacity>
      </View>
    </WrapModal>
  );
};
