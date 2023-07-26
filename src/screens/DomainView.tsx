import { useReducer, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Record as SNSRecord } from "@bonfida/spl-name-service";
import { Feather } from "@expo/vector-icons";
import SkeletonContent from "react-native-skeleton-content";
import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation } from "@react-navigation/native";
import { useModal } from "react-native-modalfy";
import { FontAwesome, EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { useProfilePic } from "@bonfida/sns-react";
import { Trans, t } from "@lingui/macro";

import tw from "@src/utils/tailwind";
import { getTranslatedName } from "@src/utils/record/place-holder";
import { profileScreenProp } from "@src/types";

import {
  AddressRecord,
  SocialRecord,
  SOCIAL_RECORDS,
  ADDRESS_RECORDS,
  useAddressRecords,
  useSocialRecords,
} from "@src/hooks/useRecords";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useDomainInfo } from "@src/hooks/useDomainInfo";
import { useWallet } from "@src/hooks/useWallet";
import { useSubdomains } from "@src/hooks/useSubdomains";

import { getIcon, SocialRecordCard } from "@src/components/SocialRecord";
import { Screen } from "@src/components/Screen";
import { SubdomainRow } from "@src/components/SubdomainRow";
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

  const [isEditable, toggleEditMode] = useState(false)

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
            {isSubdomain && (
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
            )}

            {/* wrap/unwrap button */}
            {isOwner && !isSubdomain && (
              <UiButton
                onPress={() =>
                  openModal("TokenizeModal", {
                    domain,
                    isTokenized,
                    refresh: domainInfo.execute(),
                  })
                }
                small
                content={isTokenized ? t`Unwrap NFT` : t`Wrap to NFT`}
                style={tw`flex flex-1 flex-row justify-center items-center`}
              />
            )}
          </View>
        </ProfileBlock>

        <View>
          <View style={tw`my-6 flex flex-row justify-between items-center`}>
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

            {isOwner ? (
              <UiButton
                content={t`Edit`}
                small
                style={tw`flex-initial`}
                textAdditionalStyles={tw`text-sm`}
                onPress={() => toggleEditMode(!isEditable)}
              >
                <MaterialIcons name="edit" size={16} color="white" style={tw`ml-2`} />
              </UiButton>
            ) : (
              <TouchableOpacity onPress={refresh}>
                <EvilIcons name="refresh" size={24} color={tw.color('content-secondary')} />
              </TouchableOpacity>
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

          <View style={tw`flex flex-col gap-4`}>
            {[...formState.keys()].map(key => (
              <CustomTextInput
                key={key}
                value={formState.get(key)}
                placeholder={t`Not set`}
                editable={isEditable}
                label={
                  <View style={tw`flex flex-row gap-1`}>
                    {/* Why TS marks "includes" as a definition, but not conditional check? */}
                    {SOCIAL_RECORDS.includes(key as any) && getIcon(key as any)}

                    <Text style={tw`text-content-secondary text-sm leading-6`}>
                      {getTranslatedName(key)}
                    </Text>
                  </View>
                }
                onChangeText={(text) => dispatchFormChange({
                  type: key,
                  value: text,
                })}
              />
            ))}
          </View>

          <View style={tw`flex flex-col justify-around flex-wrap`}>
            {socialRecords?.result?.map((e) => {
              return (
                <SocialRecordCard
                  domain={domain}
                  currentValue={e.value}
                  record={e.record as SocialRecord}
                  isOwner={isOwner}
                  refresh={refresh}
                  key={`record-${e.record}`}
                  isTokenized={isTokenized}
                />
              );
            })}
          </View>

          <Text style={tw`text-xl font-bold text-blue-grey-900 mt-4 mb-1`}>
            <Trans>Addresses</Trans>
          </Text>

          <FlatList
            style={tw`mb-3`}
            data={addressRecords.result}
            renderItem={({ item }) => (
              <RenderRecord
                isOwner={isOwner}
                record={item.record}
                value={item.value}
                domain={domain}
                isTokenized={isTokenized}
                refresh={refresh}
              />
            )}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const RenderRecord = ({
  record,
  value,
  isOwner,
  domain,
  refresh,
  isTokenized,
}: {
  record: SNSRecord;
  value: string | undefined;
  isOwner?: boolean;
  domain: string;
  refresh: () => Promise<void>;
  isTokenized?: boolean;
}) => {
  const { openModal } = useModal();
  const worm = value && record === SNSRecord.BSC;

  return (
    <View
      style={tw`border-b-[1px] flex flex-row items-center justify-between px-4 py-2 w-full h-[60px] border-black/20`}
    >
      <View style={tw`flex flex-row items-center`}>
        {/* Record title & content */}
        <View style={tw`flex flex-col items-start justify-start`}>
          <Text style={tw`font-bold text-blue-900 capitalize`}>{record}</Text>
          {!!value ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  openModal("Success", { msg: t`Copied!` });
                  Clipboard.setString(value);
                }}
              >
                <Text style={tw`text-sm font-bold`}>{value}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={tw`text-sm font-bold`}>
              <Trans>Not set</Trans>
            </Text>
          )}
        </View>
      </View>

      {/* Edit button (if owner) */}
      <View style={tw`flex flex-row items-center`}>
        {worm && (
          <TouchableOpacity
            style={tw`mr-2`}
            onPress={() => openModal("WormholeExplainer")}
          >
            <Image
              style={tw`h-[15px] w-[15px]`}
              source={require("@assets/wormhole.svg")}
            />
          </TouchableOpacity>
        )}
        {isOwner && !isTokenized && (
          <TouchableOpacity
            onPress={() =>
              openModal("EditRecordModal", {
                record,
                currentValue: value,
                domain,
                refresh,
              })
            }
          >
            <Feather name="edit-3" size={16} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
