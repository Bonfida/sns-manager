import { useRecoilState } from "recoil";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SvgUri, WithLocalSvg } from "react-native-svg";
import { Fragment, useState, useEffect } from "react";
import { useModal } from "react-native-modalfy";
import { Trans, t } from "@lingui/macro";
import { isMobile } from "@src/utils/platform";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { REFERRERS, registerDomainName } from "@bonfida/spl-name-service";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useNavigation } from "@react-navigation/native";
import { profileScreenProp } from "@src/types";
import { cartState } from "@src/atoms/cart";
import { referrerState } from "@src/atoms/referrer";
import tw from "@src/utils/tailwind";
import { FIDA_MINT, tokenList } from "@src/utils/tokens/popular-tokens";
import { getDomainPriceFromName } from "@bonfida/spl-name-service";
import { wrapSol } from "@src/utils/tokens/wrap-sol";
import { unwrapSol } from "@src/utils/tokens/unwrap-sol";
import { chunkIx } from "@src/utils/tx/chunk-tx";
import { tokenIconBySymbol } from "@src/utils/tokens/popular-tokens";
import { useWallet } from "@src/hooks/useWallet";
import { useHandleError } from "@src/hooks/useHandleError";
import { usePyth } from "@src/hooks/usePyth";
import { useSolanaConnection } from "@src/hooks/xnft-hooks";
import { useStorageMap } from "@src/hooks/useStorageMap";
import { OrderSummary } from "@src/components/OrderSummary";
import { Screen } from "@src/components/Screen";
import { UiButton } from "@src/components/UiButton";
import { EmptyState } from "./EmptyState";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";

const getTokenAccountBalance = async (
  connection: Connection,
  key: PublicKey,
): Promise<number> => {
  try {
    const balances = await connection.getTokenAccountBalance(key);
    return balances?.value?.uiAmount || 0;
  } catch (err) {
    return 0;
  }
};

