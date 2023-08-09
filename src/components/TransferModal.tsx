import { View, Text } from "react-native";
import { useState } from "react";
import {
  getDomainKeySync,
  NAME_PROGRAM_ID,
  resolve,
  transferInstruction,
  ROOT_DOMAIN_ACCOUNT,
} from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { Trans, t } from "@lingui/macro";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import tw from "@src/utils/tailwind";
import { sendTx } from "@src/utils/send-tx";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useWallet } from "@src/hooks/useWallet";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { WrapModal } from "@src/components/WrapModal";
import { UiButton } from "@src/components/UiButton";
import { ActionWarning } from "@src/components/ActionWarning";
import { useHandleError } from "@src/hooks/useHandleError";

export const TransferModal = ({
  modal: { closeModal, getParam },
}: {
  modal: {
    closeModal: () => void;
    getParam: <T>(a: string, b?: string) => T;
  };
}) => {
  const { setStatus } = useStatusModalContext();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const { handleError } = useHandleError();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");
  const isSubdomain = domain?.split(".").length === 2;

  const handle = async () => {
    if (!connection || !publicKey || !signTransaction) return;
    try {
      setLoading(true);

      let newOwner: PublicKey | undefined = undefined;
      if (value.endsWith(".sol")) {
        newOwner = await resolve(connection, value);
      } else {
        newOwner = new PublicKey(value);
      }

      const ix = transferInstruction(
        NAME_PROGRAM_ID,
        getDomainKeySync(domain).pubkey,
        newOwner,
        publicKey,
        undefined,
        ROOT_DOMAIN_ACCOUNT
      );

      const sig = await sendTx(connection, publicKey, [ix], signTransaction);
      console.log(sig);
      setLoading(false);
      setStatus({
        status: "success",
        message: t`${domain}.sol successfully transfered!`,
      });
      refresh();
      closeModal();
    } catch (err) {
      setLoading(false);
      handleError(err);
    }
  };

  return (
    <WrapModal closeModal={closeModal} title={t`Transfer ${domain}.sol`}>
      <CustomTextInput
        placeholder={t`New ${domain}.sol owner`}
        onChangeText={(text) => setValue(text)}
        value={value}
        style={tw`mt-5`}
        editable={!loading}
      />

      <Text style={tw`mt-3 mb-5 text-sm`}>
        {isSubdomain ? (
          <Trans>
            Transferring your subdomain will link it to a new address and may
            restrict your ability to receive funds through it. Although the
            action can be reversed by the parent owners, we caution the user to
            be vigilant of the addresses.
          </Trans>
        ) : (
          <Trans>
            Please remember, once you transfer a domain, the action is
            irreversible. You will lose its ownership and will no longer be able
            to receive funds using this domain.
          </Trans>
        )}
      </Text>

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
          content={t`Confirm`}
          loading={loading}
        />
      </View>

      <ActionWarning actionName={t`Confirm`} />
    </WrapModal>
  );
};
