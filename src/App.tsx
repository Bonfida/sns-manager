window.Buffer = window.Buffer || require("buffer").Buffer;
global.Buffer = global.Buffer || require("buffer").Buffer;

import { registerRootComponent } from "expo";
import { RecoilRoot, useRecoilState } from "recoil";
import { TouchableOpacity, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from "@react-navigation/bottom-tabs";
import { useFonts, AzeretMono_400Regular } from "@expo-google-fonts/dev";
import { HomeScreen } from "./screens/HomeScreen";
import { ProfileScreen } from "./screens/Profile";
import { Feather } from "@expo/vector-icons";
import { cartState } from "./atoms/cart";
import { Text } from "react-native";
import tw from "./utils/tailwind";
import { Cart } from "./screens/Cart";
import { ModalProvider, createModalStack } from "react-native-modalfy";
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
import { DeleteModal } from "./components/DeleteModal";
import { CreateSubdomainModal } from "./components/CreateSubdomainModal";
import { SuccessSubdomainModal } from "./components/SuccessSubdomainModal";
import { t } from "@lingui/macro";
import { i18n } from "@lingui/core";
import {
  LanguageProvider,
  useLanguageContext,
} from "./contexts/LanguageContext";
import { StatusModalProvider } from "@src/contexts/StatusModalContext";
import { LanguageModal } from "./components/LanguageModal";
import { TokenizeModal } from "./components/TokenizeModal";
import { NavigatorTabsParamList } from "@src/types";
import { LanguageHeader } from "@src/components/Header";

const xnftjson = require("../xnft.json");

console.log(`Version: ${xnftjson.version}`);

const modalConfig = {
  Transfer: TransferModal,
  Delete: DeleteModal,
  CreateSubdomain: CreateSubdomainModal,
  SuccessSubdomainModal: SuccessSubdomainModal,
  WormholeExplainer: WormholeExplainerModal,
  EditPicture: EditPicture,
  ProgressExplainerModal: ProgressExplainerModal,
  SearchModal: SearchModal,
  DiscountExplainerModal: DiscountExplainerModal,
  DomainSizeModal: DomainSizeModal,
  LanguageModal: LanguageModal,
  TokenizeModal: TokenizeModal,
};

const stackModal = createModalStack(modalConfig);

const Tab = createBottomTabNavigator<NavigatorTabsParamList>();

const TabBarLabel = ({ focused }: { focused: boolean }, label: ReactNode) => {
  const style = focused
    ? tw`mt-1 text-sm font-bold`
    : tw`mt-1 text-sm text-content-tertiary`;

  return <Text style={style}>{label}</Text>;
};

function TabNavigator() {
  useReferrer();
  const [cart] = useRecoilState(cartState);
  const { publicKey, setVisible, connected } = useWallet();
  const { currentLanguage } = useLanguageContext();

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
        tabBarActiveTintColor: tw.color("content-primary"),
        tabBarInactiveTintColor: tw.color("content-tertiary"),
        tabBarStyle: tw`h-[60px] bg-background-primary border-t-0 pt-2 pb-1 px-3`,
        tabBarIconStyle: {
          aspectRatio: "1/1",
        },
      }}
      key={currentLanguage} // trigger tab re-render when translation is toggled
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
          tabBarLabel: (props) => TabBarLabel(props, t`Profile`),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
          header: () => <LanguageHeader />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: (props) => TabBarLabel(props, t`Domains`),
          tabBarIcon: ({ color, size }) => (
            <Feather name="globe" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabel: (props) => TabBarLabel(props, t`Cart`),
          tabBarIcon: ({ color, size }) => (
            <View style={tw`relative`}>
              <Feather name="shopping-cart" size={size} color={color} />
              {cart.length !== 0 ? (
                <Text
                  style={tw`absolute -top-1 text-white -right-2 bg-brand-primary rounded-full font-bold h-[15px] text-center text-xs w-[16px]`}
                >
                  {cart.length}
                </Text>
              ) : null}
            </View>
          ),
          header: () => (
            <View style={tw`px-3 py-4 bg-background-primary`}>
              <Text style={tw`text-lg font-semibold text-content-primary`}>
                {t`Cart`}
              </Text>
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
          <LanguageProvider i18n={i18n}>
            <StatusModalProvider>
              <ModalProvider stack={stackModal}>
                <TabNavigator />
              </ModalProvider>
            </StatusModalProvider>
          </LanguageProvider>
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
