import { useReducer, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Feather,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
  FontAwesome,
  EvilIcons,
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";
import { Record as SNSRecord } from "@bonfida/spl-name-service";
import SkeletonContent from "react-native-skeleton-content";
import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation } from "@react-navigation/native";
import { useModal } from "react-native-modalfy";
import { useProfilePic } from "@bonfida/sns-react";
import { Trans, t } from "@lingui/macro";

import tw from "@src/utils/tailwind";
import { getTranslatedName } from "@src/utils/record/place-holder";
import { profileScreenProp } from "@src/types";

import {
  AddressRecord,
  SocialRecord,
  SOCIAL_RECORDS,
  useAddressRecords,
  useSocialRecords,
} from "@src/hooks/useRecords";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useDomainInfo } from "@src/hooks/useDomainInfo";
import { useWallet } from "@src/hooks/useWallet";
import { useSubdomains } from "@src/hooks/useSubdomains";

import { Screen } from "@src/components/Screen";
import { DomainRowRecord, DomainRowRecordProps } from "@src/components/DomainRowRecord";
import { ProfileBlock } from "@src/components/ProfileBlock";
import { UiButton } from '@src/components/UiButton';
import { CustomTextInput } from "@src/components/CustomTextInput";

export const LoadingState = () => {
  return (
    <View style={tw`px-4`}>
      <View style={tw`flex flex-row items-center mt-5`}>
        <SkeletonContent containerStyle={tw`mr-4`} isLoading>
          <View style={tw`w-[100px] h-[100px] rounded-lg`} />
        </SkeletonContent>
        <View>
          <View style={tw`flex flex-col`}>
            <SkeletonContent isLoading>
              <View style={tw`w-[160px] h-[20px]`} />
            </SkeletonContent>
            <SkeletonContent containerStyle={tw``} isLoading>
              <View style={tw`w-[130px] mt-2 h-[10px]`} />
            </SkeletonContent>
          </View>
        </View>
      </View>

      <SkeletonContent containerStyle={tw`mt-10 ml-3`} isLoading>
        <View style={tw`h-[30px] w-[150px]`} />
      </SkeletonContent>

      <FlatList
        style={tw`border-[1px] border-black/10 px-4 mt-2 rounded-lg py-3`}
        data={[0, 0, 0, 0, 0]}
        renderItem={({ item }) => (
          <SkeletonContent containerStyle={tw`my-1`} isLoading>
            <View style={tw`h-[30px] w-[200px]`} />
          </SkeletonContent>
        )}
      />
    </View>
  );
};

const getIcon = (record: SocialRecord) => {
  const defaultIconAttrs = {
    size: 20,
    color: tw.color('content-secondary'),
  }
  switch (record) {
    case SNSRecord.Discord:
      return <FontAwesome5 name="discord" {...defaultIconAttrs} />;
    case SNSRecord.Email:
      return <MaterialIcons name="email" {...defaultIconAttrs} />;
    case SNSRecord.Github:
      return <AntDesign name="github" {...defaultIconAttrs} />;
    case SNSRecord.Reddit:
      return <FontAwesome5 name="reddit" {...defaultIconAttrs} />;
    case SNSRecord.Telegram:
      return <FontAwesome5 name="telegram" {...defaultIconAttrs} />;
    case SNSRecord.Twitter:
      return <FontAwesome5 name="twitter" {...defaultIconAttrs} />;
    case SNSRecord.Url:
      return <MaterialCommunityIcons name="web" {...defaultIconAttrs} />;
    case SNSRecord.Backpack:
      return (
        <MaterialIcons name="backpack" {...defaultIconAttrs} />
      );
    default:
      return null;
  }
};

type FormKeys = AddressRecord | SocialRecord;
type FormValue = string | undefined;
// using Map to store correct order of fields
type FormState = Map<FormKeys, FormValue>;
type FormAction = { type: FormKeys; value: FormValue } | { type: 'init'; value: FormState }

const formReducer = (state: FormState, action: FormAction) => {
  if (action.type === 'init') {
    return action.value;
  }
  state.set(action.type, action.value)
  return state;
}

