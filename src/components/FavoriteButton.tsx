import { FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { usePublicKeys, useSolanaConnection } from "../hooks/xnft-hooks";
import { registerFavourite } from "@bonfida/name-offers";
import { NAME_OFFERS_ID, getDomainKeySync } from "@bonfida/spl-name-service";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { sendTx } from "../utils/send-tx";
import { useModal } from "react-native-modalfy";
import { useState } from "react";
import { sleep } from "../utils/sleep";
import { isTokenized } from "@bonfida/name-tokenizer";
import { unwrap } from "../utils/unwrap";

export const FavoriteButton = ({
  domain,
  isFav,
  refresh,
}: {
  domain: string;
  isFav: boolean;
  refresh: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { openModal } = useModal();
  const publicKey = usePublicKeys().get("solana");
  const connection = useSolanaConnection();

  const handle = async () => {
    try {
      if (!publicKey || !connection) return;
      setLoading(true);

      const ixs: TransactionInstruction[] = [];

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

      const sig = await sendTx(connection, new PublicKey(publicKey), ixs);
      console.log(sig);

      openModal("Success", {
        msg: `${domain}.sol successfully set as favorite domain name`,
      });
      setLoading(false);
      await sleep(500);
      refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
      openModal("Error", { msg: "Something went wrong - try again" });
    }
  };

  return (
    <TouchableOpacity disabled={isFav} onPress={handle}>
      {loading ? (
        <ActivityIndicator size={21} />
      ) : isFav ? (
        <FontAwesome name="heart" size={22} color="#186FAF" />
      ) : (
        <FontAwesome name="heart-o" size={22} color="#186FAF" />
      )}
    </TouchableOpacity>
  );
};
