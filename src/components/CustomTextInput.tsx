import React, { ReactNode } from "react";
import {
  TextInput,
  Text,
  TextInputProps,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "@src/utils/tailwind";

type TextInputTypes = "text" | "search";

export const CustomTextInput = ({
  type = "text",
  label = null,
  editable = true,
  style = {},
  ...props
}: TextInputProps & {
  type?: TextInputTypes;
  label?: string | ReactNode;
  editable?: boolean;
}) => {
  const customProps = { ...props };

  if (customProps.onKeyPress && customProps.onChangeText && type === "search") {
    customProps.onKeyPress = (e) => {
      if (e.nativeEvent.key === "Escape") {
        customProps.onChangeText?.("");
      }
      props.onKeyPress?.(e);
    };
  }

  const ClearValueAction = () => {
    if (customProps.onChangeText && type === "search" && customProps.value) {
      return (
        <TouchableOpacity
          onPress={() => customProps.onChangeText?.("")}
          style={tw`flex flex-col rounded-lg items-center justify-center h-[38px] px-3 bg-white absolute right-[1px] top-[1px]`}
        >
          <Feather name="x" size={16} color={tw.color("brand-primary")} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={[tw`w-full`, style]}>
      <RenderLabel label={label} />

      <View style={tw`w-full h-[40px] relative`}>
        <TextInput
          {...customProps}
          editable={editable}
          style={[
            Platform.OS === "web" && {
              outlineWidth: 0,
              textOverflow: "ellipsis",
            },
            tw`h-full px-3 bg-white border rounded-lg text-content-secondary border-content-border`,
            !editable && tw`bg-background-primary`,
          ]}
          placeholderTextColor="#A3A3A3"
        />

        <ClearValueAction />
      </View>
    </View>
  );
};

const RenderLabel = ({ label }: { label: string | ReactNode }) => {
  if (!label) return null;

  if (typeof label === "string") {
    return <Text style={tw`mb-2 text-sm text-content-secondary`}>{label}</Text>;
  }

  return <View style={tw`mb-2`}>{label as ReactNode}</View>;
};
