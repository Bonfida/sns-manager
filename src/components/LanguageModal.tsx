import { WrapModal } from "./WrapModal";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import tw from "@src/utils/tailwind";
import { Trans, t } from "@lingui/macro";
import { useLanguageContext } from "@src/contexts/LanguageContext";
import { LANGUAGES } from "@src/locales";

export const LanguageModal = ({
  modal: { closeModal },
}: {
  modal: { closeModal: () => void };
}) => {
  const { setLanguage, currentLanguage } = useLanguageContext();

  const handleLanguageSelection = (locale: string) => {
    setLanguage(locale);
    closeModal();
  };

  return (
    <WrapModal closeModal={closeModal} title={t`Change language`}>
      <View style={tw`flex flex-col gap-6 mt-6`}>
        {LANGUAGES.map((e) => {
          return (
            <View
              style={tw`flex flex-row items-center`}
              key={`language-${e.locale}`}
            >
              <TouchableOpacity
                style={tw`flex flex-row items-center`}
                onPress={() => handleLanguageSelection(e.locale)}
              >
                <View
                  style={tw`w-[24px] h-[24px] flex items-center justify-center`}
                >
                  {e.locale === currentLanguage && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={tw.color("brand-primary")}
                    />
                  )}
                </View>

                <Text style={tw`ml-2 text-lg text-content-primary`}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </WrapModal>
  );
};
