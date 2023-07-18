import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import tw from "../utils/tailwind";
import { useState } from "react";
import { Screen } from "../components/Screen";
import { useNavigation } from "@react-navigation/native";
import { profileScreenProp, searchResultScreenProp, NavigatorTabsParamList } from "@src/types";
import { trimTld, validate } from "../utils/validate";
import { useModal } from "react-native-modalfy";
import { isPubkey } from "../utils/publickey";
import { Trans, t } from "@lingui/macro";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { SearchResult } from "./SearchResult";
import { DomainView } from "./DomainView";
import { ProfileScreen } from "./Profile";

require("@solana/wallet-adapter-react-ui/styles.css");

require("@solana/wallet-adapter-react-ui/styles.css");

const Stack = createStackNavigator<NavigatorTabsParamList>();

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
        <Text style={tw`px-10 mt-5 text-sm text-center text-content-secondary`}>
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
      <View
        style={tw`flex flex-row h-[71px] justify-center w-full items-center border-[1px] border-black/10 rounded-lg`}
      >
        <TextInput
          style={[
            Platform.OS === "web" && { outlineWidth: 0 },
            tw`w-70% bg-white h-full rounded-l-lg pl-5 font-semibold shadow-xl shadow-blue-900`,
          ]}
          onChangeText={(newText) => setSearch(newText)}
          value={search}
          placeholder={t({ message: "Search for your name.sol" })}
          placeholderTextColor="#BCCCDC"
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Enter") {
              handle();
            }
          }}
        />

        <TouchableOpacity
          onPress={handle}
          style={tw`bg-blue-900 w-[30%] h-[72px] rounded-tr-lg rounded-br-lg flex items-center justify-center`}
        >
          <Text style={tw`text-lg font-bold text-white`}>
            <Trans>Search</Trans>
          </Text>
        </TouchableOpacity>
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
        },
        headerTintColor: tw.color('brand-primary'),
        headerTitleStyle: tw`text-content-primary text-medium`
      }}
      initialRouteName={"home-root"}
    >
      <Stack.Screen
        name="home-root"
        component={HomeRoot}
        options={{
          title: t`Search domain`,
          header: () => (
            <View style={tw`absolute top-2 left-2`}>
              <TouchableOpacity
                onPress={() => openModal("LanguageModal")}
                style={tw`flex flex-row items-center p-1`}
              >
                <Ionicons
                  name="language"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
          ),
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
