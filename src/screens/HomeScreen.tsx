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
import { profileScreenProp, searchResultScreenProp } from "../../types";
import { trimTld, validate } from "../utils/validate";
import { useModal } from "react-native-modalfy";
import { isPubkey } from "../utils/publickey";
import { Trans, t } from "@lingui/macro";

require("@solana/wallet-adapter-react-ui/styles.css");

export function HomeScreen() {
  const { openModal } = useModal();
  const [search, setSearch] = useState("");
  const navigation = useNavigation<
    searchResultScreenProp | profileScreenProp
  >();

  const handle = async () => {
    if (!search) return;
    if (isPubkey(search)) {
      return navigation.navigate("Search", {
        screen: "Search Profile",
        params: { owner: search },
      });
    }
    if (!validate(search)) {
      return openModal("Error", {
        msg: t`${search}.sol is not a valid domain`,
      });
    }
    navigation.navigate("Search", {
      screen: "Search Result",
      params: { domain: trimTld(search) },
    });
  };

  return (
    <Screen style={tw`flex flex-col items-center justify-center`}>
      <View style={tw`mb-4`}>
        <Image
          resizeMode="contain"
          style={tw`w-[150px] h-[150px]`}
          source={require("../../assets/fida.svg")}
        />
      </View>
      <Text style={tw`text-3xl font-bold text-center text-blue-grey-900`}>
        <Trans>
          Your <Text style={tw`text-blue-700 underline`}>Name</Text>. Your{" "}
          <Text style={tw`text-blue-700 underline`}>Power</Text>.
        </Trans>
      </Text>
      <Text style={tw`px-10 my-5 text-sm text-center text-blue-grey-500`}>
        <Trans>Seize your online identity.</Trans>
      </Text>
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
  );
}
