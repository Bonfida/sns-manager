import { Text } from "react-native";
import { Trans } from "@lingui/macro";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import tw from "@src/utils/tailwind";

export const ActionWarning = ({ actionName }: { actionName: string }) => {
  return (
    <Text style={tw`mt-4 text-xs`}>
      <MaterialCommunityIcons
        name="information-outline"
        size={16}
        style={tw`mr-1`}
        color={tw.color("content-warning")}
      />
      <Trans>
        By clicking "{actionName}" you will be asked for a confirmation by your
        wallet
      </Trans>
    </Text>
  );
};
