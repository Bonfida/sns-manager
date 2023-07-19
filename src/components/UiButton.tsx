import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import tw from "@src/utils/tailwind";
import { ReactNode } from "react";

export const UiButton = (
  { content, children, ...props }:
  TouchableOpacityProps & { content?: ReactNode, children?: ReactNode }
) => {
  return (
    <TouchableOpacity
      {...props}
      style={[
        tw`bg-brand-primary py-2 rounded-lg flex items-center justify-center`,
        props.disabled && tw`opacity-60`
      ]}
    >
      {children ? children : (
        <Text style={tw`text-lg leading-6 font-semibold text-white`}>
          {content}
        </Text>
      )}
    </TouchableOpacity>
  )
}
