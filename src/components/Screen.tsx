import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import tw from "../utils/tailwind";

type Props = {
  style?: StyleProp<ViewStyle>;
  children: JSX.Element | JSX.Element[] | null;
};
export function Screen({ style, children }: Props) {
  return (
    <View style={[styles.screen, style, tw`bg-slate-50`]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
    // backgroundColor: "#F0F4F8",
  },
});
