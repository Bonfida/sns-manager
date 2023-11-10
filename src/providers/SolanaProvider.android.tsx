import { ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { URL } from "@src/utils/rpc";
import { ConnectionProvider } from "@src/providers/android/ConnectionProvider";
import { AuthorizationProvider } from "@src/providers/android/AuthorizationProvider";

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <StatusBar hidden />

      <ConnectionProvider endpoint={URL}>
        <AuthorizationProvider>{children}</AuthorizationProvider>
      </ConnectionProvider>
    </>
  );
};
