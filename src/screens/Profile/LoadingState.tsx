import { View } from "react-native";
import SkeletonContent from "react-native-skeleton-content";

import tw from "@src/utils/tailwind";

export const LoadingState = () => {
  return (
    <View style={tw`flex flex-col items-start w-full h-full px-3 py-5 mt-4`}>
      <View style={tw`relative w-full mb-20`}>
        <SkeletonContent isLoading>
          <View
            style={tw`w-[100px] h-[100px] mb-2 rounded-full absolute top-[-25px]`}
          />
        </SkeletonContent>
        <SkeletonContent isLoading>
          <View style={tw`h-[140px] w-full rounded-lg`} />
        </SkeletonContent>
      </View>
      <View style={tw`w-full`}>
        <SkeletonContent isLoading>
          <View style={tw`w-full h-[50px] my-1`} />
          <View style={tw`w-full h-[50px] my-1`} />
          <View style={tw`w-full h-[50px] my-1`} />
          <View style={tw`w-full h-[50px] my-1`} />
        </SkeletonContent>
      </View>
    </View>
  );
};
