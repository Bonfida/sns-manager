import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
} from "react-native";
import tw from "../utils/tailwind";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { AvailableRow } from "../components/AvailableRow";
import { UnavailableRow } from "../components/UnavailableRow";
import { useSearch } from "../hooks/useSearch";
import SkeletonContent from "react-native-skeleton-content";
import { Screen } from "../components/Screen";
import { trimTld, validate } from "../utils/validate";
import { useModal } from "react-native-modalfy";
import { isPubkey } from "../utils/publickey";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "../../types";
import { t } from "@lingui/macro";

export const SearchResult = ({ domain }: { domain: string }) => {
  const { openModal, currentModal } = useModal();
  const [search, setSearch] = useState(domain || "");
  const [input, setInput] = useState(domain || "");
  const results = useSearch(search);
  const navigation = useNavigation<profileScreenProp>();
  const isFocused = useIsFocused();

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    setSearch(domain || search);
    setInput(domain || search);
  }, [domain, isFocused]);

  const handle = async () => {
    if (!input) return;
    if (isPubkey(input)) {
      return navigation.navigate("Search", {
        screen: "Search Profile",
        params: { owner: input },
      });
    }
    if (!validate(input)) {
      return openModal("Error", { msg: t`${input}.sol is not a valid domain` });
    }
    setSearch(trimTld(input));
  };

  return (
    <Screen>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        style={tw`px-4 mt-${isWeb ? 10 : 4}`}
      >
        <View
          style={tw`flex flex-row h-[55px] justify-center w-full items-center border-[1px] border-black/10 rounded-lg`}
        >
          <TextInput
            style={[
              tw`w-full h-full pl-5 font-semibold bg-white border-0 rounded-l-lg shadow-xl shadow-blue-900`,
              Platform.OS === "web" && { outlineWidth: 0 },
            ]}
            onChangeText={(newText) => setInput(newText)}
            value={input}
            placeholder={t`Search for your name.sol`}
            placeholderTextColor="#BCCCDC"
            editable={currentModal !== "Error"}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === "Enter") {
                handle();
              }
            }}
          />
          <TouchableOpacity
            onPress={() => setInput("")}
            style={tw`flex flex-col items-center justify-center h-full px-3 bg-white `}
          >
            <Feather name="x" size={16} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handle}
            style={[
              tw`bg-blue-900 h-[55px] rounded-tr-lg rounded-br-lg flex items-center justify-center`,
              { width: "calc(30% - 40px)", maxWidth: 300, minWidth: 50 },
            ]}
          >
            <Feather name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={tw`mt-3`}>
          {results.loading ? (
            <SkeletonContent isLoading>
              <View style={tw`w-full h-[60px] my-1 rounded-lg`} />
              <View style={tw`w-full h-[60px] my-1 rounded-lg`} />
              <View style={tw`w-full h-[60px] my-1 rounded-lg`} />
              <View style={tw`w-full h-[60px] my-1 rounded-lg`} />
              <View style={tw`w-full h-[60px] my-1 rounded-lg`} />
              <View style={tw`w-full h-[60px] my-1 rounded-lg`} />
            </SkeletonContent>
          ) : (
            <FlatList
              data={results.result}
              renderItem={({ item }) => (
                <RenderRow domain={item.domain} available={item.available} />
              )}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const RenderRow = ({
  domain,
  available,
}: {
  domain: string;
  available: boolean;
}) => {
  return available ? (
    <AvailableRow domain={domain} />
  ) : (
    <UnavailableRow domain={domain} />
  );
};
