import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import {
  getDomainKeySync,
  NAME_PROGRAM_ID,
  deleteInstruction,
} from "@bonfida/spl-name-service";
import tw from "../utils/tailwind";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { sendTx } from "../utils/send-tx";
import { WrapModal } from "./WrapModal";
import { useWallet } from "../hooks/useWallet";
import { useNavigation } from "@react-navigation/native";
import { domainViewScreenProp } from "@src/types";
import { trimTld } from "../utils/validate";
import { t } from "@lingui/macro";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import { UiButton } from "@src/components/UiButton";

export const DeleteModal = ({
  modal: { closeModal, getParam },
}: {
  modal: {
    closeModal: (modal?: string) => void;
    getParam: <T>(a: string, b?: string) => T;
  };
}) => {
  const { setStatus } = useStatusModalContext();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");

  const navigation = useNavigation<domainViewScreenProp>();

  const handle = async () => {
    if (!connection || !publicKey || !signTransaction) return;
    try {
      setLoading(true);
      const ix = deleteInstruction(
        NAME_PROGRAM_ID,
        getDomainKeySync(domain).pubkey,
        publicKey,
        publicKey
      );
      const sig = await sendTx(connection, publicKey, [ix], signTransaction);
      console.log(sig);

      setLoading(false);
      setStatus({ status: 'success', message: t`subdomain ${domain}.sol successfully deleted!` });
      closeModal("Delete");
      const splitted = trimTld(domain).split(".");
      return navigation.navigate("domain-view", {
        domain: splitted.length === 2 ? splitted[1] : domain,
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setStatus({ status: 'error', message: t`Something went wrong - try again` });
    }
  };

  return (
    <WrapModal closeModal={closeModal} title={t`Delete ${domain}.sol`}>
      <View style={tw`flex flex-row items-center gap-4 mt-10`}>
        <UiButton
          disabled={loading}
          onPress={() => closeModal()}
          outline
          content={t`Cancel`}
          loading={loading}
        />

        <UiButton
          disabled={loading}
          onPress={connected ? handle : () => setVisible(true)}
          content={t`Delete`}
          danger
          loading={loading}
        />
      </View>
    </WrapModal>
  );
};
