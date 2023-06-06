import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import tw from "../utils/tailwind";
import { Screen } from "../components/Screen";
import { useDomains } from "../hooks/useDomains";
import SkeletonContent from "react-native-skeleton-content";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo } from "react";
import { useFavoriteDomain } from "../hooks/useFavoriteDomain";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { useModal } from "react-native-modalfy";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { abbreviate } from "../utils/abbreviate";
import Clipboard from "@react-native-clipboard/clipboard";
import { useUserProgress } from "../hooks/useUserProgress";
import { useIsFocused } from "@react-navigation/native";
import { useProfilePic } from "@bonfida/sns-react";
import { DomainRow } from "../components/DomainRow";
import { t } from "@lingui/macro";
import { useWallet } from "../hooks/useWallet";

export const LoadingState = () => {
  return (
    <View style={tw`flex px-4 py-5 flex-col items-start w-full h-full mt-4`}>
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

export const ProfileScreen = ({ owner }: { owner?: string }) => {
  const connection = useSolanaConnection();
  const { openModal } = useModal();
  const { connected, publicKey, setVisible } = useWallet();
  owner = owner || publicKey?.toBase58();
  const domains = useDomains(owner || publicKey?.toBase58());
  const isFocused = useIsFocused();
  const favorite = useFavoriteDomain(owner);
  const picRecord = useProfilePic(connection!, favorite.result?.reverse || "");
  const progress = useUserProgress();

  const isOwner = owner === publicKey?.toBase58();

  const completedStep = (progress?.result || [])?.filter(
    (e) => !!e.value
  ).length;

  const percentage = Math.floor((100 * completedStep) / 6);
  const showProgress = percentage !== 100;

  const refresh = async () => {
    await Promise.allSettled([
      favorite.execute(),
      progress.execute(),
      picRecord.execute(),
    ]);
  };

  const loading = domains.loading || picRecord.loading || progress.loading;

  useEffect(() => {
    refresh().then();
  }, [isFocused]);

  useEffect(() => {
    if (!connected) {
      setVisible(true);
    }
  }, [connected]);

  const list = useMemo(() => {
    if (favorite.result) {
      return [
        {
          key: favorite.result.domain.toBase58(),
          domain: favorite.result.reverse,
        },
      ].concat(
        domains.result?.filter((e) => e.domain !== favorite.result?.reverse) ||
          []
      );
    }
    return domains.result;
  }, [domains.status, domains.loading, favorite.result?.reverse]);
  const hasDomain = list !== undefined && list.length !== 0;

  return (
    <Screen style={tw`p-0`}>
      {loading ? (
        <LoadingState />
      ) : (
        <ScrollView showsHorizontalScrollIndicator={false}>
          <View
            style={tw`flex flex-row items-center my-3 py-4 px-4 bg-blue-grey-100/60`}
          >
            <View style={tw`relative w-[100px]`}>
              <Image
                source={
                  picRecord.result
                    ? picRecord.result
                    : require("../../assets/default-pic.png")
                }
                style={tw`w-[100px] border-[3px] rounded-lg border-black/10 h-[100px]`}
              />
              {isOwner && (
                <TouchableOpacity
                  onPress={() =>
                    openModal("EditPicture", {
                      currentPic: picRecord.result,
                      domain:
                        favorite.result?.reverse ||
                        domains?.result?.[0]?.domain,
                      refresh,
                      setAsFav: !favorite.result?.reverse,
                    })
                  }
                  style={tw`h-[24px] w-[24px] rounded-full flex items-center justify-center absolute bottom-[-2px] right-[-2px] bg-blue-900`}
                >
                  <Feather name="edit-2" size={12} color="white" />
                </TouchableOpacity>
              )}
            </View>
            <View style={tw`w-full`}>
              <Text style={tw`ml-4 text-xl font-bold max-w-[65%]`}>
                {favorite.result?.reverse || domains?.result?.[0]?.domain}.sol
              </Text>
              <View style={tw`flex flex-row items-center`}>
                <Text style={tw`ml-4 mr-1 text-xs text-blue-grey-800`}>
                  {abbreviate(owner, 18)}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(owner as string);
                    openModal("Success", { msg: "Copied!" });
                  }}
                >
                  <Feather name="copy" size={12} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showProgress && isOwner && (
            <View style={tw`px-4`}>
              <Text style={tw`mt-4 ml-1 font-bold`}>
                {t`Profile completed: ${percentage}%`}
              </Text>
              <View
                style={tw`w-full border-[2px] relative border-black/10 rounded-lg flex flex-row items-center justify-between`}
              >
                <View
                  style={tw`bg-green-600 bg-opacity-80 h-[30px] rounded-md w-[${percentage}%] top-0 left-0`}
                />
                <TouchableOpacity
                  style={tw`mx-2`}
                  onPress={() => openModal("ProgressExplainerModal")}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View
            style={tw`mt-4 mb-2 flex items-center w-full justify-between flex-row px-4`}
          >
            <Text style={tw`text-base font-bold`}>
              {isOwner ? t`My domains` : t`Domains`}
            </Text>
            <TouchableOpacity
              onPress={() =>
                openModal("SearchModal", {
                  domains: domains.result,
                  favorite: favorite.result?.reverse,
                  isOwner,
                  refresh,
                })
              }
              style={tw`mr-4`}
            >
              <Feather name="search" size={20} color="grey" />
            </TouchableOpacity>
          </View>

          <View style={tw`px-4`}>
            {hasDomain ? (
              <FlatList
                data={list}
                renderItem={({ item }) => (
                  <DomainRow
                    refresh={refresh}
                    isFav={favorite.result?.reverse === item.domain}
                    domain={item.domain}
                    key={item.key}
                    isOwner={isOwner}
                  />
                )}
                keyExtractor={(item) => item.domain}
              />
            ) : (
              <Text
                style={tw`mt-10 text-2xl font-semibold text-center text-blue-grey-300`}
              >
                {t`No domain found`}
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};
