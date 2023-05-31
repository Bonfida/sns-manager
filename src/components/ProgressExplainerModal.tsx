import { Text, TouchableOpacity, View } from "react-native";
import tw from "../utils/tailwind";
import { Feather } from "@expo/vector-icons";
import { WrapModal } from "./WrapModal";
import { Trans } from "@lingui/macro";

export const ProgressExplainerModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px] relative`}>
        <TouchableOpacity
          style={tw`absolute top-4 right-4`}
          onPress={closeModal}
        >
          <Feather name="x" size={20} color="black" />
        </TouchableOpacity>

        <Text style={tw`text-base font-bold text-center`}>
          <Trans>Boost Your Profile Journey! 🚀</Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            See that cool progress bar at the top? That's your personal guide to
            building a robust and engaging profile. Here's how it works:
          </Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            <Text style={tw`font-bold`}>1. Favorite Domain:</Text> Choose your
            favorite domain by clicking on the ❤️ next to it
          </Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            <Text style={tw`font-bold`}>2. Profile Picture:</Text> Add a pic to
            let us see the real you
          </Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            <Text style={tw`font-bold`}>3. Backpack Record:</Text> Connect your
            Backpack username to your on-chain identity 🎒
          </Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            <Text style={tw`font-bold`}>4. Twitter Record:</Text> Connect
            Twitter for swift sharing and networking 🐦
          </Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            <Text style={tw`font-bold`}>5. Telegram Record:</Text> Link Telegram
            for real-time community chats 📨
          </Trans>
        </Text>

        <Text style={tw`my-2`}>
          <Trans>
            <Text style={tw`font-bold`}>6. Discord Record:</Text> Connect
            Discord and keep conversations flowing 🎮
          </Trans>
        </Text>
      </View>
    </WrapModal>
  );
};
