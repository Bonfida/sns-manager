import { useMemo } from "react";
import { Transaction, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { useAuthorization } from "@src/providers/android/AuthorizationProvider";

export type Tx = Transaction | VersionedTransaction;

export const useMobilePlatformWallet = () => {
  const { authorizeSession, selectedAccount } = useAuthorization();

  async function signAllTransactions<T extends Tx>(
    transactions: T[]
  ): Promise<T[]> {
    return transact(async (wallet) => {
      await authorizeSession(wallet);

      return wallet.signTransactions({ transactions: transactions });
    });
  }

  async function signTransaction<T extends Tx>(transaction: T): Promise<T> {
    return transact(async (wallet) => {
      await authorizeSession(wallet);

      try {
        const result = await wallet.signTransactions({
          transactions: [transaction],
        });
        return result[0];
      } catch (err) {
        console.log(err);
        throw err;
      }
    });
  }

  async function signMessage(message: Uint8Array): Promise<Uint8Array> {
    return transact(async (wallet) => {
      const authorizationResult = await authorizeSession(wallet);

      const result = await wallet.signMessages({
        addresses: [authorizationResult.address],
        payloads: [message],
      });

      return result[0];
    });
  }

  const res = useMemo(() => {
    console.log("calling for memo selectedAccount", selectedAccount);

    return {
      connected: !!selectedAccount,
      publicKey: selectedAccount
        ? new PublicKey(selectedAccount.publicKey)
        : undefined,
      signTransaction,
      signAllTransactions,
      signMessage: selectedAccount ? signMessage : undefined,
      setVisible: (x: boolean) => console.log("No need for setVisible"),
      visible: false,
    };
  }, [selectedAccount]);

  return res;
};

export const useWallet = useMobilePlatformWallet;
