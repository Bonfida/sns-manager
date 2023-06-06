window.Buffer = window.Buffer || require("buffer").Buffer;
global.Buffer = global.Buffer || require("buffer").Buffer;

import { registerRootComponent } from "expo";
import { RecoilRoot, useRecoilState } from "recoil";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFonts, AzeretMono_400Regular } from "@expo-google-fonts/dev";
import { HomeScreen } from "./screens/HomeScreen";
import { ProfileScreen } from "./screens/Profile";
import { Feather } from "@expo/vector-icons";
import { SearchResult } from "./screens/SearchResult";
import { cartState } from "./atoms/cart";
import { Text } from "react-native";
import tw from "./utils/tailwind";
import { Cart } from "./screens/Cart";
import { ModalProvider, createModalStack } from "react-native-modalfy";
import { createStackNavigator } from "@react-navigation/stack";
import { DomainView } from "./screens/DomainView";
import { SuccessCheckoutModal } from "./components/SuccessCheckoutModal";
import { EditRecordModal } from "./components/EditRecordModal";
import { ErrorModal } from "./components/ErrorModal";
import { SuccessModal } from "./components/SuccessModal";
import { TransferModal } from "./components/TransferModal";
import { WormholeExplainerModal } from "./components/WormholeExplainerModal";
import { EditPicture } from "./components/EditPicture";
import { ProgressExplainerModal } from "./components/ProgressExplainerModal";
import { SearchModal } from "./components/SearchModal";
import { DiscountExplainerModal } from "./components/DiscountExplainerModal";
import { isXnft, isMobile, isWeb } from "./utils/platform";
import { ReactNode, useEffect, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "./hooks/useWallet";
import { URL } from "./utils/rpc";
import { useReferrer } from "./hooks/useReferrer";
import { DomainSizeModal } from "./components/DomainSizeModal";
// import xnftjson from "../xnft.json";

const xnftjson = require("../xnft.json");

console.log(`Version: ${xnftjson.version}`);

const Stack = createStackNavigator<RootBottomTabParamList>();

const modalConfig = {
  SuccessCheckout: SuccessCheckoutModal,
  EditRecordModal,
  Error: ErrorModal,
  Success: SuccessModal,
  Transfer: TransferModal,
  WormholeExplainer: WormholeExplainerModal,
  EditPicture: EditPicture,
  ProgressExplainerModal: ProgressExplainerModal,
  SearchModal: SearchModal,
  DiscountExplainerModal: DiscountExplainerModal,
  DomainSizeModal: DomainSizeModal,
};

const stackModal = createModalStack(modalConfig);

export type RootBottomTabParamList = {
  Home: undefined;
  Profile: { owner?: string };
  Cart: undefined;
  "Search Result": { domain: string };
  "Domain View": { domain: string };
  Search: { screen: string; params: Object };
  "Search Profile": { owner: string };
};

const Tab = createBottomTabNavigator<RootBottomTabParamList>();

const SearchNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ header: () => null }}>
      <Stack.Screen
        name="Search Result"
        children={({ route }) => <SearchResult domain={route.params?.domain} />}
      />
      <Stack.Screen
        name="Domain View"
        children={({ route }) => <DomainView domain={route.params?.domain} />}
      />
      <Stack.Screen
        name="Search Profile"
        children={({ route }) => <ProfileScreen owner={route.params.owner} />}
      />
    </Stack.Navigator>
  );
};

function TabNavigator() {
  useReferrer();
  const [cart] = useRecoilState(cartState);
  const { publicKey, setVisible, connected } = useWallet();

  useEffect(() => {
    console.table(isMobile, isXnft, isWeb);
    if (isXnft) return;
    if (!connected) {
      setVisible(true);
    }
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: () => null,
        tabBarActiveTintColor: "#186FAF",
      }}
    >
      <Tab.Screen
        name="Profile"
        initialParams={{ owner: publicKey?.toBase58() }}
        children={({ route }) => <ProfileScreen owner={route.params.owner} />}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            if (!connected) {
              return setVisible(true);
            }
            navigation.navigate("Profile", { owner: publicKey?.toBase58() });
          },
        })}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Search", {
              screen: "Search Result",
              domain: "",
            });
          },
        })}
        options={{
          headerShown: false,
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: ({ color, size }) => (
            <View style={tw`relative`}>
              <Feather name="shopping-cart" size={size} color={color} />
              {cart.length !== 0 ? (
                <Text
                  style={tw`absolute -top-1 text-white -right-2 bg-red-400 rounded-full font-bold h-[15px] text-center text-xs w-[16px]`}
                >
                  {cart.length}
                </Text>
              ) : null}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  let [fontsLoaded] = useFonts({
    Azeret: AzeretMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Wrap>
      <RecoilRoot>
        <NavigationContainer>
          <ModalProvider stack={stackModal}>
            <TabNavigator />
          </ModalProvider>
        </NavigationContainer>
      </RecoilRoot>
    </Wrap>
  );
}

const Wrap = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(() => [], []);
  if (isXnft) {
    return <>{children}</>;
  }
  if (isWeb) {
    return (
      <ConnectionProvider endpoint={URL}>
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }
  if (isMobile) {
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

export default registerRootComponent(App);
