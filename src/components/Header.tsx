import { View, TouchableOpacity } from "react-native";
import tw from "@src/utils/tailwind";
import { Ionicons } from "@expo/vector-icons";
import { useModal } from "react-native-modalfy";

export const LanguageHeader = () => {
  const { openModal } = useModal();

  return (
    <View style={tw`absolute top-2 left-2`}>
      <TouchableOpacity
        onPress={() => openModal("LanguageModal")}
        style={tw`flex flex-row items-center p-1`}
      >
        <Ionicons
          name="language"
          size={24}
          color={tw.color("content-secondary")}
        />
      </TouchableOpacity>
    </View>
  );
};
