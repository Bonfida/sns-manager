import {
  TextInput,
  TextInputProps,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "@src/utils/tailwind";

type TextInputTypes = 'text' | 'search'

export const CustomTextInput = (
  { type = 'text', ...props }: TextInputProps & {
    type?: TextInputTypes;
  }
) => {
  const ClearValueAction = () => {
    if (props.onChangeText && type === 'search' && props.value) {
      return (
        <TouchableOpacity
          onPress={() => props.onChangeText?.('')}
          style={tw`flex flex-col rounded-lg items-center justify-center h-[38px] px-3 bg-white absolute right-[1px] top-[1px]`}
        >
          <Feather name="x" size={16} color="black" />
        </TouchableOpacity>
      )
    }
    return null
  }

  return (
    <View style={tw`w-full h-[40px] relative`}>
      <TextInput
        {...props}
        style={[
          Platform.OS === "web" && { outlineWidth: 0 },
          tw`bg-white h-full rounded-lg pl-3 text-content-secondary border border-content-border`,
        ]}
        placeholderTextColor="#A3A3A3"
      />

      <ClearValueAction />
    </View>
  )
}
