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
  resolve,
  transferInstruction,
  ROOT_DOMAIN_ACCOUNT,
  deleteInstruction,
  createSubdomain,
} from "@bonfida/spl-name-service";
import tw from "../utils/tailwind";
import { PublicKey } from "@solana/web3.js";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { sendTx } from "../utils/send-tx";
import { useModal } from "react-native-modalfy";
import { WrapModal } from "./WrapModal";
import { useWallet } from "../hooks/useWallet";

export const CreateSubdomainModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const { openModal } = useModal();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");

  const handle = async () => {
    if (!connection || !publicKey || !signTransaction || !value) return;
    try {
      setLoading(true);

      const subdomain = value + "." + domain;

      const [, ix] = await createSubdomain(connection, subdomain, publicKey);
      const sig = await sendTx(connection, publicKey, [...ix], signTransaction);
      console.log(sig);

      setLoading(false);
      closeModal();
      openModal("Success", {
        msg: `subdomain ${subdomain}.sol successfully created!`,
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
        <Text style={tw`text-xl font-bold`}>Create a subdomain</Text>
        <View style={tw`flex flex-row items-center gap-2`}>
          <TextInput
            placeholder={"Enter subdomain"}
            onChangeText={(text) => setValue(text)}
            value={value}
            style={tw`h-[40px] pl-2 bg-blue-grey-050 rounded-lg my-5`}
          />

          <Text style={tw`font-bold text-md`}>.{domain}.sol</Text>
        </View>
        <View style={tw`flex flex-col items-center mt-2`}>
          <TouchableOpacity
            disabled={loading}
            onPress={connected ? handle : () => setVisible(true)}
            style={tw`bg-blue-900 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>Create</Text>
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
