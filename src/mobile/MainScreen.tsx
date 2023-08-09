import { useState, useCallback } from "react";
import { View, Text, Alert, Button } from "react-native";
import { useConnection } from "@src/mobile/ConnectionProvider";
import { useAuthorization } from "@src/mobile/AuthorizationProvider";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

export const MainScreen = () => {
  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [authorizationInProgress, setAuthorizationInProgress] = useState(false);
  const handleConnectPress = useCallback(async () => {
    try {
      if (authorizationInProgress) {
        return;
      }
      setAuthorizationInProgress(true);
      await transact(async (wallet) => {
        await authorizeSession(wallet);
      });
    } catch (err: any) {
      Alert.alert(
        "Error during connect",
        err instanceof Error ? err.message : err,
        [{ text: "Ok", style: "cancel" }]
      );
    } finally {
      setAuthorizationInProgress(false);
    }
  }, [authorizationInProgress, authorizeSession]);

  return (
    <View>
      <Text>Selected cluster: {connection.rpcEndpoint}</Text>
      <Button
        title="Connect account"
        disabled={authorizationInProgress}
        onPress={handleConnectPress}
      />
    </View>
  );
};
