import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { isXnft, isWeb } from "@src/utils/platform";
import { URL } from "@src/utils/rpc";

require("@solana/wallet-adapter-react-ui/styles.css");

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(() => [], []);
  if (isWeb) {
    return (
      <ConnectionProvider endpoint={URL}>
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }
  return <>{children}</>;
};
