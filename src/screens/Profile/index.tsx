import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useModal } from "react-native-modalfy";
import { useIsFocused } from "@react-navigation/native";
import { useProfilePic } from "@bonfida/sns-react";
import { Trans, t } from "@lingui/macro";
import { Octicons, MaterialCommunityIcons } from "@expo/vector-icons";

import tw from "@src/utils/tailwind";

import { useDomains } from "@src/hooks/useDomains";
import { useFavoriteDomain } from "@src/hooks/useFavoriteDomain";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useUserProgress } from "@src/hooks/useUserProgress";
import { useWallet } from "@src/hooks/useWallet";
import {
  useSubdomainsFromUser,
  SubdomainResult,
} from "@src/hooks/useSubdomains";

import { Screen } from "@src/components/Screen";
import { DomainRow } from "@src/components/DomainRow";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { ProfileBlock } from "@src/components/ProfileBlock";

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

  const [isSearchVisible, toggleSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

    const domainsResult = domains.result.map((item) => {
      const relatedSubdomains: SubdomainResult[] = [];

      // Find subdomains related to domain
      if (subdomains.result) {
        relatedSubdomains.push(
          ...subdomains.result.filter(
            (sub) => sub.subdomain.split(".")[1] === item.domain
          )
        );
      }

      return {
        ...item,
        // Just a double-check that domain pubkey is correct
        key:
          favorite.result?.reverse === item.domain
            ? favorite.result.domain.toBase58()
            : item.key,
        subdomains: relatedSubdomains,
      };
    });

    return domainsResult.sort((a, b) =>
      a!.domain === favorite.result?.reverse ? -1 : 1
    );
  }, [
    domains.status,
    domains.loading,
    favorite.result?.reverse,
    subdomains.status,
    subdomains.loading,
  ]);

  const filteredDomainsList = useMemo(() => {
    if (!searchQuery) return domainsList;

    return domainsList.filter((item) => item.domain.includes(searchQuery));
  }, [domainsList, searchQuery]);

  const hasDomain = domainsList !== undefined && domainsList.length !== 0;

  if (loading)
    return (
      <Screen style={tw`p-0`}>
        <LoadingState />
      </Screen>
    );

  if (!loading && !hasDomain && isOwner)
    return (
      <Screen style={tw`p-0`}>
        <EmptyState owner={owner} />
      </Screen>
    );

  return (
    <Screen style={tw`p-0`}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <ProfileBlock
          owner={owner!}
          domain={favorite.result?.reverse || domains?.result?.[0]?.domain!}
          picRecord={picRecord}
        >
          {showProgress && isOwner && (
            <View>
              <View style={tw`flex flex-row items-center gap-2 mb-2`}>
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
                style={tw`relative flex flex-row items-center justify-between w-full bg-white rounded-md`}
              >
                <View
                  style={tw`bg-content-progress h-[12px] rounded-md w-[${percentage}%] top-0 left-0`}
                />
              </View>
            </View>
          )}
        </ProfileBlock>

        <View
          style={tw`flex flex-row items-center justify-between w-full gap-6 mt-10 mb-2`}
        >
          <Text style={tw`flex-none text-lg font-medium`}>
            {isOwner ? t`My domains` : t`Domains`}
          </Text>

          {isSearchVisible && (
            <CustomTextInput
              value={searchQuery}
              onChangeText={(newText) => setSearchQuery(newText)}
              placeholder={t`Search for a domain`}
              type="search"
              style={tw`flex-1 w-auto`}
            />
          )}
          {!isSearchVisible && (
            <TouchableOpacity
              onPress={() => toggleSearchBar(true)}
              style={tw`border border-content-border bg-white rounded-lg w-[40px] h-[40px] flex items-center justify-center`}
            >
              <Octicons
                name="search"
                size={20}
                color={tw.color("brand-primary")}
              />
            </TouchableOpacity>
          )}
        </View>

        <View>
          {hasDomain && filteredDomainsList.length ? (
            <FlatList
              data={filteredDomainsList}
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
            <>
              <Text
                style={tw`mt-10 text-lg font-semibold text-center text-content-tertiary`}
              >
                {t`No domain found`}
              </Text>

              {hasDomain && (
                <View style={tw`flex flex-row justify-center mt-2`}>
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={tw`p-2 my-auto`}
                  >
                    <Text style={tw`text-base text-brand-primary`}>
                      <Trans>Clear search</Trans>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};
