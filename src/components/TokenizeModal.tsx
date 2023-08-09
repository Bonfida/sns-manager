import { useState } from "react";
import { View, Text } from "react-native";
import { getDomainKeySync } from "@bonfida/spl-name-service";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Trans, t } from "@lingui/macro";
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
import { A as HTMLLink } from "@expo/html-elements";
import tw from "@src/utils/tailwind";
import { unwrap } from "@src/utils/unwrap";
import { wrap } from "@src/utils/wrap";
import { checkAccountExists } from "@src/utils/account";
import { sendTx } from "@src/utils/send-tx";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useWallet } from "@src/hooks/useWallet";
import { WrapModal } from "@src/components/WrapModal";
import { UiButton } from "@src/components/UiButton";
import { ActionWarning } from "@src/components/ActionWarning";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import { useHandleError } from "@src/hooks/useHandleError";

export const TokenizeModal = ({
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
  const { handleError } = useHandleError();
  const [loading, setLoading] = useState(false);
  const domain = getParam<string>("domain");
  const isTokenized = getParam<string>("isTokenized");
  const isOwner = getParam<string>("isOwner");
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
      setStatus({
        status: "success",
        message: t`${domain}.sol successfully ${
          isTokenized ? "unwrapped" : "wrapped"
        }!`,
      });
      closeModal("TokenizeModal");
      refresh();
    } catch (err) {
      setLoading(false);
      handleError(err);
    }
  };

  const modalTitle = isOwner
    ? isTokenized
      ? t`Unwrap your domain from NFT`
      : t`Wrap your domain into an NFT`
    : t`What is an NFT domain?`;

  return (
    <WrapModal closeModal={closeModal} title={modalTitle}>
      <Text style={tw`mt-6 text-sm text-black`}>
        <Trans>
          Domain name tokenization (wrapping), involves converting a domain name
          into an NFT. To reveal the original domain name, the token can be
          redeemed (unwrapped).
        </Trans>
      </Text>
      <Text style={tw`mt-6 text-sm text-black`}>
        <Trans>What to consider:</Trans>
      </Text>
      <View style={tw`flex flex-col gap-2 pl-1 mt-6 text-sm text-black`}>
        <Text style={tw`flex flex-row gap-1 text-sm text-black`}>
          <Trans>
            <Text>1.</Text>
            <Text>
              Transferring funds can sometimes be a bit complex, and it may vary
              depending on the wallet you are using.
            </Text>
          </Trans>
        </Text>
        <Text style={tw`flex flex-row gap-1 text-sm text-black`}>
          <Trans>
            <Text>2.</Text>
            <Text>
              You cannot edit the content of your domain or add subdomains.
            </Text>
          </Trans>
        </Text>
        <Text style={tw`flex flex-row gap-1 text-sm text-black`}>
          <Trans>
            <Text>3.</Text>
            <Text>You cannot transfer your domain.</Text>
          </Trans>
        </Text>
      </View>

      <HTMLLink
        style={tw`mt-6 text-sm text-center text-brand-primary`}
        href="https://docs.bonfida.org/collection/naming-service/how-to-create-a-solana-domain-name/selling-a-domain-name/nft-domain-resell"
      >
        <Trans>Learn more in our docs</Trans>
      </HTMLLink>

      <View style={tw`mt-6`}>
        {isOwner ? (
          <UiButton
            disabled={loading}
            onPress={connected ? handle : () => setVisible(true)}
            content={isTokenized ? t`Unwrap domain` : t`Wrap domain`}
            loading={loading}
          />
        ) : (
          <UiButton onPress={() => closeModal()} content={t`Close`} />
        )}
      </View>

      {isOwner && (
        <>
          {isTokenized ? (
            <ActionWarning actionName={t`Unwrap domain`} />
          ) : (
            <ActionWarning actionName={t`Wrap domain`} />
          )}
        </>
      )}
    </WrapModal>
  );
};
