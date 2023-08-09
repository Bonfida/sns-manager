import { View, StyleProp, ViewStyle } from "react-native";
import tw from "@src/utils/tailwind";

type Props = {
  style?: StyleProp<ViewStyle>;
  children: JSX.Element | JSX.Element[] | null;
};
export function Screen({ style, children }: Props) {
  return (
    <View style={[style, tw`flex-1 p-3 bg-background-primary`]}>
      {children}
    </View>
  );
}
