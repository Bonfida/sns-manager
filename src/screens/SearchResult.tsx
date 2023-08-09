import { View, FlatList, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import SkeletonContent from "react-native-skeleton-content";
import { useModal } from "react-native-modalfy";
import { t } from "@lingui/macro";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "@src/types";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import tw from "@src/utils/tailwind";
import { trimTld, validate } from "@src/utils/validate";
import { isPubkey } from "@src/utils/publickey";
import { useSearch } from "@src/hooks/useSearch";
import { useDomainSuggestions } from "@src/hooks/useDomainSuggestions";
import { useTopDomainsSales } from "@src/hooks/useTopDomainsSales";
import { Screen } from "@src/components/Screen";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { UiButton } from "@src/components/UiButton";
import { DomainSearchResultRow } from "@src/components/DomainSearchResultRow";

export const SearchResult = ({
  domain,
  loadPopular = false,
}: {
  domain: string;
  loadPopular?: boolean;
}) => {
  const { currentModal } = useModal();
  const { setStatus } = useStatusModalContext();
  const [search, setSearch] = useState(domain || "");
  const [input, setInput] = useState(domain || "");
  const results = useSearch(search);
  const suggestions = useDomainSuggestions(search);
  const navigation = useNavigation<profileScreenProp>();
  const isFocused = useIsFocused();
  const topDomainsSales = useTopDomainsSales(loadPopular);
  const [showPopularDomains, togglePopularDomains] = useState(loadPopular);

  useEffect(() => {
    setSearch(domain || search);
    setInput(domain || search);
  }, [domain, isFocused]);

  const handle = async () => {
    if (!input) return;
    togglePopularDomains(false);
    if (isPubkey(input)) {
      return navigation.navigate("Home", {
        screen: "search-profile",
        params: { owner: input },
      });
    }
    if (!validate(input)) {
      return setStatus({
        status: "error",
        message: t`${input}.sol is not a valid domain`,
      });
    }
    setSearch(trimTld(input));
  };

  return (
    <Screen>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <CustomTextInput
          onChangeText={(newText) => setInput(newText)}
          value={input}
          placeholder={t`Search for a domain`}
          type="search"
          editable={currentModal !== "Error"}
          onKeyPress={(e) => {
            if (e.nativeEvent.key === "Enter") {
              handle();
            }
          }}
        />
        <View style={tw`mt-4 w-[100%]`}>
          <UiButton
            onPress={handle}
            disabled={!input}
            content={t`Search your .SOL domain`}
          />
        </View>

        <View style={tw`mt-3`}>
          {showPopularDomains && topDomainsSales ? (
            <>
              {topDomainsSales.loading && <RenderSkeleton />}
              {!topDomainsSales.loading && (
                <FlatList
                  data={topDomainsSales.result}
                  renderItem={({ item }) => (
                    <DomainSearchResultRow
                      domain={item.domain}
                      price={item.price}
                      available={false}
                    />
                  )}
                />
              )}
            </>
          ) : (
            <>
              {results.loading && suggestions.loading && (
                <View>
                  {/* not sure why but need to wrap into View. otherwise layout will break */}
                  <RenderSkeleton />
                </View>
              )}

              {!results.loading && results.result && suggestions.loading ? (
                <>
                  <DomainSearchResultRow
                    domain={results.result![0].domain}
                    available={results.result![0].available}
                  />
                  <RenderSkeleton />
                </>
              ) : (
                <FlatList
                  data={results.result?.concat(suggestions.result || [])}
                  renderItem={({ item }) => (
                    <DomainSearchResultRow
                      domain={item.domain}
                      available={item.available}
                    />
                  )}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const RenderSkeleton = () => (
  <SkeletonContent isLoading>
    <View style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <View style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <View style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <View style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <View style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <View style={tw`w-full h-[56px] my-1 rounded-lg`} />
  </SkeletonContent>
);
