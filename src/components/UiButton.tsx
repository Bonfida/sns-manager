import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from "react-native";
import tw from "@src/utils/tailwind";
import { ReactNode } from "react";

export const UiButton = (
  { small, content, outline = false, loading = false, children, ...props }:
  TouchableOpacityProps & {
    small?: boolean;
    loading?: boolean;
    content?: ReactNode,
    children?: ReactNode,
    outline?: boolean,
  }
) => {
  return (
    <TouchableOpacity
      {...props}
      style={[
        tw`rounded-lg flex flex-1 items-center justify-center border-2 border-brand-primary`,
        small && tw`py-0.5`,
        !small && tw`py-1.5`,
        !outline && tw`bg-brand-primary`,
        props.disabled && tw`opacity-60`,
        props.style,
      ]}
    >

      {!content ? (
        <>
          {children}
          {loading && <ActivityIndicator style={tw`ml-3`} size={16} color={outline ? tw.color('brand-primary') : tw.color("white")} /> }
        </>
      ) : (
        <Text style={[
          tw`font-semibold`,
          small && tw`text-base`,
          !small && tw`text-lg leading-6`,
          outline && tw`text-brand-primary`,
          !outline && tw`text-white`,
        ]}>
          {content}
          {loading && <ActivityIndicator style={tw`ml-3`} size={16} color={outline ? tw.color('brand-primary') : tw.color("white")} /> }
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}
