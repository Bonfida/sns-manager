import { useMemo } from "react";
import { Transaction, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { useHandleError } from "@src/hooks/useHandleError";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { useAuthorization } from "@src/providers/android/AuthorizationProvider";

export type Tx = Transaction | VersionedTransaction;

export const useMobilePlatformWallet = () => {
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { handleError } = useHandleError();

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
      try {
        await authorizeSession(wallet);

        const result = await wallet.signTransactions({
          transactions: [transaction],
        });
        return result[0];
      } catch (err) {
        handleError(err);
        throw err;
      }
    });
  }

  async function signMessage(
    message: Uint8Array
  ): Promise<Uint8Array | undefined> {
    return transact(async (wallet) => {
      try {
        const authorizationResult = await authorizeSession(wallet);

        const result = await wallet.signMessages({
          addresses: [authorizationResult.address],
          payloads: [message],
        });

        return result[0];
      } catch (err) {
        handleError(err);
      }
    });
  }

  async function authorize() {
    await transact(async (wallet) => {
      try {
        await authorizeSession(wallet);
      } catch (err) {
        handleError(err);
      }
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
      // We just need to call for `authorize` and @solana-mobile/mobile-wallet-adapter-protocol-web3js
      // will automatically open the wallet if user has only 1 wallet on his device,
      // and will open a "select wallet" screen if user has multiple wallets on his device
      setVisible: (x: boolean) => authorize(),
      visible: false,
    };
  }, [selectedAccount]);

  return res;
};

export const useWallet = useMobilePlatformWallet;
