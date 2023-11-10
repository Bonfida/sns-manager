import { Platform } from "react-native";

export const isXnft = process.env.XNFT === "true";

export const isWeb = process.env.WEB === "true";

export const isMobile = Platform.OS === "android" || Platform.OS === "ios";
