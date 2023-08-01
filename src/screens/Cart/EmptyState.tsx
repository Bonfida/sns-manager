import { useRecoilState } from "recoil";
import { Text, View } from "react-native";
import { t } from "@lingui/macro";
import { useNavigation } from "@react-navigation/native";

import { searchResultScreenProp } from "@src/types";
import tw from "@src/utils/tailwind";

import { Screen } from "@src/components/Screen";
import { UiButton } from "@src/components/UiButton";

export const EmptyState = () => {
  const navigation = useNavigation<searchResultScreenProp>();

  return (
    <Screen>
      <View style={tw`mt-20`}>
        <Text
          style={tw`mb-6 text-lg font-bold text-center text-content-primary`}
        >
          {t`Nothing in your cart yet`}
        </Text>
        <Text
          style={tw`text-sm font-medium text-center text-content-secondary`}
        >
          {t`Discover the domain that represents you!`}
        </Text>

        <UiButton
          onPress={() =>
            navigation.navigate("search-result", {
              domain: "",
              loadPopular: true,
            })
          }
          content={t`Secure a domain for yourself`}
          style={tw`mt-10`}
        />
      </View>
    </Screen>
  );
};
