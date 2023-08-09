import { useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { TransactionInstruction } from "@solana/web3.js";
import { t } from "@lingui/macro";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import { registerFavourite } from "@bonfida/name-offers";
import { NAME_OFFERS_ID, getDomainKeySync } from "@bonfida/spl-name-service";
import { isTokenized } from "@bonfida/name-tokenizer";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useWallet } from "@src/hooks/useWallet";
import tw from "@src/utils/tailwind";
import { sendTx } from "@src/utils/send-tx";
import { sleep } from "@src/utils/sleep";
import { unwrap } from "@src/utils/unwrap";
import { useHandleError } from "@src/hooks/useHandleError";

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
  const { setStatus } = useStatusModalContext();
  const connection = useSolanaConnection();
  const { handleError } = useHandleError();
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

      setStatus({
        status: "success",
        message: t`${domain}.sol successfully set as favorite domain name`,
      });
      setLoading(false);
      await sleep(500);
      refresh();
    } catch (err) {
      setLoading(false);
      handleError(err);
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
        <AntDesign name="star" size={24} color={tw.color("brand-primary")} />
      ) : (
        <AntDesign
          name="staro"
          size={24}
          color={tw.color("content-tertiary")}
        />
      )}
    </TouchableOpacity>
  );
};
