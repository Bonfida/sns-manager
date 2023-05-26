import { Transaction, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { usePublicKeys } from "./xnft-hooks";
import { isXnft } from "../utils/platform";
import { useWallet as useWalletAdapterReact } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export type Tx = Transaction | VersionedTransaction;

export const useWalletXnft = () => {
  const publicKey = usePublicKeys().get("solana");

  return {
    connected: true,
    signTransaction: window.xnft.solana.signTransaction as
      | (<T extends Tx>(transaction: T) => Promise<T>)
      | undefined,
    publicKey: publicKey ? new PublicKey(publicKey) : undefined,
    signAllTransactions: window.xnft.solana.signAllTransactions as
      | (<T extends Tx>(transactions: T[]) => Promise<T[]>)
      | undefined,
    setVisible: (x: boolean) => console.log("No need for setVisible"),
    visible: false,
  };
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
