import { useRecoilState } from "recoil";
import { referrerState } from "../atoms/referrer";
import { useEffect } from "react";
import { Platform } from "react-native";

// Referrer name -> referrer index
const map = new Map<string, number>([["4everland", 1]]);

export const useReferrer = () => {
  const [, setReferrer] = useRecoilState(referrerState);

  useEffect(() => {
    if (Platform.OS === "web") {
      const url = new URL(window.location.href);
      const key = url.searchParams.get("ref") || "";
      const value = map.get(key);
      if (!!value) {
        setReferrer(value);
      }
    }
  }, []);
};
