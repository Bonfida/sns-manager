import { View, Text } from "react-native";
import { useState } from "react";
import { createSubdomain } from "@bonfida/spl-name-service";
import tw from "../utils/tailwind";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { sendTx } from "../utils/send-tx";
import { useModal } from "react-native-modalfy";
import { WrapModal } from "./WrapModal";
import { useWallet } from "../hooks/useWallet";
import { validate } from "../utils/validate";
import { t } from "@lingui/macro";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import { useHandleError } from "@src/hooks/useHandleError";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { UiButton } from "@src/components/UiButton";

export const CreateSubdomainModal = ({
  modal: { closeModal, getParam },
}: {
  modal: {
    closeModal: (modal?: string) => void;
    getParam: <T>(a: string, b?: string) => T;
  };
}) => {
  const { openModal } = useModal();
  const { setStatus } = useStatusModalContext();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const [value, setValue] = useState("");
  const { handleError } = useHandleError();
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");

  const handle = async () => {
    if (!connection || !publicKey || !signTransaction || !value) return;
    try {
      setLoading(true);

      const subdomain = value + "." + domain;

      if (!validate(subdomain)) {
        setLoading(false);
        setStatus({
          status: "error",
          message: t`${subdomain}.sol is not a valid subdomain`,
        });
        return;
      }

      const [, ix] = await createSubdomain(connection, subdomain, publicKey);
      const sig = await sendTx(connection, publicKey, [...ix], signTransaction);
      console.log(sig);

      setLoading(false);

      openModal(
        "SuccessSubdomainModal",
        {
          msg: t`Subdomain ${subdomain}.sol successfully created!`,
          subdomain,
        },
        () => {
          closeModal("CreateSubdomain");
        }
      );
      refresh();
    } catch (err) {
      setLoading(false);
      handleError(err);
    }
  };

  return (
    <WrapModal closeModal={closeModal} title={t`Create a subdomain`}>
      <View style={tw`flex flex-row items-center gap-2 my-5`}>
        <CustomTextInput
          placeholder={t`Enter subdomain`}
          onChangeText={(text) => setValue(text)}
          value={value}
          editable={!loading}
          style={tw`w-auto`}
        />

        <Text style={tw`text-base font-bold`}>.{domain}.sol</Text>
      </View>
      <View style={tw`flex flex-row items-center gap-4`}>
        <UiButton
          disabled={loading}
          onPress={() => closeModal()}
          outline
          content={t`Cancel`}
          loading={loading}
        />

        <UiButton
          disabled={loading || !value}
          onPress={connected ? handle : () => setVisible(true)}
          content={t`Create`}
          loading={loading}
        />
      </View>
    </WrapModal>
  );
};
