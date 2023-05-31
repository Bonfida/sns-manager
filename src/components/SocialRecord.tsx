import { NameRegistryState, Record } from "@bonfida/spl-name-service";
import { SocialRecord } from "../hooks/useRecords";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { useModal } from "react-native-modalfy";
import Clipboard from "@react-native-clipboard/clipboard";
import { Feather } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { getTranslatedName } from "../utils/record/place-holder";

export const getIcon = (record: SocialRecord) => {
  switch (record) {
    case Record.Discord:
      return <FontAwesome5 name="discord" size={22} color="black" />;
    case Record.Email:
      return <Entypo name="email" size={22} color="black" />;
    case Record.Github:
      return <AntDesign name="github" size={22} color="black" />;
    case Record.Reddit:
      return <FontAwesome5 name="reddit" size={22} color="black" />;
    case Record.Telegram:
      return <FontAwesome5 name="telegram" size={22} color="black" />;
    case Record.Twitter:
      return <FontAwesome5 name="twitter" size={22} color="black" />;
    case Record.Url:
      return <MaterialCommunityIcons name="web" size={22} color="black" />;
    case Record.Backpack:
      return (
        <MaterialCommunityIcons name="bag-personal" size={22} color="black" />
      );
    default:
      throw new Error("Unreachable!");
  }
};

export const SocialRecordCard = ({
  domain,
  currentValue,
  record,
  refresh,
  isOwner,
}: {
  domain: string;
  currentValue?: NameRegistryState;
  record: SocialRecord;
  refresh: () => Promise<void>;
  isOwner?: boolean;
}) => {
  const { openModal } = useModal();
  const des = currentValue?.data?.toString("ascii");

  return (
    <View
      style={tw`border-b-[1px] flex flex-row items-center justify-between px-4 py-2 w-full h-[60px] border-black/20`}
    >
      <View style={tw`flex flex-row items-center`}>
        {/* Icon */}
        <View style={tw`mr-3`}>{getIcon(record)}</View>

        {/* Record title & content */}
        <View style={tw`flex flex-col items-start justify-start`}>
          <Text style={tw`font-bold text-blue-900 capitalize`}>
            {getTranslatedName(record)}
          </Text>
          {des ? (
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(des);
                openModal("Success", { msg: t`Copied!` });
              }}
            >
              <Text style={tw`text-sm font-bold`}>{des}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={tw`text-sm font-bold text-blue-grey-400`}>
              <Trans>Not set</Trans>
            </Text>
          )}
        </View>
      </View>

      {/* Edit button (if owner) */}
      {isOwner && (
        <View>
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
        </View>
      )}
    </View>
  );
};
