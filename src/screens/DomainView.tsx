import { useReducer, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  NativeScrollEvent,
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
  updateRecordV2Instruction,
  createRecordV2Instruction,
  getRecordV2Key,
  deleteRecordV2,
  Record,
  validateRecordV2Content,
  GUARDIANS,
  writRoaRecordV2,
} from "@bonfida/spl-name-service";
import { isMobile } from "@src/utils/platform";
import { TransactionInstruction } from "@solana/web3.js";
import Clipboard from "@react-native-clipboard/clipboard";
import { useModal } from "react-native-modalfy";
import { ChainId, Network, post } from "@bonfida/sns-emitter";
import { Trans, t } from "@lingui/macro";
import tw from "@src/utils/tailwind";
import { getTranslatedName } from "@src/utils/record/place-holder";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
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
import { DomainRowRecord } from "@src/components/DomainRowRecord";
import { ProfileBlock } from "@src/components/ProfileBlock";
import { UiButton } from "@src/components/UiButton";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { sendTx } from "@src/utils/send-tx";
import { sleep } from "@src/utils/sleep";
import { useHandleError } from "@src/hooks/useHandleError";
import { LoadingState } from "@src/screens/Profile/LoadingState";
import { RecordV2Badge } from "@src/components/RecordV2Badge";
import { sendRoaRequest } from "@src/hooks/useRecordsV2Guardians";
import { useProfilePic } from "@bonfida/sns-react";

const getIcon = (record: SocialRecord) => {
  const defaultIconAttrs = {
    size: 20,
    color: tw.color("content-secondary"),
  };
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
      return <MaterialIcons name="backpack" {...defaultIconAttrs} />;
    default:
      return null;
  }
};

type FormKeys = AddressRecord | SocialRecord;
type FormValue = { value: string | undefined; roa: boolean; stale: boolean };
// using Map to store correct order of fields
type FormState = Map<FormKeys, FormValue>;
type FormAction =
  | { type: FormKeys; value: FormValue }
  | { type: "bulk"; value: FormState };

const formReducer = (state: FormState, action: FormAction) => {
  if (action.type === "bulk") {
    return action.value;
  }

  const newState = new Map(state);
  newState.set(action.type, action.value);
  return newState;
};

