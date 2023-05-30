import { useRecoilState } from "recoil";
import { referrerState } from "../atoms/referrer";
import { useEffect } from "react";
import { Platform } from "react-native";
import { REFERRERS } from "@bonfida/spl-name-service";

export const useReferrer = () => {
  const [, setReferrer] = useRecoilState(referrerState);

  useEffect(() => {
    if (Platform.OS === "web") {
      const url = new URL(window.location.href);
      const ref = parseInt(url.searchParams.get("ref") || "");
      if (!!ref && ref >= 0 && ref < REFERRERS.length) {
        setReferrer(ref);
      }
    }
  }, []);
};
