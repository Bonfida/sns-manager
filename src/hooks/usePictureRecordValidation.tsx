import { useEffect, useState } from "react";
import axios from "axios";

export const usePictureRecordValidation = (pic: string | null | undefined) => {
  const [isValid, setValidStatus] = useState(false);
  const checkValidity = async () => {
    try {
      setValidStatus(false);
      if (!pic) return;
      await axios.get(pic);
      setValidStatus(true);
    } catch {}
  };
  useEffect(() => {
    checkValidity();
  }, [pic]);

  return {
    isValid,
  };
};
