import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "../utils/tailwind";
import {
  EVM_RECORDS,
  SocialRecord,
  useAddressRecords,
  useSocialRecords,
} from "../hooks/useRecords";
import { NameRegistryState, Record } from "@bonfida/spl-name-service";
import { Feather } from "@expo/vector-icons";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import SkeletonContent from "react-native-skeleton-content";
import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "../../types";
import { useModal } from "react-native-modalfy";
import { SocialRecordCard } from "../components/SocialRecord";
import { FontAwesome } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { abbreviate } from "../utils/abbreviate";
import { useDomainInfo } from "../hooks/useDomainInfo";
import { useProfilePic } from "@bonfida/sns-react";
import { Trans } from "@lingui/macro";
import { useWallet } from "../hooks/useWallet";

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

export const DomainView = ({ domain }: { domain: string }) => {
  const { openModal } = useModal();
  const connection = useSolanaConnection();
  const socialRecords = useSocialRecords(domain);
  const addressRecords = useAddressRecords(domain);
  const domainInfo = useDomainInfo(domain);
  const picRecord = useProfilePic(connection!, domain);
  const { publicKey } = useWallet();
  const navigation = useNavigation<profileScreenProp>();

  const isOwner = domainInfo.result?.owner === publicKey?.toBase58();

  const loading =
    socialRecords.loading ||
    addressRecords.loading ||
    domainInfo.loading ||
    picRecord.loading;

  const refresh = async () => {
    await Promise.allSettled([
      domainInfo.execute(),
      socialRecords.execute(),
      addressRecords.execute(),
      picRecord.execute(),
    ]);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Screen style={tw`p-0`}>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <View
          style={tw`flex px-4 py-4 flex-row items-center my-5 bg-blue-grey-100/50`}
        >
          <View style={tw`relative`}>
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
                    domain,
                    refresh,
                  })
                }
                style={tw`h-[24px] w-[24px] rounded-full flex items-center justify-center absolute bottom-[-2px] right-[-2px] bg-blue-900`}
              >
                <Feather name="edit-2" size={12} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <View style={tw`w-full`}>
            <Text style={tw`font-bold text-xl ml-4 max-w-[65%]`}>
              {domain}.sol
            </Text>
            <View style={tw`flex flex-row items-center`}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Search Profile", {
                    owner: domainInfo.result?.owner as string,
                  })
                }
              >
                <Text style={tw`text-xs text-blue-grey-800 ml-4 mr-1`}>
                  {abbreviate(domainInfo.result?.owner, 18)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(domainInfo.result?.owner!);
                  openModal("Success", { msg: "Copied!" });
                }}
              >
                <Feather name="copy" size={12} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={tw`px-4`}>
          <View style={tw`flex flex-row items-center w-full justify-between`}>
            <Text style={tw`text-xl font-bold text-blue-grey-900 mb-1`}>
              <Trans>Socials</Trans>
            </Text>

            <TouchableOpacity onPress={refresh}>
              <FontAwesome name="refresh" size={20} color="black" />
            </TouchableOpacity>
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
                refresh={refresh}
              />
            )}
          />

          {/* Transfer button */}
          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                openModal("Transfer", {
                  domain,
                  refresh: async () => {
                    await domainInfo.execute();
                  },
                })
              }
              style={tw`flex flex-row justify-center items-center w-full bg-blue-900 rounded-lg h-[50px] mb-2`}
            >
              <Text style={tw`text-white font-bold text-xl mr-3`}>
                <Trans>Transfer</Trans>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const format = (data: Buffer | undefined, record: Record) => {
  if (!data) return { des: undefined, display: undefined };
  if (EVM_RECORDS.includes(record)) {
    const des = data?.toString("hex");
    return { des: "0x" + des, display: abbreviate("0x" + des, 20) };
  }
  const des = data?.toString("ascii");
  return { des, display: des };
};

const RenderRecord = ({
  record,
  value,
  isOwner,
  domain,
  refresh,
}: {
  record: Record;
  value: NameRegistryState | undefined;
  isOwner?: boolean;
  domain: string;
  refresh: () => Promise<void>;
}) => {
  const { openModal } = useModal();
  const { des, display } = format(value?.data, record);
  const worm = !!des && record === Record.BSC;

  return (
    <View
      style={tw`border-b-[1px] flex flex-row items-center justify-between px-4 py-2 w-full h-[60px] border-black/20`}
    >
      <View style={tw`flex flex-row items-center`}>
        {/* Record title & content */}
        <View style={tw`flex flex-col items-start justify-start`}>
          <Text style={tw`font-bold text-blue-900 capitalize`}>{record}</Text>
          {!!des ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  openModal("Success", { msg: "Copied!" });
                  Clipboard.setString(des);
                }}
              >
                <Text style={tw`text-sm font-bold`}>{display}</Text>
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
              source={require("../../assets/wormhole.svg")}
            />
          </TouchableOpacity>
        )}
        {isOwner && (
          <TouchableOpacity
            onPress={() =>
              openModal("EditRecordModal", {
                record,
                currentValue: des,
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
