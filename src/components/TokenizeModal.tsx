import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import tw from "../utils/tailwind";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { useModal } from "react-native-modalfy";
import { WrapModal } from "./WrapModal";
import { Trans, t } from "@lingui/macro";
import { useWallet } from "../hooks/useWallet";
import { unwrap } from "../utils/unwrap";
import { wrap } from "../utils/wrap";
import {
  METADATA_SIGNER,
  MINT_PREFIX,
  NAME_TOKENIZER_ID,
  createMint,
} from "@bonfida/name-tokenizer";
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { checkAccountExists } from "../utils/account";
import { sendTx } from "../utils/send-tx";

export const TokenizeModal = ({
  modal: { closeModal, getParam },
}: {
  modal: {
    closeModal: (modal?: string) => void;
    getParam: <T>(a: string, b?: string) => T;
  };
}) => {
  const { openModal } = useModal();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();
  const connection = useSolanaConnection();
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const isTokenized = getParam<string>("isTokenized");
  const refresh = getParam<() => Promise<void>>("refresh");

  const handle = async () => {
    if (!connection || !publicKey || !signTransaction) return;
    try {
      setLoading(true);

      const ixs: TransactionInstruction[] = [];
      const { pubkey } = getDomainKeySync(domain);

      const [mintKey] = PublicKey.findProgramAddressSync(
        [MINT_PREFIX, pubkey.toBuffer()],
        NAME_TOKENIZER_ID
      );

      const ata = await getAssociatedTokenAddress(mintKey, publicKey);

      // Unwrapping
      if (isTokenized) {
        console.log("Domain is tokenized, unwraping...");
        const ix = await unwrap(connection, domain, publicKey);
        ixs.push(...ix);
        const closeAtaIx = createCloseAccountInstruction(
          ata,
          publicKey,
          publicKey
        );

        ixs.push(closeAtaIx);
        const sig = await sendTx(connection, publicKey, ixs, signTransaction);
        await connection.confirmTransaction(sig, "processed");
      } else {
        // Wrapping
        console.log("Domain isn't tokenized, wrapping...");
        // Check if mint exists and create if needed
        if (!(await checkAccountExists(connection, mintKey))) {
          console.log("creating mint");
          const mintIx = await createMint(pubkey, publicKey, NAME_TOKENIZER_ID);
          ixs.push(...mintIx);
        }

        // Check if destination ATA exists and create if needed
        if (!(await checkAccountExists(connection, ata))) {
          console.log("creating ata");
          const ix = createAssociatedTokenAccountInstruction(
            publicKey,
            ata,
            publicKey,
            mintKey
          );
          ixs.push(ix);
        }

        if (ixs.length !== 0) {
          const sig = await sendTx(connection, publicKey, ixs, signTransaction);
          console.log(sig);
        }

        // Get tokenization ixs + signature + blockhash
        const {
          instructions,
          metadataSignature: signature,
          blockhash,
        } = await wrap(domain, publicKey);

        // Build and send tx
        let tx = new Transaction().add(...instructions);
        tx.feePayer = publicKey;
        tx.recentBlockhash = blockhash;
        tx.addSignature(METADATA_SIGNER, signature);

        tx = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(sig, "processed");
        console.log(sig);
      }

      setLoading(false);
      openModal(
        "Success",
        {
          msg: t`${domain}.sol successfully ${
            isTokenized ? "unwrapped" : "wrapped"
          }!`,
        },
        () => {
          closeModal("TokenizeModal");
        }
      );
      refresh();
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
          {isTokenized ? t`Unwrap` : `Wrap`} {domain}.sol
        </Text>
        <View style={tw`flex flex-col items-center`}>
          <TouchableOpacity
            disabled={loading}
            onPress={connected ? handle : () => setVisible(true)}
            style={tw`bg-blue-900 mt-2 w-full h-[40px] my-1 flex flex-row items-center justify-center rounded-lg`}
          >
            <Text style={tw`font-bold text-white`}>
              {isTokenized ? t`Unwrap` : t`Wrap`}
            </Text>
            {loading && <ActivityIndicator style={tw`ml-3`} size={16} />}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            onPress={() => closeModal()}
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
