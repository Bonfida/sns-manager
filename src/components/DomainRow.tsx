import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useProfilePic } from "@bonfida/sns-react";
import SkeletonContent from "react-native-skeleton-content";
import { LinearGradient } from 'expo-linear-gradient';

import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import tw from "@src/utils/tailwind";
import { abbreviate } from "@src/utils/abbreviate";
import { generateColor } from "@src/utils/generate-color";
import { searchResultScreenProp } from "@src/types";
import { FavoriteButton } from "@src/components/FavoriteButton";

export const DomainRow = ({
  domain,
  isFav,
  refresh,
  isOwner,
  callback,
}: {
  domain: string;
  isFav: boolean;
  refresh: () => Promise<void>;
  isOwner: boolean;
  callback?: () => void;
}) => {
  const navigation = useNavigation<searchResultScreenProp>();
  const connection = useSolanaConnection();
  const picRecord = useProfilePic(connection!, domain);
  const [picPlaceholderColor, setPicPlaceholderColor] = useState(tw.color('brand-accent'))

  useEffect(() => {
    if (!picRecord.loading && !picRecord.result) {
      setPicPlaceholderColor(generateColor())
    }
  }, [picRecord.loading])

  return (
    <View style={tw`border-0 rounded-xl my-2 bg-background-secondary flex items-center flex-row py-3 px-4 gap-4`}>
      <SkeletonContent containerStyle={tw`w-[40px]`} isLoading={picRecord.loading}>
        <>
          {picRecord.result && (
            <Image
              style={tw`w-[40px] rounded-full h-[40px]`}
              source={{ uri: picRecord.result }}
            />
          )}
          {!picRecord.result && (
            <LinearGradient
              colors={[picPlaceholderColor!, 'rgba(180, 77, 18, 0)']}
              style={tw`w-[40px] rounded-full h-[40px]`}
            >
              <View></View>
            </LinearGradient>
          )}
        </>
      </SkeletonContent>

      <Text style={tw`mr-auto`}>
        {abbreviate(`${domain}.sol`, 20, 3)}
      </Text>

      <View style={tw`flex flex-row items-center`}>
        {isOwner && (
          <FavoriteButton domain={domain} isFav={isFav} refresh={refresh} />
        )}
        <TouchableOpacity
          onPress={() => {
            callback && callback();
            navigation.navigate("domain-view", { domain });
          }}
        >
          <Feather style={tw`ml-5`} name="arrow-right" size={20} color="#ADAEB2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
