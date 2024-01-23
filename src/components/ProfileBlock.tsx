import { Text, View, TouchableOpacity, Image } from "react-native";
import { ReactNode, useState } from "react";
import Clipboard from "@react-native-clipboard/clipboard";
import { t } from "@lingui/macro";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useModal } from "react-native-modalfy";
import { useStatusModalContext } from "@src/contexts/StatusModalContext";
import tw from "@src/utils/tailwind";
import { abbreviate } from "@src/utils/abbreviate";
import { useWallet } from "@src/hooks/useWallet";
import { useFavoriteDomain } from "@src/hooks/useFavoriteDomain";
import { useProfilePic } from "@bonfida/sns-react";

interface ProfileBlockProps {
  children?: ReactNode;
  owner: string;
  domain: string;
  picRecord: ReturnType<typeof useProfilePic>;
  isPicValid: boolean;
}

export const ProfileBlock = ({
  owner,
  domain,
  children,
  picRecord,
  isPicValid,
}: ProfileBlockProps) => {
  const { publicKey } = useWallet();
  const { setStatus } = useStatusModalContext();
  const isOwner = owner === publicKey?.toBase58();
  const favorite = useFavoriteDomain(owner);
  const { openModal } = useModal();
  const [containerWidth, setContainerWidth] = useState(0);

  return (
    <LinearGradient
      colors={[
        tw.color("brand-primary") as string,
        tw.color("brand-accent") as string,
      ]}
      style={tw`mt-15 p-3 pt-[50px] rounded-[20px] relative`}
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
    >
      <View
        style={[
          tw`w-[100px] h-[100px] absolute top-[-60px]`,
          // We cannot use calc(50% - 50px) because of react-native limitations
          { left: containerWidth / 2 - 50 },
        ]}
      >
        <Image
          source={
            isPicValid
              ? { uri: picRecord.result }
              : require("@assets/default-pic.png")
          }
          style={tw`w-full h-full rounded-full`}
        />
        {isOwner && (
          <TouchableOpacity
            onPress={() =>
              openModal("EditPicture", {
                currentPic: picRecord.result,
                domain: domain,
                setAsFav: !favorite.result?.reverse,
                refresh: picRecord.execute,
              })
            }
            style={tw`h-[24px] w-[24px] rounded-full flex items-center justify-center absolute bottom-0 right-0 bg-brand-accent`}
          >
            <FontAwesome name="camera" size={12} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={tw`flex flex-col items-center w-full`}>
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(`${domain}.sol`);
            setStatus({ status: "success", message: t`Copied!` });
          }}
          style={tw`flex flex-row items-center justify-center gap-2`}
        >
          <Text style={tw`text-lg font-semibold text-white`}>{domain}.sol</Text>

          <Feather name="copy" size={12} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(owner as string);
            setStatus({ status: "success", message: t`Copied!` });
          }}
          style={tw`flex flex-row items-center justify-center gap-2`}
        >
          <Text style={tw`text-xs text-[#D7D9FF]`}>
            {abbreviate(owner, 10, 5)}
          </Text>
          <Feather name="copy" size={9} color="#D7D9FF" />
        </TouchableOpacity>
      </View>

      {children && <View style={tw`mt-3`}>{children}</View>}
    </LinearGradient>
  );
};
