import { BlurView } from "expo-blur";
import {
  View,
  Text,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from "react-native";
import { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

import tw from "@src/utils/tailwind";

export const WrapModal = ({
  closeModal,
  children,
  blurStyle,
  containerStyle,
  title,
}: {
  title?: ReactNode;
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
        <TouchableWithoutFeedback>
          <View style={tw`bg-white rounded-lg px-3 py-4 w-[350px] relative`}>
            <View style={tw`flex flex-row items-center justify-between`}>
              <Text
                style={tw`flex flex-row items-center gap-2 text-lg font-medium text-content-primary`}
              >
                {title}
              </Text>

              <TouchableOpacity
                style={tw`flex flex-row items-center w-[24px] h-[24px]`}
                onPress={() => closeModal()}
              >
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={tw.color("content-secondary")}
                />
              </TouchableOpacity>
            </View>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </BlurView>
  );
};
