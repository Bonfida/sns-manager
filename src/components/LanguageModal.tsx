import { WrapModal } from "./WrapModal";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "../utils/tailwind";
import { FontAwesome } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";
import { useLanguageContext } from "../contexts/LanguageContext";
import { LANGUAGES } from "../locales";

export const LanguageModal = ({
  modal: { closeModal },
}: {
  modal: { closeModal: () => void };
}) => {
  const { setLanguage, currentLanguage } = useLanguageContext();

  const handleLanguageSelection = (locale: string) => {
    setLanguage(locale);
    closeModal(); // Close the modal when a language is selected
  };
  
  return (
    <WrapModal closeModal={closeModal}>
      <View style={tw`bg-white rounded-lg px-4 py-10 w-[350px]`}>
        <View style={tw`flex flex-row items-center`}>
          <FontAwesome name="language" size={24} color="black" />
          <Text style={tw`ml-2 text-lg font-bold`}>
            <Trans>Language</Trans>
          </Text>
        </View>
        <View style={tw`flex flex-col mt-4 ml-5`}>
          {LANGUAGES.map((e) => {
            return (
              <View
                style={tw`flex flex-row items-center mt-1`}
                key={`language-${e.locale}`}
              >
                <TouchableOpacity
                  style={tw`flex flex-row items-center`}
                  onPress={() => handleLanguageSelection(e.locale)} // Update onPress handler
                >
                  <View
                    style={
                      e.locale === currentLanguage
                        ? tw`border-[1px] rounded-full h-[12px] w-[12px] bg-blue-900 border-blue-900`
                        : tw`border-[1px] rounded-full h-[12px] w-[12px] border-blue-900`
                    }
                  />

                  <Text style={tw`ml-1`}>{e.label}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </WrapModal>
  );
};
