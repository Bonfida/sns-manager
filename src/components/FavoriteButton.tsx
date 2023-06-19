import { FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useSolanaConnection } from "../hooks/xnft-hooks";
import { registerFavourite } from "@bonfida/name-offers";
import { NAME_OFFERS_ID, getDomainKeySync } from "@bonfida/spl-name-service";
import { TransactionInstruction } from "@solana/web3.js";
import { sendTx } from "../utils/send-tx";
import { useModal } from "react-native-modalfy";
import { useState } from "react";
import { sleep } from "../utils/sleep";
import { isTokenized } from "@bonfida/name-tokenizer";
import { unwrap } from "../utils/unwrap";
import { t } from "@lingui/macro";
import { useWallet } from "../hooks/useWallet";

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
  const connection = useSolanaConnection();
  const { publicKey, signTransaction, connected, setVisible } = useWallet();

  const handle = async () => {
    try {
      if (!publicKey || !connection || !signTransaction) return;
      setLoading(true);

      const ixs: TransactionInstruction[] = [];

      const { pubkey } = getDomainKeySync(domain);
      if (await isTokenized(connection, pubkey)) {
        console.log("Domain is tokenized, unwraping...");
        const ix = await unwrap(connection, domain, publicKey);
        ixs.push(...ix);
      }

      const ix = await registerFavourite(pubkey, publicKey, NAME_OFFERS_ID);
      ixs.push(...ix);

      const sig = await sendTx(connection, publicKey, ixs, signTransaction);
      console.log(sig);

      openModal("Success", {
        msg: t`${domain}.sol successfully set as favorite domain name`,
      });
      setLoading(false);
      await sleep(500);
      refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
      openModal("Error", { msg: t`Something went wrong - try again` });
    }
  };

  return (
    <TouchableOpacity
      disabled={isFav}
      onPress={connected ? handle : () => setVisible(true)}
    >
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
