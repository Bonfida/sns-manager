import {
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  View,
} from "react-native";
import { ReactNode, useState } from "react";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { WrapModal } from "./WrapModal";
import tw from "@src/utils/tailwind";
import { UiButton } from "@src/components/UiButton";

type Steps = 1 | 2 | 3 | 4;

const stepsImages: Record<
  Steps,
  { image: ImageSourcePropType; text: () => string; icon: ReactNode }
> = {
  1: {
    image: require("@assets/onboading/favorite-domain.png"),
    text: () =>
      t`Click the star icon to select your favorite profile. Keep track of your main profile's completion progress with the profile completion bar.`,
    icon: <AntDesign name="star" size={24} color={tw.color("brand-primary")} />,
  },
  2: {
    image: require("@assets/onboading/engaging-profile.png"),
    text: () =>
      t`Create an engaging profile by adding links Twitter, Discord and Telegram to connect with like-minded individuals.`,
    icon: (
      <Ionicons
        style={{ transform: [{ scaleX: -1 }] }}
        name="chatbubble-ellipses-sharp"
        size={24}
        color="#9470CC"
      />
    ),
  },
  3: {
    image: require("@assets/onboading/add-profile-pic.png"),
    text: () =>
      t`Add a profile pic that represents you. It can be a photo of yourself, your favourite NFT or something that inspires you.`,
    icon: <Ionicons name="camera-sharp" size={24} color="#F391BD" />,
  },
  4: {
    image: require("@assets/onboading/connect-backpack.png"),
    text: () => t`Connect your backpack username to your on-chain identity.`,
    icon: <MaterialIcons name="backpack" size={24} color="#E20505" />,
  },
};

export const ProgressExplainerModal = ({
  modal: { closeModal },
}: {
  modal: { closeModal: () => void };
}) => {
  const [currentStep, setCurrentStep] = useState<Steps>(1);

  return (
    <WrapModal
      closeModal={closeModal}
      title={<Trans>How to boost your profile?</Trans>}
    >
      <View style={tw`flex items-center mt-3`}>
        <Image
          style={tw`w-[230px] h-[350px] mx-auto`}
          resizeMode="contain"
          source={stepsImages[currentStep].image}
        />

        <View style={tw`flex flex-row items-start gap-2 mt-2`}>
          {stepsImages[currentStep].icon}

          <Text style={tw`text-sm font-medium`}>
            {stepsImages[currentStep].text()}
          </Text>
        </View>
      </View>

      <View style={tw`flex flex-row justify-center mt-4`}>
        {new Array(4).fill(0).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setCurrentStep((i + 1) as Steps);
            }}
            style={tw`flex items-center justify-center w-[24px] h-[24px]`}
          >
            <View
              style={[
                tw`w-[6px] h-[6px] rounded-full border border-[#CBD5E0]`,
                currentStep === i + 1 && tw`bg-[#CBD5E0]`,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={tw`flex flex-row items-center justify-between mt-4`}>
        <TouchableOpacity onPress={closeModal}>
          <Text style={tw`text-lg font-semibold text-brand-primary`}>
            <Trans>Skip</Trans>
          </Text>
        </TouchableOpacity>

        <View style={tw`flex-initial`}>
          {currentStep === 4 ? (
            <UiButton onPress={closeModal} content={t`Close`} />
          ) : (
            <UiButton
              onPress={() => {
                setCurrentStep((currentStep + 1) as Steps);
              }}
              content={t`Next`}
            />
          )}
        </View>
      </View>
    </WrapModal>
  );
};
