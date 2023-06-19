import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import {
  getDomainKeySync,
  NAME_PROGRAM_ID,
  deleteInstruction,
} from "@bonfida/spl-name-service";
import tw from "../utils/tailwind";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { sendTx } from "../utils/send-tx";
import { useModal } from "react-native-modalfy";
import { WrapModal } from "./WrapModal";
import { useWallet } from "../hooks/useWallet";

export const DeleteModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const { openModal } = useModal();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");

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
      closeModal();
      openModal("Success", {
        msg: `subdomain ${domain}.sol successfully deleted!`,
      });
      refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
      openModal("Error", { msg: "Something went wrong - try again" });
    }
  };

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <Text style={tw`text-xl font-bold`}>Delete {domain}.sol</Text>
        <View style={tw`flex flex-col items-center mt-2`}>
          <TouchableOpacity
            disabled={loading}
            onPress={connected ? handle : () => setVisible(true)}
            style={tw`bg-red-400 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>Delete</Text>
            {loading && <ActivityIndicator style={tw`ml-3`} size={16} />}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            onPress={closeModal}
            style={tw`bg-blue-grey-400 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapModal>
  );
};