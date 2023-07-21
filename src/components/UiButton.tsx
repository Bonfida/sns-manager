import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import tw from "@src/utils/tailwind";
import { ReactNode } from "react";

export const UiButton = (
  { content, outline = false, children, ...props }:
  TouchableOpacityProps & {
    content?: ReactNode,
    children?: ReactNode,
    outline?: boolean,
  }
) => {
  return (
    <TouchableOpacity
      {...props}
      style={[
        tw`py-2 rounded-lg flex items-center justify-center border-brand-primary`,
        outline && tw`border-2`,
        !outline && tw`bg-brand-primary`,
        props.disabled && tw`opacity-60`,
        props.style,
      ]}
    >
      {children ? children : (
        <Text style={[
          tw`text-lg leading-6 font-semibold`,
          outline && tw`text-brand-primary`,
          !outline && tw`text-white`,
        ]}>
          {content}
        </Text>
      )}
    </TouchableOpacity>
  )
}
