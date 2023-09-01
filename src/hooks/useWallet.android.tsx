import { useMemo } from "react";
import throttle from "lodash/throttle";
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
    try {
      return transact(async (wallet) => {
        await authorizeSession(wallet);

        return wallet.signTransactions({ transactions: transactions });
      });
    } catch (err) {
      handleError(err);
      return [];
    }
  }

  async function signTransaction<T extends Tx>(
    transaction: T
  ): Promise<T | undefined> {
    try {
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
    } catch (err) {
      handleError(err);
    }
  }

  async function signMessage(
    message: Uint8Array
  ): Promise<Uint8Array | undefined> {
    try {
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
    } catch (err) {
      handleError(err);
    }
  }

  async function authorize() {
    try {
      await transact(async (wallet) => {
        try {
          await authorizeSession(wallet);
        } catch (err) {
          handleError(err);
        }
      });
    } catch (err) {
      handleError(err);
    }
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
      // 1. We just need to call for `authorize` and @solana-mobile/mobile-wallet-adapter-protocol-web3js
      // will automatically open the wallet if user has only 1 wallet on his device,
      // and will open a "select wallet" screen if user has multiple wallets on his device
      // 2. We need to throttle because if user will call "authorize" super fast and lot of times,
      // then SolanaWalletMobile will throw a native-code error which we cannot handle
      // by try/catch (dunno why)
      // https://github.com/solana-mobile/mobile-wallet-adapter/issues/541
      setVisible: throttle(authorize, 3000),
      visible: false,
    };
  }, [selectedAccount]);

  return res;
};

export const useWallet = useMobilePlatformWallet;
