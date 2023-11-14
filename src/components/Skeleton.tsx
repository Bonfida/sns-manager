import tw from "@src/utils/tailwind";
import React, { useRef, useEffect, useState, ReactNode } from "react";
import { Animated, type LayoutChangeEvent, View, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface SkeletonProps {
  style?: ReturnType<typeof tw>;
  bgColor?: string;
  isLoading?: boolean;
  children?: ReactNode;
}

export const Skeleton = ({
  style,
  bgColor = "#e1e9ee",
  isLoading = false,
  children,
}: SkeletonProps = {}) => {
  const translateX = useRef(new Animated.Value(-1)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
          easing: Easing.ease,
        }),
      ]),
    ).start();
  }, [translateX]);

  const translateXStyle = {
    transform: [
      {
        translateX: translateX.interpolate({
          inputRange: [-1, 1],
          outputRange: [-width * 2, width * 2],
        }),
      },
    ],
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: newWidth } = event.nativeEvent.layout;
    setWidth(newWidth);
  };

  return isLoading ? (
    <View
      style={[style, tw`overflow-hidden bg-[${bgColor}]`]}
      onLayout={onLayout}
    >
      <AnimatedGradient
        colors={[bgColor, "#F2F8FC", bgColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[translateXStyle, tw`w-full h-full`]}
      />
    </View>
  ) : (
    <>{children}</>
  );
};
