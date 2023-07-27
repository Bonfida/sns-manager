import { Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import tw from "@src/utils/tailwind";

import { WrapModal } from "@src/components/WrapModal";
import { UiButton } from '@src/components/UiButton';

export const SuccessModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const msg = getParam<string>("msg");

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

      <UiButton
        onPress={() => closeModal()}
        content={t`Close`}
      />
    </WrapModal>
  );
};
