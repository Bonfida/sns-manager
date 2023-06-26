import {
  Record,
  getDomainKeySync,
  NameRegistryState,
  transferInstruction,
  NAME_PROGRAM_ID,
  createNameRegistry,
  updateInstruction,
  Numberu32,
  deleteInstruction,
  serializeRecord,
  serializeSolRecord,
} from "@bonfida/spl-name-service";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import tw from "../utils/tailwind";
import { TransactionInstruction } from "@solana/web3.js";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { ChainId, Network, post } from "@bonfida/sns-emitter";
import { Buffer } from "buffer";
import { useModal } from "react-native-modalfy";
import { sleep } from "../utils/sleep";
import { WrapModal } from "./WrapModal";
import {
  getPlaceholder,
  getTranslatedName,
} from "../utils/record/place-holder";
import { sendTx } from "../utils/send-tx";
import { Trans, t } from "@lingui/macro";
import { useWallet } from "../hooks/useWallet";
import { ROOT_DOMAIN } from "@bonfida/name-offers";
import { PublicKey } from "@solana/web3.js";

export const EditRecordModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const [loading, setLoading] = useState(false);
  const record = getParam<Record>("record");
  const domain = getParam<string>("domain");
  const currentContent = getParam<string | undefined>("currentValue");
  const refresh = getParam<() => Promise<void>>("refresh");
  const connection = useSolanaConnection();
  const { publicKey, signTransaction, setVisible, connected, signMessage } =
    useWallet();
  const { openModal } = useModal();

  const [value, setValue] = useState(currentContent ? currentContent : "");

  const handleUpdate = async () => {
    if (!connection || !publicKey || !signTransaction || !signMessage) return;
    try {
      setLoading(true);
      const ixs: TransactionInstruction[] = [];
      const sub = Buffer.from([1]).toString() + record;
      let { pubkey: recordKey, isSub } = getDomainKeySync(
        record + "." + domain,
        true
      );
      const parent = isSub ? getDomainKeySync(domain).pubkey : ROOT_DOMAIN;

      if (record === Record.Url) {
        try {
          new URL(value);
        } catch (err) {
          setLoading(false);
          return openModal("Error", { msg: t`Invalid URL` });
        }
      } else if (record === Record.IPFS) {
        if (!value.startsWith("ipfs://")) {
          setLoading(false);
          return openModal("Error", {
            msg: t`Invalid IPFS record - Must start with ipfs://`,
          });
        }
      } else if (record === Record.ARWV) {
        if (!value.startsWith("arw://")) {
          setLoading(false);
          return openModal("Error", { msg: t`Invalid Arweave record` });
        }
      } else if ([Record.BSC, Record.ETH].includes(record)) {
        const buffer = Buffer.from(value.slice(2), "hex");
        if (!value.startsWith("0x") || buffer.length !== 20) {
          setLoading(false);
          return openModal("Error", { msg: t`Invalid BSC address` });
        }
      }

      // Check if exists
      let ser: Buffer;
      if (record === Record.SOL) {
        const toSign = Buffer.concat([
          new PublicKey(value).toBuffer(),
          recordKey.toBuffer(),
        ]);

        const encodedMessage = new TextEncoder().encode(toSign.toString("hex"));
        const signed = await signMessage(encodedMessage);
        ser = serializeSolRecord(
          new PublicKey(value),
          recordKey,
          publicKey,
          signed
        );
      } else {
        ser = serializeRecord(value, record as Record);
      }
      const space = ser.length;
      console.log("Space", space);
      const currentAccount = await connection.getAccountInfo(recordKey);

      if (!currentAccount?.data) {
        const lamports = await connection.getMinimumBalanceForRentExemption(
          space + NameRegistryState.HEADER_LEN
        );
        const ix = await createNameRegistry(
          connection,
          sub,
          space,
          publicKey,
          publicKey,
          lamports,
          undefined,
          parent
        );
        ixs.push(ix);
      } else {
        const { registry } = await NameRegistryState.retrieve(
          connection,
          recordKey
        );

        if (!registry.owner.equals(publicKey)) {
          // Record was created before domain was transfered
          const ix = transferInstruction(
            NAME_PROGRAM_ID,
            recordKey,
            publicKey,
            registry.owner,
            undefined,
            parent,
            publicKey
          );
          ixs.push(ix);
        }

        // The size changed: delete + create to resize
        if (
          currentAccount.data.length - NameRegistryState.HEADER_LEN !==
          space
        ) {
          console.log("Resizing...");
          const ixClose = deleteInstruction(
            NAME_PROGRAM_ID,
            recordKey,
            publicKey,
            publicKey
          );
          const sig = await sendTx(
            connection,
            publicKey,
            [ixClose],
            signTransaction
          );
          console.log(sig);

          const lamports = await connection.getMinimumBalanceForRentExemption(
            space + NameRegistryState.HEADER_LEN
          );
          const ix = await createNameRegistry(
            connection,
            sub,
            space,
            publicKey,
            publicKey,
            lamports,
            undefined,
            parent
          );
          ixs.push(ix);
        }
      }

      const ix = updateInstruction(
        NAME_PROGRAM_ID,
        recordKey,
        new Numberu32(0),
        ser,
        publicKey
      );

      ixs.push(ix);

      // Handle bridge cases
      if (record === Record.BSC) {
        const ix = await post(
          ChainId.BSC,
          Network.Mainnet,
          domain,
          publicKey,
          1_000,
          recordKey
        );
        ixs.push(...ix);
      }

      const sig = await sendTx(connection, publicKey, ixs, signTransaction);
      console.log(sig);

      await sleep(400);

      setLoading(false);
      await refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      setLoading(false);
      await refresh();
      openModal("Error", { msg: t`Something went wrong - try again` });
    }
  };

  const handleDelete = async () => {
    if (!connection || !publicKey || !signTransaction) return;
    try {
      setLoading(true);
      const { pubkey } = getDomainKeySync(record + "." + domain, true);
      const ix = deleteInstruction(
        NAME_PROGRAM_ID,
        pubkey,
        publicKey,
        publicKey
      );
      const sig = await sendTx(connection, publicKey, [ix], signTransaction);
      console.log(sig);

      await sleep(400);

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
          <Trans>Edit {getTranslatedName(record)} record</Trans>
        </Text>
        <TextInput
          placeholder={getPlaceholder(record)}
          onChangeText={(text) => setValue(text)}
          value={value}
          style={tw`h-[40px] pl-2 bg-blue-grey-050 rounded-lg my-5 font-bold`}
        />
        <View style={tw`flex flex-col items-center`}>
          <TouchableOpacity
            disabled={loading}
            onPress={connected ? handleUpdate : () => setVisible(true)}
            style={tw`bg-blue-900 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>
              <Trans>Confirm</Trans>
            </Text>
            {loading && <ActivityIndicator style={tw`ml-3`} size={16} />}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            onPress={connected ? handleDelete : () => setVisible(true)}
            style={tw`bg-red-400 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>
              <Trans>Delete</Trans>
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
