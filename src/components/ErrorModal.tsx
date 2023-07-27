import { View, Text, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { MaterialIcons } from "@expo/vector-icons";
import { WrapModal } from "./WrapModal";
import { Trans, t } from "@lingui/macro";

export const ErrorModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const message = getParam<string>("msg", t`Something went wrong`);

  return (
    <WrapModal
      closeModal={closeModal}
      title={
        <>
          <MaterialIcons name="error-outline" size={24} color="#dc2626" />
          <Text style={tw`text-lg font-bold`}>
            <Trans>Something went wrong</Trans>
          </Text>
        </>
      }
    >
      <Text style={tw`pl-2 mt-2 text-sm`}>{message}</Text>
    </WrapModal>
  );
};
