import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import tw from "../utils/tailwind";
import { useModal } from "react-native-modalfy";
import {
  Record,
  getDomainKeySync,
  NameRegistryState,
  transferInstruction,
  NAME_PROGRAM_ID,
  createNameRegistry,
  updateInstruction,
  Numberu32,
  NAME_OFFERS_ID,
} from "@bonfida/spl-name-service";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { removeZeroRight } from "../utils/record/zero";
import { sendTx } from "../utils/send-tx";
import { WrapModal } from "./WrapModal";
import { isTokenized } from "@bonfida/name-tokenizer";
import { unwrap } from "../utils/unwrap";
import { registerFavourite } from "@bonfida/name-offers";
import { Trans, t } from "@lingui/macro";
import { useWallet } from "../hooks/useWallet";

export const EditPicture = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const currentPic = getParam<string | undefined>("currentPic");
  const domain = getParam<string>("domain");
  const setAsFav = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");
  const { openModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState<string | undefined>("");
  const connection = useSolanaConnection();
  const { publicKey, signTransaction, setVisible, connected } = useWallet();

  const handle = async () => {
    if (!pic) return;
    if (!connection || !publicKey || !signTransaction) return;
    try {
      setLoading(true);
      const ixs: TransactionInstruction[] = [];
      const { pubkey, parent } = getDomainKeySync(
        Record.Pic + "." + domain,
        true
      );

      try {
        new URL(pic);
      } catch (err) {
        setLoading(false);
        return openModal("Error", { msg: t`Invalid URL` });
      }

      // Set as fav
      if (setAsFav) {
        const { pubkey } = getDomainKeySync(domain);
        if (await isTokenized(connection, pubkey)) {
          console.log("Domain is tokenized, unwraping...");
          const ix = await unwrap(connection, domain, new PublicKey(publicKey));
          ixs.push(...ix);
        }
        const ix = await registerFavourite(
          pubkey,
          new PublicKey(publicKey),
          NAME_OFFERS_ID
        );
        ixs.push(...ix);
      }

      // Check if exists
      const info = await connection.getAccountInfo(pubkey);
      if (!info?.data) {
        const space = 2_000;
        const lamports = await connection.getMinimumBalanceForRentExemption(
          space + NameRegistryState.HEADER_LEN
        );
        const ix = await createNameRegistry(
          connection,
          Buffer.from([1]).toString() + Record.Pic,
          space, // Hardcode space to 2kB
          new PublicKey(publicKey),
          new PublicKey(publicKey),
          lamports,
          undefined,
          parent
        );
        ixs.push(ix);
      } else {
        // Zero the data stored
        const { registry } = await NameRegistryState.retrieve(
          connection,
          pubkey
        );

        if (!registry.owner.equals(new PublicKey(publicKey))) {
          // Record was created before domain was transfered
          const ix = transferInstruction(
            NAME_PROGRAM_ID,
            pubkey,
            new PublicKey(publicKey),
            registry.owner,
            undefined,
            parent,
            new PublicKey(publicKey)
          );
          ixs.push(ix);
        }

        if (registry.data) {
          const trimmed = removeZeroRight(registry.data);
          const zero = Buffer.alloc(trimmed.length);
          const ix = updateInstruction(
            NAME_PROGRAM_ID,
            pubkey,
            new Numberu32(0),
            zero,
            new PublicKey(publicKey)
          );
          ixs.push(ix);
        }
      }

      const data = Buffer.from(pic, "utf-8");
      const ix = updateInstruction(
        NAME_PROGRAM_ID,
        pubkey,
        new Numberu32(0),
        data,
        new PublicKey(publicKey)
      );
      ixs.push(ix);

      const sig = await sendTx(
        connection,
        new PublicKey(publicKey),
        ixs,
        signTransaction
      );
      console.log(sig);

      setLoading(false);
      await refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      setLoading(false);
      openModal("Error", { msg: t`Something went wrong - try again` });
    }
  };

  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <Text style={tw`text-xl font-bold`}>
          <Trans>Edit Picture</Trans>
        </Text>
        <View style={tw`flex items-center justify-center my-2`}>
          <Image
            style={tw`w-[100px] border-[3px] rounded-lg border-black/10 h-[100px]`}
            source={
              pic || currentPic
                ? { uri: pic || currentPic }
                : require("../../assets/default-pic.png")
            }
          />
        </View>
        <TextInput
          placeholder={t`New picture URL`}
          onChangeText={(text) => setPic(text)}
          value={pic}
          style={tw`h-[40px] bg-blue-grey-050 pl-2 rounded-md my-5 font-bold`}
        />
        <View style={tw`flex flex-col items-center`}>
          <TouchableOpacity
            disabled={loading}
            onPress={connected ? handle : () => setVisible(true)}
            style={tw`bg-blue-900 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>
              <Trans>Confirm</Trans>
            </Text>
            {loading && <ActivityIndicator style={tw`ml-3`} size={16} />}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            onPress={closeModal}
            style={tw`bg-blue-grey-400 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>
              <Trans>Cancel</Trans>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapModal>
  );
};