export const DomainView = ({ domain }: { domain: string }) => {
  const { openModal } = useModal();
  const { setStatus } = useStatusModalContext();
  const connection = useSolanaConnection();
  const { handleError } = useHandleError();
  const socialRecords = useSocialRecords(domain);
  const addressRecords = useAddressRecords(domain);
  const domainInfo = useDomainInfo(domain);
  const subdomains = useSubdomains(domain);
  const picRecord = useProfilePic(connection!, domain);
  const { publicKey } = useWallet();

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
      socialRecords?.execute(),
      addressRecords?.execute(),
      picRecord.execute(),
      subdomains.execute(),
    ]);
  };

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [UISectionsCoordinates, setCoordinates] = useState({
    socials: 0,
    addresses: 0,
    subdomains: 0,
  });
  const [currentScrollViewData, setScrollViewMeasurements] =
    useState<NativeScrollEvent | null>(null);

  const { signTransaction, signMessage } = useWallet();
  const [isEditing, toggleEditMode] = useState(false);
  const [formState, dispatchFormChange] = useReducer(formReducer, new Map());
  // We store form dirtiness to disable/enable "Save" button
  const [isFormDirty, setFormDirty] = useState(false);
  const [previousFormState, setPreviousFormState] = useState<any>(null);
  const [isLoading, setFormLoading] = useState(false);

  const discardChanges = () => {
    if (isFormDirty) {
      dispatchFormChange({
        type: "bulk",
        value: new Map(previousFormState),
      });
    }
    toggleEditMode(false);
  };

  const resetForm = () => {
    setFormDirty(false);
    toggleEditMode(false);
    setPreviousFormState(null);
    setFormLoading(false);
  };

  const prepareUpdateInstructions = async (
    fields: { record: SNSRecord; value: string }[],
  ) => {
    if (!connection || !publicKey || !signTransaction || !signMessage)
      return [];

    const ixs: TransactionInstruction[] = [];

    for (const field of fields) {
      const { record, value } = field;
      const recordKey = getRecordV2Key(domain, record);
      const isRoaSupported = GUARDIANS.has(record);

      const currentAccount = await connection.getAccountInfo(recordKey);
      if (!currentAccount?.data) {
        const ix = createRecordV2Instruction(
          domain,
          record,
          value,
          publicKey,
          publicKey,
        );
        ixs.push(ix);
      } else {
        const ix = updateRecordV2Instruction(
          domain,
          record,
          value,
          publicKey,
          publicKey,
        );
        ixs.push(ix);
      }

      ixs.push(
        validateRecordV2Content(
          true,
          domain,
          record,
          publicKey,
          publicKey,
          publicKey,
        ),
      );

      /**
       * If eligible to RoA create write ix
       */

      if (isRoaSupported) {
        ixs.push(
          writRoaRecordV2(
            domain,
            record,
            publicKey,
            publicKey,
            GUARDIANS.get(record)!,
          ),
        );
      }

      // Handle bridge cases
      // TODO add Injective mainnet
      if (record === SNSRecord.BSC) {
        const ix = await post(
          ChainId.BSC,
          Network.Mainnet,
          domain,
          publicKey,
          1_000,
          recordKey,
        );
        ixs.push(...ix);
      }
    }

    return ixs;
  };

  const prepareDeleteInstructions = (records: SNSRecord[]) => {
    if (!publicKey) return [];

    const ixs: TransactionInstruction[] = [];
    for (const record of records) {
      const ix = deleteRecordV2(domain, record, publicKey, publicKey);
      ixs.push(ix);
    }

    return ixs;
  };

  const saveForm = async () => {
    if (!isFormDirty) return;
    if (!connection || !publicKey || !signTransaction || !signMessage) return;

    try {
      const fieldsToUpdate: { record: SNSRecord; value: string }[] = [];
      const fieldsToDelete: SNSRecord[] = [];

      for (const key of formState.keys()) {
        const stateValue = formState.get(key)?.value;
        const prevStateValue: string = previousFormState.get(key);

        if (stateValue !== prevStateValue) {
          // if new value is not nullish, it means it's a set or update action,
          // so we need to validate the value
          if (stateValue) {
            if (key === SNSRecord.Url) {
              try {
                new URL(stateValue);
              } catch (err) {
                setFormLoading(false);
                setStatus({ status: "error", message: t`Invalid URL` });
                return;
              }
            } else if ([SNSRecord.BSC, SNSRecord.ETH].includes(key)) {
              const buffer = Buffer.from(stateValue.slice(2), "hex");
              if (!stateValue.startsWith("0x") || buffer.length !== 20) {
                setFormLoading(false);
                setStatus({
                  status: "error",
                  message: t`Invalid ${key} address`,
                });
                return;
              }
            }
          }

          stateValue === ""
            ? fieldsToDelete.push(key)
            : stateValue
            ? fieldsToUpdate.push({ record: key, value: stateValue })
            : undefined;
        }
      }

      const deleteInstructions = prepareDeleteInstructions(fieldsToDelete);
      const updateInstructions = await prepareUpdateInstructions(
        fieldsToUpdate,
      );

      if (!deleteInstructions.length && !updateInstructions.length) {
        resetForm();
        return;
      }

      await sendTx(
        connection,
        publicKey,
        [...deleteInstructions, ...updateInstructions],
        signTransaction,
      );

      await sleep(400);

      for (let update of fieldsToUpdate) {
        if (GUARDIANS.has(update.record)) {
          await sendRoaRequest(domain, update.record);
        }
      }

      resetForm();
      refresh();
    } catch (err) {
      setFormLoading(false);
      handleError(err);
    }
  };

  useEffect(() => {
    if (addressRecords.result && socialRecords.result) {
      dispatchFormChange({
        type: "bulk",
        value: [...socialRecords.result, ...addressRecords.result].reduce(
          (acc, v) => {
            acc.set(v.record as FormKeys, {
              value: v.deserialized,
              roa: v.roa,
              stale: v.stale,
            });
            return acc;
          },
          new Map<FormKeys, FormValue>(),
        ),
      });
    }
  }, [addressRecords.loading, socialRecords.loading]);

  useEffect(() => {
    setPreviousFormState(isEditing ? formState : null);
    if (!isEditing) setFormDirty(false);
  }, [isEditing]);

  if (loading) {
    return (
      <Screen style={tw`p-0`}>
        <LoadingState />
      </Screen>
    );
  }

  const halfScrollViewHeight = currentScrollViewData
    ? currentScrollViewData.layoutMeasurement.height / 2
    : 0;
  const socialsTabBreakpoint =
    UISectionsCoordinates.addresses - halfScrollViewHeight;
  const subdomainBreakpoint =
    UISectionsCoordinates.subdomains - halfScrollViewHeight;

  const currentScrollPosition = currentScrollViewData?.contentOffset.y || 0;
  const scrollViewOffset = currentScrollViewData
    ? currentScrollViewData.contentSize.height -
      currentScrollViewData.layoutMeasurement.height
    : 0;

  const isSocialsTabHighlighted = currentScrollPosition <= socialsTabBreakpoint;

  const subdomainRowHeight = 40;
  // Make subdomain hightlighted if subdomains in the middle of the screen,
  // or if the subdomains block is too small, then when we near the bottom of the screen
  const isSubdomainsTabHighlighted =
    !isSocialsTabHighlighted &&
    (currentScrollPosition >= subdomainBreakpoint ||
      currentScrollPosition > scrollViewOffset - subdomainRowHeight);

  // To simplify, make addresses highlighted if other tabs are not highlighted
  const isAddressesTabHighlighted =
    !isSocialsTabHighlighted && !isSubdomainsTabHighlighted;

  return (
    <Screen style={tw`p-0`}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        stickyHeaderIndices={[isMobile ? 1 : 2]}
        ref={scrollViewRef}
        scrollEventThrottle={300}
        onScroll={(event) => {
          if (event.persist) event.persist();
          setScrollViewMeasurements(event.nativeEvent);
        }}
      >
        {isTokenized && (
          <TouchableOpacity
            onPress={() =>
              openModal("TokenizeModal", {
                refresh: () => domainInfo.execute(),
                domain,
                isTokenized,
                isOwner,
              })
            }
            style={tw`flex flex-row items-center justify-between px-3 py-1 mb-3 border rounded-lg border-brand-primary bg-brand-primary bg-opacity-10`}
          >
            <Text
              style={tw`flex flex-row gap-2 text-sm font-medium text-brand-primary`}
            >
              <MaterialCommunityIcons
                name="diamond-stone"
                size={24}
                color={tw.color("brand-primary")}
              />

              <Trans>This domain is wrapped in an NFT</Trans>
            </Text>

            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={tw.color("brand-primary")}
            />
          </TouchableOpacity>
        )}

        <View style={tw`mb-6`}>
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
                    />
                  )}
                </>
              )}
            </View>
          </ProfileBlock>
        </View>

        {/* This bars are sticky using stickyHeaderIndices */}
        {/* The `View` wrapper shouldn't not have `style` cause it will be ignored on mobile  */}
        <View>
          <View
            style={tw`flex flex-row items-center justify-between pb-2 bg-background-primary`}
          >
            <View style={tw`flex flex-row gap-2`}>
              <TouchableOpacity
                onPress={() => {
                  scrollViewRef.current?.scrollTo({
                    // -24 so there will be some space between header and field
                    y: UISectionsCoordinates.socials - 35,
                    animated: true,
                  });
                }}
                style={[
                  tw`px-2 py-1 rounded-xl`,
                  isSocialsTabHighlighted && tw`bg-background-secondary`,
                ]}
              >
                <Text style={tw`text-sm text-brand-primary`}>{t`Socials`}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  scrollViewRef.current?.scrollTo({
                    // -24 so there will be some space between header and field
                    y: UISectionsCoordinates.addresses - 24,
                    animated: true,
                  });
                }}
                style={[
                  tw`px-2 py-1 rounded-xl`,
                  isAddressesTabHighlighted && tw`bg-background-secondary`,
                ]}
              >
                <Text
                  style={tw`text-sm text-brand-primary`}
                >{t`Addresses`}</Text>
              </TouchableOpacity>
              {!isSubdomain && (
                <TouchableOpacity
                  onPress={() => {
                    scrollViewRef.current?.scrollTo({
                      y: UISectionsCoordinates.subdomains,
                      animated: true,
                    });
                  }}
                  style={[
                    tw`px-2 py-1 rounded-xl`,
                    isSubdomainsTabHighlighted && tw`bg-background-secondary`,
                  ]}
                >
                  <Text style={tw`text-sm text-brand-primary`}>
                    {t`Subdomains`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isTokenized && (
              <>
                {isOwner ? (
                  <UiButton
                    content={isEditing ? t`Revert` : t`Edit`}
                    small
                    outline={isEditing}
                    disabled={isLoading}
                    style={tw`grow-0`}
                    textAdditionalStyles={tw`text-sm font-medium`}
                    onPress={() => {
                      isEditing ? discardChanges() : toggleEditMode(true);
                    }}
                  >
                    {isEditing ? (
                      <Ionicons
                        name="close-outline"
                        size={16}
                        color={tw.color("brand-primary")}
                        style={tw`ml-2`}
                      />
                    ) : (
                      <MaterialIcons
                        name="edit"
                        size={16}
                        color="white"
                        style={tw`ml-2`}
                      />
                    )}
                  </UiButton>
                ) : (
                  <TouchableOpacity onPress={refresh}>
                    <EvilIcons
                      name="refresh"
                      size={24}
                      color={tw.color("content-secondary")}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {[...formState.keys()].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => {
              if (isEditing || !formState.get(item)) return;
              Clipboard.setString(String(formState.get(item)));
              setStatus({ status: "success", message: t`Copied!` });
            }}
            onLayout={(event) => {
              if (event.persist) event.persist();
              if (item === SNSRecord.Backpack) {
                setCoordinates((prevState) => ({
                  ...prevState,
                  socials: event.nativeEvent.layout.y,
                }));
              }
              if (item === SNSRecord.BSC) {
                setCoordinates((prevState) => ({
                  ...prevState,
                  addresses: event.nativeEvent.layout.y,
                }));
              }
            }}
            activeOpacity={1}
          >
            <CustomTextInput
              value={formState.get(item)?.value}
              placeholder={t`Not set`}
              editable={isEditing && !isLoading}
              style={tw`mt-4`}
              label={
                <View style={tw`flex flex-row items-center gap-1`}>
                  {/* TS is kinda stupid here so "any" is required */}
                  {SOCIAL_RECORDS.includes(item as any) && getIcon(item as any)}

                  <Text style={tw`text-sm leading-6 text-content-secondary`}>
                    {getTranslatedName(item)}
                  </Text>
                  <RecordV2Badge
                    record={item as Record}
                    recordDefined={formState.get(item)?.value !== undefined}
                    stale={!!formState.get(item)?.stale}
                    roa={!!formState.get(item)?.roa}
                  />
                </View>
              }
              onChangeText={(text) => {
                setFormDirty(true);
                dispatchFormChange({
                  type: item,
                  value: { value: text, roa: false, stale: true },
                });
              }}
            />
          </TouchableOpacity>
        ))}

        {!isTokenized && isOwner && (
          <View
            style={[
              tw`mt-10 bg-background-primary`,
              // TODO: realize how to implement that on mobile
              Platform.OS === "web" &&
                isEditing && {
                  position: "sticky",
                  bottom: "0px",
                },
            ]}
          >
            <UiButton
              disabled={isEditing && !isFormDirty}
              onPress={() => {
                isEditing ? saveForm() : toggleEditMode(true);
              }}
              loading={isLoading}
              content={
                isEditing
                  ? isFormDirty
                    ? t`Save`
                    : t`No changes to save`
                  : t`Edit`
              }
            >
              {!isEditing && (
                <MaterialIcons
                  name="edit"
                  size={16}
                  color="white"
                  style={tw`ml-2`}
                />
              )}
            </UiButton>
          </View>
        )}

        {!isSubdomain && (
          <View
            style={tw`flex flex-col justify-around px-4 py-3 mt-10 bg-background-secondary rounded-xl`}
            onLayout={(event) => {
              if (event.persist) event.persist();
              setCoordinates((prevState) => ({
                ...prevState,
                subdomains: event.nativeEvent.layout.y,
              }));
            }}
          >
            {isOwner && (
              <>
                <View style={tw`flex flex-row justify-end`}>
                  <TouchableOpacity
                    onPress={() =>
                      openModal("CreateSubdomain", { refresh, domain })
                    }
                    disabled={isTokenized}
                  >
                    <Text
                      style={[
                        tw`flex flex-row justify-end gap-2 text-base text-brand-primary`,
                        isTokenized && tw`text-[#A3A4B8]`,
                      ]}
                    >
                      <Trans>Add subdomain</Trans>

                      <Entypo name="plus" size={24} />
                    </Text>
                  </TouchableOpacity>
                </View>

                {isTokenized && (
                  <Text
                    style={tw`text-sm text-content-secondary rounded-lg bg-[#F3F3F3] p-2 mt-4`}
                  >
                    <Trans>
                      You can only add subdomains when the domain is unwrapped.
                    </Trans>
                  </Text>
                )}
              </>
            )}

            {hasSubdomain ? (
              <FlatList
                data={subdomains.result}
                style={isOwner && tw`mt-4`}
                scrollEnabled={false}
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
              <Text style={tw`mt-4 text-sm text-content-secondary`}>
                {isOwner ? (
                  <Trans>
                    You don’t have any subdomains yet. You can create as many as
                    you want to use your profiles for different purposes.
                  </Trans>
                ) : (
                  <Trans>There are no subdomains.</Trans>
                )}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};
