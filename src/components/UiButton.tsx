import {
  Text,
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from "react-native";
import tw from "@src/utils/tailwind";
import { ReactNode } from "react";

export const UiButton = ({
  small,
  content,
  outline = false,
  loading = false,
  danger = false,
  textAdditionalStyles = {},
  children,
  ...props
}: TouchableOpacityProps & {
  small?: boolean;
  loading?: boolean;
  content?: ReactNode;
  children?: ReactNode;
  outline?: boolean;
  danger?: boolean;
  textAdditionalStyles?: object;
}) => {
  return (
    <TouchableOpacity
      {...props}
      style={[
        tw`flex gap-3 flex-row items-center justify-center border-2 rounded-lg border-brand-primary px-2.5`,
        small && tw`py-0.5`,
        !small && tw`py-1.5`,
        !outline && tw`bg-brand-primary`,
        danger && tw`border-content-error`,
        danger && !outline && tw`bg-content-error`,
        props.disabled && tw`opacity-60`,
        props.style,
      ]}
    >
      {!Boolean(content) ? (
        <>
          {children}
          {loading && (
            <ActivityIndicator
              size={16}
              color={outline ? tw.color("brand-primary") : tw.color("white")}
            />
          )}
        </>
      ) : (
        <View style={tw`flex flex-row items-center gap-3`}>
          <Text
            style={[
              tw`font-semibold`,
              small && tw`text-base`,
              !small && tw`text-lg leading-6`,
              outline && tw`text-brand-primary`,
              (!outline || danger) && tw`text-white`,
              textAdditionalStyles,
            ]}
          >
            {content}
          </Text>
          {loading && (
            <ActivityIndicator
              size={16}
              color={outline ? tw.color("brand-primary") : tw.color("white")}
            />
          )}
          {children}
        </View>
      )}
    </TouchableOpacity>
  );
};
