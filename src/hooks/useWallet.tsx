import { Transaction, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { useDidLaunch, usePublicKeys } from "./xnft-hooks";
import { isXnft } from "../utils/platform";
import { useWallet as useWalletAdapterReact } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

export type Tx = Transaction | VersionedTransaction;

function signAllTransactions<T extends Tx>(e: T[]): Promise<T[]> {
  return window.xnft.solana.signAllTransactions(e);
}

function signTransaction<T extends Tx>(transaction: T): Promise<T> {
  return window.xnft.solana.signTransaction(transaction);
}

export const useWalletXnft = () => {
  const publicKey = usePublicKeys().get("solana");
  const didLaunch = useDidLaunch();

  const res = useMemo(() => {
    return {
      connected: !!didLaunch,
      signTransaction: signTransaction,
      publicKey: publicKey ? new PublicKey(publicKey) : undefined,
      signAllTransactions,
      setVisible: (x: boolean) => console.log("No need for setVisible"),
      visible: false,
    };
  }, [didLaunch, publicKey]);

  return res;
};

const useWalletWeb = () => {
  const wallet = useWalletAdapterReact();

  const { visible, setVisible } = useWalletModal();
  return {
    visible,
    setVisible,
    ...wallet,
  };
};

export const useWallet = isXnft ? useWalletXnft : useWalletWeb;
