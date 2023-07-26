import { Record } from "@bonfida/spl-name-service";
import { SocialRecord } from "@src/hooks/useRecords";
import {
  Feather,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Text, View, TouchableOpacity } from "react-native";
import tw from "@src/utils/tailwind";
import { useModal } from "react-native-modalfy";
import Clipboard from "@react-native-clipboard/clipboard";
import { Trans, t } from "@lingui/macro";
import { getTranslatedName } from "../utils/record/place-holder";

export const getIcon = (record: SocialRecord) => {
  const defaultIconAttrs = {
    size: 20,
    color: tw.color('content-secondary'),
  }
  switch (record) {
    case Record.Discord:
      return <FontAwesome5 name="discord" {...defaultIconAttrs} />;
    case Record.Email:
      return <MaterialIcons name="email" {...defaultIconAttrs} />;
    case Record.Github:
      return <AntDesign name="github" {...defaultIconAttrs} />;
    case Record.Reddit:
      return <FontAwesome5 name="reddit" {...defaultIconAttrs} />;
    case Record.Telegram:
      return <FontAwesome5 name="telegram" {...defaultIconAttrs} />;
    case Record.Twitter:
      return <FontAwesome5 name="twitter" {...defaultIconAttrs} />;
    case Record.Url:
      return <MaterialCommunityIcons name="web" {...defaultIconAttrs} />;
    case Record.Backpack:
      return (
        <MaterialIcons name="backpack" {...defaultIconAttrs} />
      );
    default:
      return null;
  }
};

export const SocialRecordCard = ({
  domain,
  currentValue,
  record,
  refresh,
  isOwner,
  isTokenized,
}: {
  domain: string;
  currentValue?: string;
  record: SocialRecord;
  refresh: () => Promise<void>;
  isOwner?: boolean;
  isTokenized?: boolean;
}) => {
  const { openModal } = useModal();

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
          {currentValue ? (
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(currentValue);
                openModal("Success", { msg: t`Copied!` });
              }}
            >
              <Text style={tw`text-sm font-bold`}>{currentValue}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={tw`text-sm font-bold text-blue-grey-400`}>
              <Trans>Not set</Trans>
            </Text>
          )}
        </View>
      </View>

      {/* Edit button (if owner) */}
      {isOwner && !isTokenized && (
        <View>
          <TouchableOpacity
            onPress={() =>
              openModal("EditRecordModal", {
                record,
                currentValue: currentValue,
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