export const DomainView = ({ domain }: { domain: string }) => {
  const { openModal } = useModal();
  const connection = useSolanaConnection();
  const socialRecords = useSocialRecords(domain);
  const addressRecords = useAddressRecords(domain);
  const domainInfo = useDomainInfo(domain);
  const subdomains = useSubdomains(domain);
  const picRecord = useProfilePic(connection!, domain);
  const { publicKey } = useWallet();
  const navigation = useNavigation<profileScreenProp>();

  const isOwner = domainInfo.result?.owner === publicKey?.toBase58();

  const isSubdomain = domain?.split(".").length === 2;
  const hasSubdomain =
    subdomains.result !== undefined && subdomains.result.length !== 0;
  const isTokenized = domainInfo.result?.isTokenized;

  const [isEditing, toggleEditMode] = useState(false)

  const loading =
    socialRecords.loading ||
    addressRecords.loading ||
    domainInfo.loading ||
    picRecord.loading ||
    subdomains.loading;

  const refresh = async () => {
    await Promise.allSettled([
      domainInfo.execute(),
      socialRecords.execute(),
      addressRecords.execute(),
      picRecord.execute(),
      subdomains.execute(),
    ]);
  };

  const [formState, dispatchFormChange] = useReducer(formReducer, new Map());

  useEffect(() => {
    if (addressRecords.result && socialRecords.result) {
      dispatchFormChange({
        type: 'init',
        value: [...socialRecords.result, ...addressRecords.result].reduce((acc, v) => {
            acc.set(v.record, v.value);
            return acc;
          }, new Map()),
        })
    }
  }, [addressRecords.loading, socialRecords.loading])

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Screen style={tw`p-0`}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        {isTokenized && (
          <TouchableOpacity
            onPress={() => openModal("TokenizeModal", {
              refresh: domainInfo.execute(),
              domain,
              isTokenized,
              isOwner,
            })}
            style={tw`py-1 px-3 mb-3 rounded-lg border border-brand-primary bg-brand-primary bg-opacity-10 flex flex-row justify-between items-center`}
          >
            <Text style={tw`text-brand-primary text-sm font-medium flex flex-row gap-2`}>
              <MaterialCommunityIcons name="diamond-stone" size={24} color={tw.color('brand-primary')} />

              <Trans>This domain is wrapped in an NFT</Trans>
            </Text>

            <MaterialCommunityIcons name="information-outline" size={24} color={tw.color('brand-primary')} />
          </TouchableOpacity>
        )}

        <ProfileBlock
          owner={domainInfo.result?.owner!}
          domain={domain}
          picRecord={picRecord}
        >
          <View style={tw`flex flex-row gap-6`}>

            {/* Transfer button */}
            {isOwner && !isSubdomain && !isTokenized && (
              <View style={tw`flex flex-col flex-1`}>
                <UiButton
                  onPress={() =>
                    openModal("Transfer", {
                      domain,
                      refresh: domainInfo.execute(),
                    })
                  }
                  small
                  content={t`Transfer`}
                />

              </View>
            )}
            {isOwner && (
              <>
                {isSubdomain ? (
                  // delete subdomain button
                  <UiButton
                    onPress={() =>
                      openModal("Delete", {
                        domain,
                        refresh: domainInfo.execute(),
                      })
                    }
                    small
                    content={t`Delete`}
                    style={tw`bg-content-error border-content-error`}
                  />
                ) : (
                  // wrap/unwrap button
                  <UiButton
                    onPress={() =>
                      openModal("TokenizeModal", {
                        domain,
                        isTokenized,
                        refresh: domainInfo.execute(),
                        isOwner,
                      })
                    }
                    small
                    content={isTokenized ? t`Unwrap NFT` : t`Wrap to NFT`}
                    style={tw`flex flex-1 flex-row justify-center items-center`}
                  />
                )}
              </>
            )}
          </View>
        </ProfileBlock>

        <View>
          <View style={tw`mt-6 mb-2 flex flex-row justify-between items-center`}>
            <View style={tw`flex flex-row gap-2`}>
              <TouchableOpacity
                onPress={() => {}}
                style={[
                  tw`rounded-xl px-2 py-1`,
                  tw`bg-background-secondary`
                ]}
              >
                <Text style={tw`text-sm text-brand-primary`}>
                  {t`Socials`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {}}
                style={[
                  tw`rounded-xl px-2 py-1`,
                  tw`bg-background-secondary`
                ]}
              >
                <Text style={tw`text-sm text-brand-primary`}>
                  {t`Addresses`}
                </Text>
              </TouchableOpacity>
              {!isSubdomain && (
                <TouchableOpacity
                  onPress={() => {}}
                  style={[
                    tw`rounded-xl px-2 py-1`,
                    tw`bg-background-secondary`
                  ]}
                >
                  <Text style={tw`text-sm text-brand-primary`}>
                    {t`Subdomains`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isTokenized && (
              <>{isOwner ? (
                <UiButton
                  content={isEditing ? t`Revert` : t`Edit`}
                  small
                  style={tw`flex-initial`}
                  outline={isEditing}
                  textAdditionalStyles={tw`text-sm font-medium`}
                  onPress={() => toggleEditMode(!isEditing)}
                >
                  {isEditing ? (
                    <Ionicons name="close-outline" size={16} color={tw.color('brand-primary')} style={tw`ml-2`} />
                  ) : (
                    <MaterialIcons name="edit" size={16} color="white" style={tw`ml-2`} />
                  )}
                </UiButton>
              ) : (
                <TouchableOpacity onPress={refresh}>
                  <EvilIcons name="refresh" size={24} color={tw.color('content-secondary')} />
                </TouchableOpacity>
              )}</>
            )}
          </View>

          <View style={tw`flex flex-row items-center w-full justify-between mt-2`}>
            {isSubdomain && (
              <View style={tw`flex flex-row gap-4`}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("domain-view", {
                      domain: domain.split(".")[1],
                    })
                  }
                >
                  <FontAwesome name="arrow-left" size={20} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={refresh}>
                  <FontAwesome name="refresh" size={20} color="black" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FlatList
            data={[...formState.keys()]}
            renderItem={({ item }) => (
              <CustomTextInput
                key={item}
                value={formState.get(item)}
                placeholder={t`Not set`}
                editable={isEditing}
                style={tw`mt-4`}
                label={
                  <View style={tw`flex flex-row items-center gap-1`}>
                    {/* TS is kinda stupid here so "any" helps us */}
                    {SOCIAL_RECORDS.includes(item as any) && getIcon(item as any)}

                    <Text style={tw`text-content-secondary text-sm leading-6`}>
                      {getTranslatedName(item)}
                    </Text>
                  </View>
                }
                onChangeText={(text) => dispatchFormChange({
                  type: item,
                  value: text,
                })}
              />
            )}
          />
        </View>

        {!isSubdomain && (
          <View style={tw`flex flex-col justify-around bg-background-secondary rounded-xl mt-10 py-3 px-4`}>
            {isOwner && (
              <View style={tw`mb-4 flex flex-row justify-end`}>
                <TouchableOpacity
                  onPress={() => openModal("CreateSubdomain", { refresh, domain })}
                >
                  <Text style={tw`text-brand-primary text-base flex flex-row gap-2 justify-end`}>
                    <Trans>Add subdomain</Trans>

                    <Entypo name="plus" size={20} color="brand-primary" />
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {hasSubdomain ? (
              <FlatList
                data={subdomains.result}
                renderItem={({ item }) => (
                  <DomainRowRecord
                    key={`${item}.${domain}`}
                    domain={`${item}.${domain}`}
                    isSubdomain
                  />
                )}
              />
            ) : (
              <Text
                style={tw`text-sm text-content-secondary`}
              >
                <Trans>
                  You don’t have any subdomains yet. You can create as many as you
                  want to use your profiles for different purposes.
                </Trans>
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};