const checkEnoughFunds = async (
  connection: Connection,
  publicKey: PublicKey,
  mint: PublicKey,
  total: number,
) => {
  const ata = getAssociatedTokenAddressSync(mint, publicKey);
  const balances = await getTokenAccountBalance(connection, ata);
  if (mint.equals(NATIVE_MINT)) {
    const sol = (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;
    return sol + balances > total;
  }
  return balances > total;
};

const DEFAULT_SPACE = 0;

type CurrentStep = 1 | 2 | 3;

export const Cart = () => {
  const [referrer] = useRecoilState(referrerState);
  const connection = useSolanaConnection();
  const { publicKey, signAllTransactions, connected, setVisible } = useWallet();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useRecoilState(cartState);
  const pyth = usePyth();
  const [showSuccessScreen, toggleSuccessScreen] = useState(false);
  const [mint, setMint] = useState(tokenList[0].mintAddress);
  const { openModal } = useModal();
  const { setStatus } = useStatusModalContext();
  const [map, actions] = useStorageMap();
  const [currentStep, setStep] = useState<CurrentStep>(1);
  const { handleError } = useHandleError();

  const navigation = useNavigation<profileScreenProp>();

  const discountMul = mint === FIDA_MINT ? 0.95 : 1;
  const totalUsd = cart.reduce(
    (acc, v) => acc + getDomainPriceFromName(v) * discountMul,
    0,
  );

  const price = pyth.data?.get(mint)?.price;

  const total = totalUsd / (price || 1);

  const goSuccessStep = () => {
    setStep(3);
    toggleSuccessScreen(true);
  };

  const handle = async () => {
    if (!connection || !publicKey || !signAllTransactions) return;
    if (
      !(await checkEnoughFunds(
        connection,
        new PublicKey(publicKey),
        new PublicKey(mint),
        total,
      ))
    ) {
      return setStatus({
        status: "error",
        message: t`You do not have enough funds`,
      });
    }

    try {
      setLoading(true);
      let ixs: TransactionInstruction[] = [];

      const buyer = new PublicKey(publicKey);
      const mintKey = new PublicKey(mint);

      const ata = getAssociatedTokenAddressSync(mintKey, buyer);
      for (let d of cart) {
        const [, ix] = await registerDomainName(
          connection,
          d,
          map.get(d) || DEFAULT_SPACE,
          buyer,
          ata,
          mintKey,
          referrer ? REFERRERS[referrer] : undefined,
        );
        ixs.push(...ix);
      }

      // Wrap/Unwrap SOL
      if (NATIVE_MINT.equals(mintKey)) {
        const wrap = await wrapSol(
          connection,
          ata,
          buyer,
          Math.ceil(total * 1.01 * Math.pow(10, 9)),
        );
        const unwrap = unwrapSol(ata, buyer);
        ixs = [...wrap, ...ixs, ...unwrap];
      }

      const chunked = chunkIx(ixs, buyer);
      const { blockhash } = await connection.getLatestBlockhash();
      let txs = chunked.map((e) => new Transaction().add(...e));
      txs.forEach((e) => {
        e.feePayer = buyer;
        e.recentBlockhash = blockhash;
      });

      txs = await signAllTransactions(txs);
      for (let tx of txs) {
        const sig = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(sig);
        console.log(sig);
      }

      setLoading(false);
      goSuccessStep();
    } catch (err) {
      setLoading(false);
      handleError(err);
    }
  };

  useEffect(() => {
    const leaveSuccessPage = () => {
      if (showSuccessScreen) {
        toggleSuccessScreen(false);
        setStep(1);
        setCart([]);
      }
    };

    const unsubscribe = navigation.addListener("blur", leaveSuccessPage);

    return () => {
      unsubscribe();
      leaveSuccessPage();
    };
  }, [navigation, showSuccessScreen, currentStep]);

  if (!cart.length && !showSuccessScreen) return <EmptyState />;

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={tw`h-full`}
    >
      <Screen>
        <RenderStepsNumbers
          currentStep={currentStep}
          setStep={setStep}
          style={tw`h-[24px]`}
        />

        <View
          style={[
            tw`pt-6`,
            // So the "Continue" button will be tied to the bottom of the page
            !isMobile && { height: "calc(100% - 24px)" },
            isMobile && tw`h-[100%] pb-6`,
          ]}
        >
          {currentStep === 1 ? (
            <>
              {cart.length > 1 && (
                <View style={tw`flex flex-row justify-end`}>
                  <TouchableOpacity onPress={() => setCart([])}>
                    <Text style={tw`text-sm text-brand-primary`}>
                      <Trans>Clear all</Trans>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <ScrollView
                showsHorizontalScrollIndicator={false}
                style={tw`mt-2`}
              >
                <FlatList
                  data={cart}
                  scrollEnabled={false}
                  contentContainerStyle={tw`flex flex-col gap-2`}
                  renderItem={({ item }) => (
                    <View
                      key={item}
                      style={tw`flex flex-row items-center justify-between px-4 py-3 bg-background-secondary rounded-xl`}
                    >
                      <View style={tw`flex flex-col`}>
                        <Text style={tw`font-semibold`}>{item}.sol</Text>

                        <View style={tw`flex flex-row items-center py-1`}>
                          <Text style={tw`mr-2 text-xs text-content-secondary`}>
                            <Trans>Storage:</Trans>
                            {` `}
                            {(map.get(item) || DEFAULT_SPACE) / 1_000}kB
                          </Text>

                          <TouchableOpacity
                            onPress={() =>
                              openModal("DomainSizeModal", {
                                set: actions.set,
                                map,
                                domain: item,
                              })
                            }
                          >
                            <View style={tw`flex flex-row items-center gap-1`}>
                              <Text style={tw`text-sm text-brand-primary`}>
                                <Trans>Edit</Trans>
                              </Text>

                              <MaterialIcons
                                name="edit"
                                size={14}
                                color={tw.color("brand-primary")}
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={tw`flex flex-row items-center gap-6`}>
                        <View style={tw`flex flex-row items-center gap-1`}>
                          <Image
                            style={tw`h-[16px] w-[16px]`}
                            source={{ uri: tokenIconBySymbol("USDC") }}
                            resizeMode="contain"
                          />

                          <Text
                            style={tw`text-sm font-medium text-content-primary`}
                          >
                            {getDomainPriceFromName(item)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            setCart((prev) => prev.filter((e) => e !== item))
                          }
                          style={tw`flex items-center justify-center w-8 h-8 border rounded-md border-brand-primary`}
                        >
                          <Feather
                            name="trash"
                            size={20}
                            color={tw.color("brand-primary")}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </ScrollView>
              <Text style={tw`my-2 text-xs text-content-secondary`}>
                {t`Discounts may be applied in the next step`}
              </Text>
              <View>
                <UiButton onPress={() => setStep(2)} content={t`Continue`} />
              </View>
            </>
          ) : (
            <></>
          )}

          {currentStep === 2 ? (
            <>
              <Text style={tw`mt-4 mb-2 text-xl font-bold`}>
                <Trans>Pay with</Trans>
              </Text>
              <View style={tw`flex flex-row flex-wrap items-center gap-4`}>
                {tokenList.map((e) => {
                  const selected = e.mintAddress === mint;
                  const url = tokenIconBySymbol(e.tokenSymbol);
                  const isSvg = url?.includes(".svg");

                  return (
                    <TouchableOpacity
                      onPress={() => setMint(e.mintAddress)}
                      style={[
                        tw`border-2 border-[#D0C8FF] rounded-lg py-2 w-[70px] flex items-center justify-center relative`,
                        selected &&
                          tw`border-brand-primary bg-brand-primary bg-opacity-15`,
                      ]}
                      key={e.mintAddress}
                    >
                      <View style={tw`flex flex-row items-center gap-1`}>
                        {/* On the web SvgUri is not working */}
                        {isMobile && isSvg ? (
                          <SvgUri
                            style={tw`rounded-full`}
                            width={20}
                            height={20}
                            uri={String(url)}
                          />
                        ) : (
                          <Image
                            style={tw`h-[20px] w-[20px] rounded-full`}
                            source={{ uri: url }}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={tw`text-xs text-content-primary`}>
                          {e.tokenSymbol}
                        </Text>
                      </View>
                      {e.mintAddress === FIDA_MINT && (
                        <Text
                          style={tw`px-1 text-white text-xs bg-content-success absolute top-[-6px] right-[-6px] rounded`}
                        >
                          5%
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={tw`mt-auto`}>
                <OrderSummary mint={mint} total={total} totalUsd={totalUsd} />
              </View>
              <View>
                <UiButton
                  onPress={connected ? handle : () => setVisible(true)}
                  disabled={loading || cart.length === 0}
                  content={t`Confirm and pay`}
                />
              </View>
            </>
          ) : (
            <></>
          )}

          {currentStep === 3 ? (
            <>
              <View style={tw`flex flex-row justify-center`}>
                {isMobile ? (
                  <WithLocalSvg
                    style={tw`opacity-60`}
                    width={120}
                    height={120}
                    asset={require("@assets/icons/celebrate.svg")}
                  />
                ) : (
                  <Image
                    source={require("@assets/icons/celebrate.svg")}
                    style={tw`w-[120px] h-[120px] opacity-60`}
                  />
                )}
              </View>
              <Text
                style={tw`mt-10 text-lg font-bold text-center text-content-primary`}
              >
                <Trans>Congrats on purchasing new domains!</Trans>
              </Text>
              <Text
                style={tw`mt-6 text-sm font-medium text-center text-content-secondary`}
              >
                <Trans>
                  You can enjoy the full benefits of owning a domain now. Get
                  started by filling in the profiles attached to the domains.
                </Trans>
              </Text>
              <View style={tw`mt-auto`}>
                <UiButton
                  onPress={() => navigation.navigate("Profile", {})}
                  content={t`Get started with my profiles`}
                />
              </View>
            </>
          ) : (
            <></>
          )}
        </View>
      </Screen>
    </ScrollView>
  );
};

const RenderStepsNumbers = ({
  currentStep,
  setStep,
  style,
}: {
  currentStep: CurrentStep;
  style: object;
  setStep: (step: CurrentStep) => void;
}) => {
  const steps: { value: CurrentStep; label: string }[] = [
    { value: 1, label: t`Your domains` },
    { value: 2, label: t`Payment` },
    { value: 3, label: t`Confirmation` },
  ];
  return (
    <View style={[tw`flex flex-row items-center justify-between gap-2`, style]}>
      {steps.map((item, index) => (
        <Fragment key={item.label}>
          <View style={tw`flex flex-row items-center justify-between gap-2`}>
            <TouchableOpacity
              onPress={() => setStep(item.value)}
              disabled={currentStep <= item.value || currentStep === 3}
              style={tw`flex flex-row items-center gap-2`}
            >
              <View
                style={[
                  tw`flex items-center justify-center w-6 h-6 border rounded-full border-brand-primary text-brand-primary`,
                  currentStep >= item.value && tw`bg-brand-primary`,
                ]}
              >
                <Text
                  style={[
                    tw`text-[11px]`,
                    currentStep >= item.value && tw`text-white`,
                  ]}
                >
                  {currentStep > item.value ? (
                    <Feather name="check" size={14} color="white" />
                  ) : (
                    item.value
                  )}
                </Text>
              </View>
              <Text style={tw`text-[11px]`}>{item.label}</Text>
            </TouchableOpacity>
          </View>
          {index !== steps.length - 1 ? (
            <View style={tw`flex-1 border-b border-brand-primary`} />
          ) : null}
        </Fragment>
      ))}
    </View>
  );
};
