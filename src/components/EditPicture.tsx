import { useState } from "react";
import { View, Image } from "react-native";
import tw from "@src/utils/tailwind";
import * as ImagePicker from "expo-image-picker";
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
import { registerFavourite } from "@bonfida/name-offers";
import { isTokenized } from "@bonfida/name-tokenizer";
import { t } from "@lingui/macro";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { removeZeroRight } from "@src/utils/record/zero";
import { sendTx } from "@src/utils/send-tx";
import { WrapModal } from "./WrapModal";
import { unwrap } from "@src/utils/unwrap";
import { useWallet } from "@src/hooks/useWallet";
import { uploadToIPFS } from "@src/utils/ipfs";
import { UiButton } from "@src/components/UiButton";
import { CustomTextInput } from "@src/components/CustomTextInput";
import { useHandleError } from "@src/hooks/useHandleError";

export const EditPicture = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const currentPic = getParam<string | undefined>("currentPic");
  const domain = getParam<string>("domain");
  const setAsFav = getParam<string>("domain");
  const refresh = getParam<() => Promise<void>>("refresh");
  const { setStatus } = useStatusModalContext();
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState<string | undefined>("");
  const connection = useSolanaConnection();
  const { handleError } = useHandleError();
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
        setStatus({ status: "error", message: t`Invalid URL` });
        return;
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
      setLoading(false);
      handleError(err);
    }
  };

  const handlePickImage = async () => {
    try {
      let permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        setStatus({
          status: "error",
          message: t`Permission to access photo album is required`,
        });
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        exif: false,
      });

      if (!result.canceled) {
        setLoading(true);
        const asset = result.assets?.[0];
        if (!asset) {
          throw new Error("Failed to get image asset");
        }
        const filename = `${domain}-${+Date.now()}.jpg`;
        const image = asset.uri.startsWith("data:image")
          ? asset.uri
          : asset.base64 || undefined;
        if (!image) {
          throw new Error("Failed to get image");
        }

        const res = await uploadToIPFS(image);
        if (!res?.hash) {
          throw new Error("Failed to upload to IPFS");
        }
        setPic(res.url);
        await handle();
      } else {
        console.log("cancelled");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <WrapModal closeModal={closeModal} title={t`Change profile picture`}>
      <View style={tw`flex items-center justify-center my-6`}>
        <Image
          style={tw`w-[100px] rounded-full h-[100px]`}
          source={
            pic || currentPic
              ? { uri: pic || currentPic }
              : require("@assets/default-pic.png")
          }
        />
      </View>

      <UiButton
        disabled={loading}
        onPress={connected ? handlePickImage : () => setVisible(true)}
        style={tw`flex flex-row items-center justify-center`}
        content={t`Upload a picture...`}
        loading={loading}
      />

      <View style={tw`flex flex-col mt-4 mb-10`}>
        <CustomTextInput
          label={t`Picture URL`}
          editable={!loading}
          placeholder={t`New picture URL`}
          onChangeText={(text) => setPic(text)}
          value={pic}
        />
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
          disabled={loading}
          onPress={connected ? handle : () => setVisible(true)}
          content={t`Save`}
          loading={loading}
        />
      </View>
    </WrapModal>
  );
};
