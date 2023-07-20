import { View } from "react-native";
import SkeletonContent from "react-native-skeleton-content";

import tw from "@src/utils/tailwind";

export const LoadingState = () => {
  return (
    <View style={tw`flex px-3 py-5 flex-col items-start w-full h-full mt-4`}>
      <SkeletonContent containerStyle={tw``} isLoading>
        <View style={tw`w-[100px] mb-5 h-[100px] rounded-lg`} />
      </SkeletonContent>
      <View>
        <SkeletonContent isLoading>
        <View style={tw`w-[340px] h-[50px] my-1`} />
        <View style={tw`w-[340px] h-[50px] my-1`} />
        <View style={tw`w-[340px] h-[50px] my-1`} />
        <View style={tw`w-[340px] h-[50px] my-1`} />
        <View style={tw`w-[340px] h-[50px] my-1`} />
        </SkeletonContent>
      </View>
    </View>
  );
};
