import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type NavigatorTabsParamList = {
  Home: { screen: string; params: Object };
  Profile: { owner?: string };
  Cart: undefined;
  "home-root": undefined;
  "search-result": { domain: string; loadPopular?: boolean };
  "domain-view": { domain: string };
  Search: { screen: string; params: Object };
  "search-profile": { owner: string };
};

export type HomeBottomTabParams = {};

export type searchResultScreenProp = BottomTabNavigationProp<
  NavigatorTabsParamList,
  "search-result"
>;

export type profileScreenProp = BottomTabNavigationProp<
  NavigatorTabsParamList,
  "Profile"
>;

export type domainViewScreenProp = BottomTabNavigationProp<
  NavigatorTabsParamList,
  "domain-view"
>;
