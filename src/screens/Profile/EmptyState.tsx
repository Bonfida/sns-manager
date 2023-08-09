import { View, Text } from "react-native";
import { Trans, t } from "@lingui/macro";
import { useNavigation } from "@react-navigation/native";

import { searchResultScreenProp } from "@src/types";

import tw from "@src/utils/tailwind";
import { abbreviate } from "@src/utils/abbreviate";

import { UiButton } from "@src/components/UiButton";

export const EmptyState = ({ owner }: { owner?: string }) => {
  const navigation = useNavigation<searchResultScreenProp>();

  return (
    <View
      style={tw`flex flex-col items-center justify-center w-full h-full mt-4`}
    >
      <View style={tw`w-full gap-4`}>
        <Text style={tw`text-lg font-bold text-center text-content-primary`}>
          <Trans>Turn this</Trans>
        </Text>

        <Text
          style={tw`px-2 py-1 mx-auto text-sm border bg-background-secondary text-content-secondary border-content-inactive-border rounded-xl`}
        >
          {abbreviate(owner, 30)}
        </Text>

        <Text style={tw`text-lg font-bold text-center text-content-primary`}>
          <Trans>Into this</Trans>
        </Text>

        <Text
          style={tw`px-2 py-1 mx-auto text-sm border bg-background-secondary text-content-secondary border-content-inactive-border rounded-xl`}
        >
          awesomedomain.sol
        </Text>
      </View>

      <View style={tw`w-full mt-10 text-center`}>
        <Text style={tw`text-sm leading-6 text-content-secondary`}>
          <Trans>
            Get a .sol domain and {"\n"}
            start building your profile
          </Trans>
        </Text>
      </View>

      <View style={tw`w-full mt-10`}>
        <UiButton
          onPress={() =>
            navigation.navigate("search-result", {
              domain: "",
              loadPopular: true,
            })
          }
          content={t`Secure a domain for yourself`}
        />
      </View>
    </View>
  );
};
