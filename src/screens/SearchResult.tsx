import { View, FlatList, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Skeleton } from "@src/components/Skeleton";
import { useModal } from "react-native-modalfy";
import { t } from "@lingui/macro";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "@src/types";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import tw from "@src/utils/tailwind";
import { trimTld, validate } from "@src/utils/validate";
import { isPubkey } from "@src/utils/publickey";
import { useSearch, useDomainSuggestions } from "@bonfida/sns-react";
import { useTopDomainsSales } from "@src/hooks/useTopDomainsSales";
import { Screen } from "@src/components/Screen";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { UiButton } from "@src/components/UiButton";
import { DomainSearchResultRow } from "@src/components/DomainSearchResultRow";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";

export const SearchResult = ({
  domain,
  loadPopular = false,
}: {
  domain: string;
  loadPopular?: boolean;
}) => {
  const connection = useSolanaConnection();
  const { currentModal } = useModal();
  const { setStatus } = useStatusModalContext();
  const [activeSearchQuery, setSearchQuery] = useState(domain || "");
  // "inputFieldValue" is only responsible for what is displayed in input field, data
  // is loaded based on "activeSearchQuery"
  const [inputFieldValue, setInput] = useState(domain || "");
  const results = useSearch({
    connection: connection!,
    domain: activeSearchQuery,
  });
  const suggestions = useDomainSuggestions({
    connection: connection!,
    domain: activeSearchQuery,
  });
  const navigation = useNavigation<profileScreenProp>();
  const isFocused = useIsFocused();
  const topDomainsSales = useTopDomainsSales(loadPopular);
  const [showPopularDomains, togglePopularDomains] = useState(loadPopular);

  useEffect(() => {
    setSearchQuery(domain || activeSearchQuery);
    setInput(domain || activeSearchQuery);
  }, [domain, isFocused]);

  const handle = async () => {
    if (!inputFieldValue) return;
    togglePopularDomains(false);
    if (isPubkey(inputFieldValue)) {
      return navigation.navigate("Home", {
        screen: "search-profile",
        params: { owner: inputFieldValue },
      });
    }
    if (!validate(inputFieldValue)) {
      return setStatus({
        status: "error",
        message: t`${inputFieldValue}.sol is not a valid domain`,
      });
    }
    setSearchQuery(trimTld(inputFieldValue));
  };

  return (
    <Screen>
      <ScrollView showsHorizontalScrollIndicator={false}>
        <CustomTextInput
          autoCapitalize="none"
          onChangeText={(newText) => setInput(newText.toLowerCase())}
          value={inputFieldValue}
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
            disabled={!inputFieldValue}
            content={t`Search your .SOL domain`}
          />
        </View>

        <View style={tw`mt-3`}>
          {showPopularDomains && topDomainsSales ? (
            <>
              {topDomainsSales.isLoading && <RenderSkeleton />}
              {!topDomainsSales.isLoading && (
                <FlatList
                  data={topDomainsSales.data}
                  scrollEnabled={false}
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

              {!results.loading &&
              results.result?.length &&
              suggestions.loading ? (
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
                  scrollEnabled={false}
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
  <View>
    <Skeleton isLoading style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <Skeleton isLoading style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <Skeleton isLoading style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <Skeleton isLoading style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <Skeleton isLoading style={tw`w-full h-[56px] my-1 rounded-lg`} />
    <Skeleton isLoading style={tw`w-full h-[56px] my-1 rounded-lg`} />
  </View>
);
