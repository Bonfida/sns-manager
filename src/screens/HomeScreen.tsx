import {
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import tw from "@src/utils/tailwind";
import { useState } from "react";
import { Screen } from "@src/components/Screen";
import { useNavigation } from "@react-navigation/native";
import { profileScreenProp, searchResultScreenProp, NavigatorTabsParamList } from "@src/types";
import { trimTld, validate } from "@src/utils/validate";
import { useModal } from "react-native-modalfy";
import { isPubkey } from "@src/utils/publickey";
import { Trans, t } from "@lingui/macro";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { SearchResult } from "./SearchResult";
import { DomainView } from "./DomainView";
import { ProfileScreen } from "./Profile";
import { CustomTextInput } from '@src/components/CustomTextInput';
import { UiButton } from '@src/components/UiButton';
import { LanguageHeader } from '@src/components/Header';

require("@solana/wallet-adapter-react-ui/styles.css");

require("@solana/wallet-adapter-react-ui/styles.css");

const Stack = createStackNavigator<NavigatorTabsParamList>();

const domainProsTranslations = [
  t`Unique domain name for your project`,
  t`Human-readable address`,
  t`Collect & Exchange directly or as NFTs!`
]

function HomeRoot() {
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const navigation = useNavigation<
    searchResultScreenProp | profileScreenProp
  >();

  const handle = async () => {
    if (!search) return;
    if (isPubkey(search)) {
      return navigation.navigate("Home", {
        screen: "search-profile",
        params: { owner: search },
      });
    }
    if (!validate(search)) {
      return openModal("Error", {
        msg: t`${search}.sol is not a valid domain`,
      });
    }
    navigation.navigate("Home", {
      screen: "search-result",
      params: { domain: trimTld(search) },
    });
  };

  return (
    <Screen
      style={tw`flex flex-col items-center justify-center relative`}
    >
      <View style={tw`mb-10`}>
        <Text style={tw`text-3xl font-bold text-center text-blue-grey-900`}>
          <Trans>
            A Humanized ID for the Metaverse
          </Trans>
        </Text>
        <Text style={tw`px-2 mt-5 text-sm text-center text-content-secondary`}>
          <Trans>
            Your online identity starts with your{' '}
            <Text style={[
              { backgroundClip: 'text', backgroundImage: `linear-gradient(to right, ${tw.color('brand-primary')}, ${tw.color('brand-accent')})` },
              tw`text-transparent font-medium`,
            ]}>
              .sol domain
            </Text>
          </Trans>
        </Text>
      </View>
      <CustomTextInput
        onChangeText={(newText) => setSearch(newText)}
        value={search}
        placeholder={t`Search for a domain`}
        type="search"
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Enter") {
            handle();
          }
        }}
      />
      <View style={tw`mt-4 w-[100%]`}>
        <UiButton
          onPress={handle}
          disabled={!search}
          content={t`Search your .SOL domain`}
        />
      </View>

      <View style={tw`mt-10 gap-y-3`}>
        {domainProsTranslations.map((pros, i) => (
          <View
            key={i}
            style={tw`flex items-center justify-center flex-row gap-x-1`}
          >
            <Image
              style={tw`h-[15px] w-[15px]`}
              source={require("@assets/icons/checkmark.svg")}
            />
            <Text style={tw`text-sm text-content-secondary`}>{pros}</Text>
          </View>
        ))}
      </View>
    </Screen>
  )
}

export function HomeScreen() {
  const { openModal } = useModal();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: tw.color('background-primary'),
          borderBottomWidth: 0,
          height: 52,
        },
        headerTintColor: tw.color('brand-primary'),
        headerTitleStyle: tw`text-content-primary font-medium`
      }}
      initialRouteName={"home-root"}
    >
      <Stack.Screen
        name="home-root"
        component={HomeRoot}
        options={{
          title: t`Search domain`,
          header: () => <LanguageHeader />,
        }}
      />
      <Stack.Screen
        name="search-result"
        children={({ route }) => <SearchResult domain={route.params?.domain} />}
        options={{ title: t`Search domain` }}
      />
      <Stack.Screen
        name="domain-view"
        children={({ route }) => <DomainView domain={route.params?.domain} />}
        options={{ title: t`Domain` }}
      />
      <Stack.Screen
        name="search-profile"
        children={({ route }) => <ProfileScreen owner={route.params.owner} />}
      />
    </Stack.Navigator>
  );
}
