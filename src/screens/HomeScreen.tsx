import { Text, View, Image } from "react-native";
import tw from "@src/utils/tailwind";
import { useState } from "react";
import { Screen } from "@src/components/Screen";
import { useNavigation } from "@react-navigation/native";
import {
  profileScreenProp,
  searchResultScreenProp,
  NavigatorTabsParamList,
} from "@src/types";
import { trimTld, validate } from "@src/utils/validate";
import { isPubkey } from "@src/utils/publickey";
import { abbreviate } from "@src/utils/abbreviate";
import { Trans, t } from "@lingui/macro";
import { createStackNavigator } from "@react-navigation/stack";
import { SearchResult } from "./SearchResult";
import { DomainView } from "./DomainView";
import { ProfileScreen } from "./Profile";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { UiButton } from "@src/components/UiButton";
import { LanguageHeader } from "@src/components/Header";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";

require("@solana/wallet-adapter-react-ui/styles.css");

const Stack = createStackNavigator<NavigatorTabsParamList>();

const domainProsTranslations = [
  <Trans>Unique domain name for your project</Trans>,
  <Trans>Human-readable address</Trans>,
  <Trans>Collect & Exchange directly or as NFTs!</Trans>,
];

function HomeRoot() {
  const { setStatus } = useStatusModalContext();
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
      return setStatus({
        status: "error",
        message: t`${search}.sol is not a valid domain`,
      });
    }
    navigation.navigate("Home", {
      screen: "search-result",
      params: { domain: trimTld(search) },
    });
  };

  return (
    <Screen style={tw`relative flex flex-col items-center justify-center`}>
      <View style={tw`mb-10`}>
        <Text style={tw`text-3xl font-bold text-center text-blue-grey-900`}>
          <Trans>A Humanized ID for the Metaverse</Trans>
        </Text>
        <Text style={tw`px-2 mt-5 text-sm text-center text-content-secondary`}>
          <Trans>
            Your online identity starts with your{" "}
            <Text
              style={[
                {
                  backgroundClip: "text",
                  backgroundImage: `linear-gradient(to right, ${tw.color(
                    "brand-primary"
                  )}, ${tw.color("brand-accent")})`,
                },
                tw`font-medium text-transparent`,
              ]}
            >
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
            style={tw`flex flex-row items-center justify-center gap-x-1`}
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
  );
}

export function HomeScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: tw.color("background-primary"),
          borderBottomWidth: 0,
          height: 52,
        },
        headerTintColor: tw.color("brand-primary"),
        headerTitleStyle: tw`font-medium text-content-primary`,
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
        children={({ route }) => (
          <SearchResult
            domain={route.params?.domain}
            loadPopular={route.params?.loadPopular}
          />
        )}
        options={{ title: t`Search domain` }}
      />
      <Stack.Screen
        name="domain-view"
        children={({ route }) => <DomainView domain={route.params?.domain} />}
        options={({ route }) => ({ title: `${route.params?.domain}.sol` })}
      />
      <Stack.Screen
        name="search-profile"
        children={({ route }) => <ProfileScreen owner={route.params.owner} />}
        options={({ route }) => ({ title: abbreviate(route.params.owner, 25) })}
      />
    </Stack.Navigator>
  );
}
