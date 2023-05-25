import { BlurView } from "expo-blur";
import {
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from "react-native";
import tw from "../utils/tailwind";
import { ReactNode } from "react";

export const WrapModal = ({
  closeModal,
  children,
  blurStyle,
  containerStyle,
}: {
  closeModal: () => void;
  children: ReactNode;
  blurStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}) => {
  return (
    <BlurView
      tint="light"
      style={[{ width: "100vw", height: "100vh" }, blurStyle]}
      intensity={30}
    >
      <TouchableOpacity
        style={[
          tw`flex flex-col items-center justify-center w-full h-full px-5`,
          containerStyle,
        ]}
        onPressOut={closeModal}
      >
        <TouchableWithoutFeedback>{children}</TouchableWithoutFeedback>
      </TouchableOpacity>
    </BlurView>
  );
};
