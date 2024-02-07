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
import { useRecordsV2 } from "@bonfida/sns-react";
import { Trans, t } from "@lingui/macro";
import { Octicons, MaterialCommunityIcons } from "@expo/vector-icons";

import tw from "@src/utils/tailwind";

import {
  usePictureRecordValidation,
  useDomains,
  useFavoriteDomain,
  useSolanaConnection,
  useUserProgress,
  useWallet,
  useSubdomainsFromUser,
  SubdomainResult,
} from "@src/hooks";

import { Screen } from "@src/components/Screen";
import { DomainRow } from "@src/components/DomainRow";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { ProfileBlock } from "@src/components/ProfileBlock";

import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { Record, getDomainKeySync } from "@bonfida/spl-name-service";

export const ProfileScreen = ({ owner }: { owner?: string }) => {
  const connection = useSolanaConnection();
  const { openModal } = useModal();
  const { connected, publicKey, setVisible } = useWallet();
  owner = owner || publicKey?.toBase58();
  const domains = useDomains(owner || publicKey?.toBase58());
  const subdomains = useSubdomainsFromUser(
    owner || publicKey?.toBase58() || "",
  );

  const [isSearchVisible, toggleSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isFocused = useIsFocused();
  const favorite = useFavoriteDomain(owner);
  const {
    result: picRecordsList = [],
    execute: refreshPic,
    loading: picLoading,
  } = useRecordsV2(connection!, favorite.result?.reverse!, [Record.Pic], true);

  const picRecord = useMemo(() => {
    const picRecord = picRecordsList.find(
      (r) => r?.record === Record.Pic,
    )?.deserializedContent;

    return picRecord;
  }, [picRecordsList]);

  const { isValid: isCurrentPicValid } = usePictureRecordValidation(picRecord);

  const progress = useUserProgress();

  const isOwner = owner === publicKey?.toBase58();

  const completedStep = (progress?.result || [])?.filter(
    (e) => !!e.value,
  ).length;

  const percentage = Math.floor((100 * completedStep) / 6);
  const showProgress = percentage !== 100;

  const refresh = async () => {
    await Promise.allSettled([
      favorite.execute(),
      progress.execute(),
      refreshPic(),
      subdomains.execute(),
    ]);
  };

  const loading =
    domains.loading || picLoading || progress.loading || subdomains.loading;

  useEffect(() => {
    refresh().then();
  }, [isFocused]);

  useEffect(() => {
    if (!connected) {
      setVisible(true);
    }
  }, [connected]);

  const subsOnly = useMemo(() => {
    if (!subdomains.result) return [];
    return subdomains.result
      ?.filter(
        (sub) =>
          !domains.result?.some(
            (e) => e.domain === sub.subdomain.split(".")[1],
          ),
      )
      .map((e) => {
        const domain = e.subdomain.split(".")[1];
        return {
          key: getDomainKeySync(domain).pubkey.toBase58(),
          subdomains: [{ subdomain: e.subdomain, key: e.key }],
          domain,
        };
      });
  }, [domains.status, domains.loading, subdomains.status, subdomains.loading]);

  const domainsList = useMemo(() => {
    if (!domains.result) return [];

    const domainsResult = domains.result.map((item) => {
      const relatedSubdomains: SubdomainResult[] = [];

      // Find subdomains related to domain
      if (subdomains.result) {
        relatedSubdomains.push(
          ...subdomains.result.filter(
            (sub) => sub.subdomain.split(".")[1] === item.domain,
          ),
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
      a!.domain === favorite.result?.reverse ? -1 : 1,
    );
  }, [
    domains.status,
    domains.loading,
    favorite.result?.reverse,
    subdomains.status,
    subdomains.loading,
  ]);

  const filteredSubdomainsList = useMemo(() => {
    if (!searchQuery) return subsOnly;
    return subsOnly.filter((item) => item?.domain?.includes(searchQuery));
  }, [subsOnly, searchQuery]);

  const filteredDomainsList = useMemo(() => {
    if (!searchQuery) return domainsList;

    return domainsList.filter((item) => item.domain.includes(searchQuery));
  }, [domainsList, searchQuery]);

  const hasDomain = domainsList !== undefined && domainsList.length !== 0;
  const hasSubs = subsOnly !== undefined && subsOnly.length !== 0;

  if (loading) {
    return (
      <Screen style={tw`p-0`}>
        <LoadingState />
      </Screen>
    );
  }

  if (!loading && !hasDomain && !hasSubs && isOwner) {
    return (
      <Screen style={tw`p-0`}>
        <EmptyState owner={owner} />
      </Screen>
    );
  }

  return (
    <Screen style={tw`p-0`}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <ProfileBlock
          owner={owner!}
          domain={
            favorite.result?.reverse ||
            domains?.result?.[0]?.domain! ||
            subdomains?.result?.[0]?.subdomain!
          }
          picRecord={picRecord}
          isPicValid={isCurrentPicValid}
          onNewPicUploaded={() => {
            refreshPic();
          }}
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
              scrollEnabled={false}
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

        {filteredSubdomainsList.length > 0 && (
          <View style={tw`mt-10 mb-2`}>
            <Text style={tw`flex-none text-lg font-medium`}>
              {isOwner ? t`My sub domains` : t`Sub domains`}
            </Text>
            <FlatList
              data={filteredSubdomainsList}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <DomainRow
                  key={item.key}
                  refresh={refresh}
                  domain={item.domain}
                  subdomains={item.subdomains}
                  isOwner={false}
                />
              )}
              keyExtractor={(item) => item.domain}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};
