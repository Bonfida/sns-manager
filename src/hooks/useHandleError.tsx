import { WalletError } from "@solana/wallet-adapter-base";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import { isMobile } from "@src/utils/platform";

export const useHandleError = () => {
  const { setStatus } = useStatusModalContext();

  const handleError = (
    err: any,
    {
      unknownErrorMessage = "Something went wrong - try again",
    }: { unknownErrorMessage?: string } = {}
  ) => {
    console.error(err);

    let errorMessage = unknownErrorMessage;

    if (err instanceof WalletError) {
      errorMessage = err?.error?.message || unknownErrorMessage;
    }
    if (isMobile) {
      errorMessage = err?.message || unknownErrorMessage;
    }

    setStatus({ status: "error", message: errorMessage });
  };

  return { handleError };
};
