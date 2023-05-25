import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import tw from "../utils/tailwind";
import { useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Result } from "../hooks/useDomains";
import { DomainRow } from "./DomainRow";
import { WrapModal } from "./WrapModal";

export const SearchModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const domains = getParam<Result[]>("domains");
  const favorite = getParam<string | undefined>("favorite");
  const isOwner = getParam<boolean>("isOwner");
  const refresh = getParam<() => Promise<void>>("refresh");
  const [search, setSearch] = useState("");

  const list = useMemo(
    () => domains.filter((e) => e.domain.includes(search)),
    [search]
  );

  return (
    <WrapModal containerStyle={tw`justify-start mt-20`} closeModal={closeModal}>
      <View style={tw`max-h-[80%] w-full bg-white rounded-lg px-4 py-5`}>
        <View
          style={tw`flex flex-row items-center h-[60px] mb-4 pb-3 border-b-[1.5px] border-black/10`}
        >
          <TouchableOpacity>
            <Feather name="search" size={18} color="grey" />
          </TouchableOpacity>
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            style={[
              Platform.OS === "web" && { outlineWidth: 0 },
              ,
              tw`w-full h-full ml-4 font-semibold`,
            ]}
            placeholder="Search domains"
            placeholderTextColor="#BCCCDC"
          />
        </View>

        {search !== "" && list.length !== 0 && (
          <FlatList
            data={list}
            renderItem={({ item }) => (
              <DomainRow
                domain={item.domain}
                isFav={favorite === item.domain}
                key={item.key}
                isOwner={isOwner}
                refresh={refresh}
                callback={closeModal}
              />
            )}
            keyExtractor={(item) => item.domain}
          />
        )}
        {search !== "" && list.length === 0 && (
          <View>
            <Text style={tw`text-lg font-bold text-center`}>
              No domain found
            </Text>
          </View>
        )}
      </View>
    </WrapModal>
  );
};
