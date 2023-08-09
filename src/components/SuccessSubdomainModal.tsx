import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import tw from "../utils/tailwind";
import { WrapModal } from "./WrapModal";
import { Trans, t } from "@lingui/macro";
import { useNavigation } from "@react-navigation/native";
import { domainViewScreenProp } from "@src/types";

import { UiButton } from "@src/components/UiButton";

export const SuccessSubdomainModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const navigation = useNavigation<domainViewScreenProp>();

  const msg = getParam<string>("msg");
  const subdomain = getParam<string>("subdomain");

  return (
    <WrapModal
      closeModal={closeModal}
      title={
        <>
          <Feather name="check-circle" size={24} color="#16a34a" />
          <Text style={tw`ml-2 text-lg font-bold`}>
            <Trans>Success!</Trans>
          </Text>
        </>
      }
    >
      <Text style={tw`pl-2 my-4 text-sm`}>{msg}</Text>

      <View style={tw`flex flex-row items-center gap-4`}>
        <UiButton
          onPress={() => closeModal()}
          outline
          content={t`Close`}
          style={tw`basis-2/5`}
        />

        <UiButton
          onPress={() => {
            closeModal();
            navigation.navigate("domain-view", { domain: subdomain });
          }}
          content={t`View subdomain`}
          style={tw`basis-3/5`}
        />
      </View>
    </WrapModal>
  );
};
