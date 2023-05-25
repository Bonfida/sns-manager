import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "../utils/tailwind";
import { useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "../../types";
import { WrapModal } from "./WrapModal";

export const SuccessCheckoutModal = ({
  modal: { closeModal },
}: {
  modal: { closeModal: () => void };
}) => {
  const navigation = useNavigation<profileScreenProp>();

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <View style={tw`flex flex-row items-center`}>
          <Feather name="check-circle" size={24} color="#16a34a" />
          <Text style={tw`ml-2 text-lg font-bold`}>Congrats!</Text>
        </View>
        <Text style={tw`pl-2 mt-2 text-sm`}>
          All your domains have been purchased
        </Text>
        <TouchableOpacity
          onPress={() => {
            closeModal();
            navigation.navigate("Profile", {});
          }}
          style={tw`mt-4 bg-blue-900 px-4 h-[40px] rounded-lg flex flex-row justify-center items-center`}
        >
          <Text style={tw`text-sm font-bold text-white`}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    </WrapModal>
  );
};
