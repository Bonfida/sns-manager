import { useReducer, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  AntDesign,
  FontAwesome5,
  MaterialIcons,
  EvilIcons,
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";
import {
  Record as SNSRecord,
  getDomainKeySync,
  NameRegistryState,
  transferInstruction,
  NAME_PROGRAM_ID,
  createNameRegistry,
  updateInstruction,
  Numberu32,
  deleteInstruction,
  serializeRecord,
  serializeSolRecord,
} from "@bonfida/spl-name-service";
import { ROOT_DOMAIN } from "@bonfida/name-offers";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import SkeletonContent from "react-native-skeleton-content";
import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation } from "@react-navigation/native";
import { useModal } from "react-native-modalfy";
import { useProfilePic } from "@bonfida/sns-react";
import { ChainId, Network, post } from "@bonfida/sns-emitter";
import { Trans, t } from "@lingui/macro";

import tw from "@src/utils/tailwind";
import { getTranslatedName } from "@src/utils/record/place-holder";
import { profileScreenProp } from "@src/types";

import {
  AddressRecord,
  SocialRecord,
  ADDRESS_RECORDS,
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

import { sendTx } from "@src/utils/send-tx";
import { sleep } from "@src/utils/sleep";

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
type FormValue = string;
// using Map to store correct order of fields
type FormState = Map<FormKeys, FormValue>;
type FormAction = { type: FormKeys; value: FormValue } | { type: 'bulk'; value: FormState }

const formReducer = (state: FormState, action: FormAction) => {
  if (action.type === 'bulk') {
    return action.value;
  }

  const newState = new Map(state);
  newState.set(action.type, action.value)
  return newState;
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

  const { signTransaction, setVisible, connected, signMessage } = useWallet();
  const [isEditing, toggleEditMode] = useState(false);
  const [formState, dispatchFormChange] = useReducer(formReducer, new Map());
  // We store form dirtiness to disable/enable "Save" button
  const [isFormDirty, setFormDirty] = useState(false);
  const [previousFormState, setPreviousFormState] = useState<any>(null);
  const [isLoading, setFormLoading] = useState(false);

  const discardChanges = () => {
    if (isFormDirty) {
      dispatchFormChange({
        type: 'bulk',
        value: new Map(previousFormState),
      })
    }
    toggleEditMode(false)
  }

  const resetForm = () => {
    setFormDirty(false);
    toggleEditMode(false);
    setPreviousFormState(null);
    setFormLoading(false);
  }

  const handleUpdate = async (fields: { record: SNSRecord; value: string; }[]) => {
    if (!connection || !publicKey || !signTransaction || !signMessage) return [];

    const ixs: TransactionInstruction[] = [];

    for (const field of fields) {
      const { record, value } = field
      const sub = Buffer.from([1]).toString() + record;
      let { pubkey: recordKey, isSub } = getDomainKeySync(
        record + "." + domain,
        true
      );
      const parent = isSub ? getDomainKeySync(domain).pubkey : ROOT_DOMAIN;

      // Check if exists
      let ser: Buffer;
      if (record === SNSRecord.SOL) {
        const toSign = Buffer.concat([
          new PublicKey(value).toBuffer(),
          recordKey.toBuffer(),
        ]);

        const encodedMessage = new TextEncoder().encode(toSign.toString("hex"));
        const signed = await signMessage(encodedMessage);
        ser = serializeSolRecord(
          new PublicKey(value),
          recordKey,
          publicKey,
          signed
        );
      } else {
        ser = serializeRecord(value, record);
      }
      const space = ser.length;
      const currentAccount = await connection.getAccountInfo(recordKey);

      if (!currentAccount?.data) {
        const lamports = await connection.getMinimumBalanceForRentExemption(
          space + NameRegistryState.HEADER_LEN
        );
        const ix = await createNameRegistry(
          connection,
          sub,
          space,
          publicKey,
          publicKey,
          lamports,
          undefined,
          parent
        );
        ixs.push(ix);
      } else {
        const { registry } = await NameRegistryState.retrieve(
          connection,
          recordKey
        );

        if (!registry.owner.equals(publicKey)) {
          // Record was created before domain was transfered
          const ix = transferInstruction(
            NAME_PROGRAM_ID,
            recordKey,
            publicKey,
            registry.owner,
            undefined,
            parent,
            publicKey
          );
          ixs.push(ix);
        }

        // The size changed: delete + create to resize
        if (
          currentAccount.data.length - NameRegistryState.HEADER_LEN !==
          space
        ) {
          console.log("Resizing...");
          const ixClose = deleteInstruction(
            NAME_PROGRAM_ID,
            recordKey,
            publicKey,
            publicKey
          );
          const sig = await sendTx(
            connection,
            publicKey,
            [ixClose],
            signTransaction
          );
          console.log(sig);

          const lamports = await connection.getMinimumBalanceForRentExemption(
            space + NameRegistryState.HEADER_LEN
          );
          const ix = await createNameRegistry(
            connection,
            sub,
            space,
            publicKey,
            publicKey,
            lamports,
            undefined,
            parent
          );
          ixs.push(ix);
        }
      }

      const ix = updateInstruction(
        NAME_PROGRAM_ID,
        recordKey,
        new Numberu32(0),
        ser,
        publicKey
      );

      ixs.push(ix);

      // Handle bridge cases
      if (record === SNSRecord.BSC) {
        const ix = await post(
          ChainId.BSC,
          Network.Mainnet,
          domain,
          publicKey,
          1_000,
          recordKey
        );
        ixs.push(...ix);
      }
    }

    return ixs
  };

  const handleDelete = (records: SNSRecord[]) => {
    if (!publicKey) return [];

    const ixs: TransactionInstruction[] = [];

    for (const record of records) {
      const { pubkey } = getDomainKeySync(record + "." + domain, true);

      const ix = deleteInstruction(
        NAME_PROGRAM_ID,
        pubkey,
        publicKey,
        publicKey
      );

      ixs.push(ix)
    }

    return ixs
  };

  const saveForm = async () => {
    if (!isFormDirty) return;
    if (!connection || !publicKey || !signTransaction || !signMessage) return;

    try {
      const fieldsToUpdate: { record: SNSRecord; value: string; }[] = []
      const fieldsToDelete: SNSRecord[] = []

      for (const key of formState.keys()) {
        const stateValue: string = formState.get(key) as string
        const prevStateValue: string = previousFormState.get(key)

        if (stateValue !== prevStateValue) {
          // if new value is not nullish, it means it's a set or update action,
          // so we need to validate the value
          if (stateValue) {
            if (key === SNSRecord.Url) {
              try {
                new URL(stateValue);
              } catch (err) {
                setFormLoading(false);
                return openModal("Error", { msg: t`Invalid URL` });
              }
            } else if ([SNSRecord.BSC, SNSRecord.ETH].includes(key)) {
              const buffer = Buffer.from(stateValue.slice(2), "hex");
              if (!stateValue.startsWith("0x") || buffer.length !== 20) {
                setFormLoading(false);
                return openModal("Error", { msg: t`Invalid ${key} address` });
              }
            }
          }

          stateValue === ''
            ? fieldsToDelete.push(key)
            : fieldsToUpdate.push({ record: key, value: stateValue })
        }
      }

      const deleteInstructions = handleDelete(fieldsToDelete)
      const updateInstructions = await handleUpdate(fieldsToUpdate)

      if (!deleteInstructions.length && !updateInstructions.length) {
        resetForm();
        return;
      }

      await sendTx(connection, publicKey, [...deleteInstructions, ...updateInstructions], signTransaction);

      await sleep(400);

      resetForm();
      refresh();
    } catch (err) {
      console.error(err);
      setFormLoading(false);
      openModal("Error", { msg: t`Something went wrong - try again` });
    }
  }

  useEffect(() => {
    if (addressRecords.result && socialRecords.result) {
      dispatchFormChange({
        type: 'bulk',
        value: [...socialRecords.result, ...addressRecords.result].reduce((acc, v) => {
          acc.set(v.record, v.value || '');
          return acc;
        }, new Map())
      })
    }
  }, [addressRecords.loading, socialRecords.loading])

  useEffect(() => {
    setPreviousFormState(isEditing ? formState : null);
    if (!isEditing) setFormDirty(false)
  }, [isEditing])

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Screen style={tw`p-0`}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        {isTokenized && (
          <TouchableOpacity
            onPress={() => openModal("TokenizeModal", {
              refresh: () => domainInfo.execute(),
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
              <UiButton
                onPress={() =>
                  openModal("Transfer", {
                    domain,
                    refresh: () => domainInfo.execute(),
                  })
                }
                small
                content={t`Transfer`}
                style={tw`basis-1/2`}
              />
            )}
            {isOwner && (
              <>
                {isSubdomain ? (
                  // delete subdomain button
                  <UiButton
                    onPress={() =>
                      openModal("Delete", {
                        domain,
                        refresh: () => domainInfo.execute(),
                      })
                    }
                    small
                    danger
                    content={t`Delete`}
                  />
                ) : (
                  // wrap/unwrap button
                  <UiButton
                    onPress={() =>
                      openModal("TokenizeModal", {
                        domain,
                        isTokenized,
                        refresh: () => domainInfo.execute(),
                        isOwner,
                      })
                    }
                    small
                    content={isTokenized ? t`Unwrap NFT` : t`Wrap to NFT`}
                    style={tw`basis-1/2`}
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
                  disabled={isLoading}
                  textAdditionalStyles={tw`text-sm font-medium`}
                  onPress={() => {
                    isEditing ? discardChanges() : toggleEditMode(true)
                  }}
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

          <FlatList
            data={[...formState.keys()]}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  if (isEditing || !formState.get(item)) return
                  Clipboard.setString(String(formState.get(item)));
                  openModal("Success", { msg: t`Copied!` });
                }}
                activeOpacity={1}
              >
                <CustomTextInput
                  value={formState.get(item)}
                  placeholder={t`Not set`}
                  editable={isEditing && !isLoading}
                  style={tw`mt-4`}
                  label={
                    <View style={tw`flex flex-row items-center gap-1`}>
                      {/* TS is kinda stupid here so "any" is required */}
                      {SOCIAL_RECORDS.includes(item as any) && getIcon(item as any)}

                      <Text style={tw`text-content-secondary text-sm leading-6`}>
                        {getTranslatedName(item)}
                      </Text>
                    </View>
                  }
                  onChangeText={(text) => {
                    setFormDirty(true)
                    dispatchFormChange({
                      type: item,
                      value: text,
                    })
                  }}
                />
              </TouchableOpacity>
            )}
          />

          {!isTokenized && isOwner && (
            <View style={tw`mt-10`}>
              <UiButton
                disabled={isEditing && !isFormDirty}
                onPress={() => {
                  isEditing ? saveForm() : toggleEditMode(true)
                }}
                loading={isLoading}
                content={isEditing ? isFormDirty ? t`Save` : t`No changes to save` : t`Edit`}
              >
                {!isEditing && (
                  <MaterialIcons name="edit" size={16} color="white" style={tw`ml-2`} />
                )}
              </UiButton>
            </View>
          )}
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
                contentContainerStyle={tw`flex flex-col gap-3`}
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
