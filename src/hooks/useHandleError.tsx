import { WalletError } from "@solana/wallet-adapter-base";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";

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

    setStatus({ status: "error", message: errorMessage });
  };

  return { handleError };
};
