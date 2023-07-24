import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { ReactNode, useEffect, useMemo } from "react";
import { useModal } from "react-native-modalfy";
import { useIsFocused } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useProfilePic } from "@bonfida/sns-react";
import { t } from "@lingui/macro";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

import tw from "@src/utils/tailwind";
import { abbreviate } from "@src/utils/abbreviate";

import { useDomains } from "@src/hooks/useDomains";
import { useFavoriteDomain } from "@src/hooks/useFavoriteDomain";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useUserProgress } from "@src/hooks/useUserProgress";
import { useWallet } from "@src/hooks/useWallet";
import { useSubdomainsFromUser, SubdomainResult } from "@src/hooks/useSubdomains";

import { Screen } from "@src/components/Screen";
import { DomainRow } from "@src/components/DomainRow";

import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

export const ProfileScreen = ({ owner }: { owner?: string }) => {
  const connection = useSolanaConnection();
  const { openModal } = useModal();
  const { connected, publicKey, setVisible } = useWallet();
  owner = owner || publicKey?.toBase58();
  const domains = useDomains(owner || publicKey?.toBase58());
  const subdomains = useSubdomainsFromUser(
    owner || publicKey?.toBase58() || ""
  );

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
      subdomains.execute(),
    ]);
  };

  const loading =
    domains.loading ||
    picRecord.loading ||
    progress.loading ||
    subdomains.loading;

  useEffect(() => {
    refresh().then();
  }, [isFocused]);

  useEffect(() => {
    if (!connected) {
      setVisible(true);
    }
  }, [connected]);

  const domainsList = useMemo(() => {
    if (!domains.result) return [];

    const domainsResult = domains.result.map(item => {
      const relatedSubdomains: SubdomainResult[] = [];

      // Find subdomains related to domain
      if (subdomains.result) {
        relatedSubdomains.push(
          ...subdomains.result.filter(sub => sub.subdomain.split('.')[1] === item.domain),
        )
      }

      return {
        ...item,
        // Just a double-check that domain pubkey is correct
        key: favorite.result?.reverse === item.domain
          ? favorite.result.domain.toBase58()
          : item.key,
        subdomains: relatedSubdomains,
      }
    })

    return domainsResult.sort((a, b) => a!.domain === favorite.result?.reverse ? -1 : 1);
  }, [domains.status, domains.loading, favorite.result?.reverse, subdomains.status, subdomains.loading]);

  const hasDomain = domainsList !== undefined && domainsList.length !== 0;
  const hasSubdomain =
    subdomains.result !== undefined && subdomains.result.length !== 0;

  if (loading) return (
    <Screen style={tw`p-0`}>
      <LoadingState />
    </Screen>
  )

  if (!loading && !hasDomain && isOwner) return (
    <Screen style={tw`p-0`}>
      <EmptyState owner={owner} />
    </Screen>
  )

  const ProfileBlock = ({ children }: { children?: ReactNode }) => {
    return (
      <LinearGradient
        colors={[tw.color('brand-primary') as string, tw.color('brand-accent') as string]}
        style={tw`mt-15 p-3 pt-[50px] rounded-[20px] relative`}
      >
        <View style={[
          tw`w-[100px] h-[100px] absolute top-[-60px]`,
          // for some reason tailwild properties doesn't work with calc
          { left: 'calc(50% - 50px)' }
        ]}>
          <Image
            source={picRecord.result ? picRecord.result : require("@assets/default-pic.png")}
            style={tw`w-full h-full rounded-full`}
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
              style={tw`h-[24px] w-[24px] rounded-full flex items-center justify-center absolute bottom-0 right-0 bg-brand-accent`}
            >
              <FontAwesome name="camera" size={12} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={tw`w-full flex flex-col items-center`}>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(`${favorite.result?.reverse || domains?.result?.[0]?.domain}.sol`);
              openModal("Success", { msg: t`Copied!` });
            }}
            style={tw`flex flex-row items-center justify-center gap-2`}
          >
            <Text style={tw`text-lg font-semibold text-white`}>
              {favorite.result?.reverse || domains?.result?.[0]?.domain}.sol
            </Text>

            <Feather name="copy" size={12} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(owner as string);
              openModal("Success", { msg: t`Copied!` });
            }}
            style={tw`flex flex-row items-center justify-center gap-2`}
          >
            <Text style={tw`text-xs text-[#D7D9FF]`}>
              {abbreviate(owner, 10, 5)}
            </Text>
            <Feather name="copy" size={9} color="#D7D9FF" />
          </TouchableOpacity>
        </View>

        <View style={tw`mt-5`}>
          {children}
        </View>
      </LinearGradient>
    )
  }

  return (
    <Screen style={tw`p-0`}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <ProfileBlock>
          {showProgress && isOwner && (
            <View>
              <View style={tw`flex flex-row gap-2 items-center mb-2`}>
                <Text style={tw`text-sm text-white`}>
                  {t`Profile completion: ${percentage}%`}
                </Text>
                <TouchableOpacity
                  onPress={() => openModal("ProgressExplainerModal")}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              <View
                style={tw`w-full relative rounded-md flex flex-row items-center justify-between bg-white`}
              >
                <View
                  style={tw`bg-content-progress h-[12px] rounded-md w-[${percentage}%] top-0 left-0`}
                />
              </View>
            </View>
          )}
        </ProfileBlock>

        <View
          style={tw`mt-10 mb-2 flex items-center w-full justify-between flex-row`}
        >
          <Text style={tw`text-lg font-medium`}>
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

        <View>
          {hasDomain ? (
            <FlatList
              data={domainsList}
              renderItem={({ item }) => (
                <DomainRow
                  key={item.domain}
                  refresh={refresh}
                  isFav={favorite.result?.reverse === item.domain}
                  domain={item.domain}
                  subdomains={item.subdomains}
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
    </Screen>
  );
};
