import { ReactNode } from "react";
import { URL } from "@src/utils/rpc";
import { ConnectionProvider } from "@src/providers/android/ConnectionProvider";
import { AuthorizationProvider } from "@src/providers/android/AuthorizationProvider";

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ConnectionProvider endpoint={URL}>
        <AuthorizationProvider>{children}</AuthorizationProvider>
      </ConnectionProvider>
    </>
  );
};
