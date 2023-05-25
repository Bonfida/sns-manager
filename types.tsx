import { RootBottomTabParamList } from "./src/App";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type searchResultScreenProp = BottomTabNavigationProp<
  RootBottomTabParamList,
  "Search Result"
>;

export type profileScreenProp = BottomTabNavigationProp<
  RootBottomTabParamList,
  "Profile"
>;

export type domainViewScreenProp = BottomTabNavigationProp<
  RootBottomTabParamList,
  "Domain View"
>;
