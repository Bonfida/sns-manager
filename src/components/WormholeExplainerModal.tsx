import { View, Text } from "react-native";
import tw from "../utils/tailwind";
import { Feather } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

export const WormholeExplainerModal = () => {
  return (
    <View
      style={tw`bg-white w-[300px] h-full flex flex-col items-center justify-center rounded-lg px-4 py-10`}
    >
      <Feather name="check-circle" size={40} color="#22c55e" />
      <Text style={tw`mt-4 font-bold text-center text-blue-grey-900`}>
        <Trans>
          This domain has been bridged via Wormhole and is available on BNB
        </Trans>
      </Text>
    </View>
  );
};
