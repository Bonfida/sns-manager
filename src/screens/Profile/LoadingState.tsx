import { View, Platform } from "react-native";
import { Skeleton } from "@src/components/Skeleton";
import tw from "@src/utils/tailwind";

export const LoadingState = () => {
  return (
    <View
      style={[
        tw`flex items-start w-full h-full px-3 mt-5`,
        Platform.OS === "web" && tw`mt-0`,
      ]}
    >
      <View style={tw`w-full h-[180px] mb-10`}>
        <Skeleton
          style={tw`w-[100px] h-[100px] mb-2 rounded-full m-auto -mb-[40px]`}
          isLoading
        />
        <Skeleton style={tw`h-[140px] w-full rounded-lg`} isLoading />
      </View>

      <View style={tw`w-full`}>
        <Skeleton style={tw`w-full h-[50px] my-1`} isLoading />
        <Skeleton style={tw`w-full h-[50px] my-1`} isLoading />
        <Skeleton style={tw`w-full h-[50px] my-1`} isLoading />
        <Skeleton style={tw`w-full h-[50px] my-1`} isLoading />
      </View>
    </View>
  );
};
