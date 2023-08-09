import { Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import tw from "@src/utils/tailwind";

import { WrapModal } from "@src/components/WrapModal";

export const DiscountExplainerModal = ({
  modal: { closeModal },
}: {
  modal: { closeModal: () => void };
}) => {
  return (
    <WrapModal
      closeModal={closeModal}
      title={
        <>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={tw.color("content-success")}
          />
          <Trans>Registration discount</Trans>
        </>
      }
    >
      <Text style={tw`mt-6 text-sm`}>
        <Trans>
          If you register your domains using FIDA, you are eligible for a 5%
          discount!
        </Trans>
      </Text>
    </WrapModal>
  );
};
