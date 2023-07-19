import {
	TextInput,
  TextInputProps,
	Platform,
} from "react-native";
import tw from "@src/utils/tailwind";

export const CustomTextInput = (props: TextInputProps) => {
	return (
		<TextInput
      {...props}
      style={[
        Platform.OS === "web" && { outlineWidth: 0 },
        tw`bg-white h-full rounded-lg pl-3 font-regular text-content-secondary border border-content-border`,
      ]}
      placeholderTextColor="#A3A3A3"
    />
	)
}
