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
} from "@bonfida/spl-name-service";
import tw from "../utils/tailwind";
import { PublicKey } from "@solana/web3.js";
import { usePublicKeys, useSolanaConnection } from "../hooks/xnft-hooks";
import { sendTx } from "../utils/send-tx";
import { useModal } from "react-native-modalfy";
import { WrapModal } from "./WrapModal";

export const TransferModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const { openModal } = useModal();
  const publicKey = usePublicKeys().get("solana");
  const connection = useSolanaConnection();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");

  const handle = async () => {
    if (!connection || !publicKey) return;
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
        new PublicKey(publicKey),
        undefined,
        ROOT_DOMAIN_ACCOUNT
      );

      const sig = await sendTx(connection, new PublicKey(publicKey), [ix]);
      console.log(sig);
      setLoading(false);
      closeModal();
      openModal("Success", { msg: `${domain}.sol successfully transfered!` });
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
        <Text style={tw`text-xl font-bold`}>Transfer {domain}.sol</Text>
        <TextInput
          placeholder={`New ${domain}.sol owner`}
          onChangeText={(text) => setValue(text)}
          value={value}
          style={tw`h-[40px] text-sm pl-2 bg-blue-grey-050 rounded-lg my-5 font-bold`}
        />
        <View style={tw`flex flex-col items-center`}>
          <TouchableOpacity
            disabled={loading}
            onPress={handle}
            style={tw`bg-blue-900 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>Confirm</Text>
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
