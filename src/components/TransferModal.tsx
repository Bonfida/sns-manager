import { View } from "react-native";
import { useState } from "react";
import {
  getDomainKeySync,
  NAME_PROGRAM_ID,
  resolve,
  transferInstruction,
  ROOT_DOMAIN_ACCOUNT,
} from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import { useModal } from "react-native-modalfy";
import { t } from "@lingui/macro";

import tw from "@src/utils/tailwind";
import { sendTx } from "@src/utils/send-tx";

import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useWallet } from "@src/hooks/useWallet";

import { CustomTextInput } from '@src/components/CustomTextInput';
import { WrapModal } from "@src/components/WrapModal";
import { UiButton } from "@src/components/UiButton";

export const TransferModal = ({
  modal: { closeModal, getParam },
}: {
  modal: {
    closeModal: () => void;
    getParam: <T>(a: string, b?: string) => T;
  };
}) => {
  const { openModal } = useModal();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");

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
      openModal("Success", { msg: t`${domain}.sol successfully transfered!` });
      refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      setLoading(false);
      openModal("Error", { msg: t`Something went wrong - try again` });
    }
  };

  return (
    <WrapModal
      closeModal={closeModal}
      title={t`Transfer ${domain}.sol`}
    >
      <CustomTextInput
        placeholder={t`New ${domain}.sol owner`}
        onChangeText={(text) => setValue(text)}
        value={value}
        style={tw`my-5`}
        editable={!loading}
      />

      <View style={tw`flex flex-row items-center gap-4`}>
        <UiButton
          disabled={loading}
          onPress={closeModal}
          outline
          content={t`Cancel`}
          loading={loading}
        />

        <UiButton
          disabled={loading}
          onPress={connected ? handle : () => setVisible(true)}
          content={t`Confirm`}
          loading={loading}
        />
      </View>
    </WrapModal>
  );
};
