import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";
import tw from "@src/utils/tailwind";
import { useStorageMap } from "@src/hooks/useStorageMap";
import { WrapModal } from "./WrapModal";

const LIST = [
  { label: "1kb", value: 1_000 },
  { label: "2kb", value: 2_000 },
  { label: "3kb", value: 3_000 },
  { label: "4kb", value: 4_000 },
  { label: "5kb", value: 5_000 },
  { label: "6kb", value: 6_000 },
  { label: "7kb", value: 7_000 },
  { label: "8kb", value: 8_000 },
  { label: "9kb", value: 9_000 },
  { label: "10kb", value: 10_000 },
];

export const DomainSizeModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const [map, actions] = useStorageMap();
  const domain = getParam<string>("domain");

  useEffect(() => {
    if (!map.get(domain)) {
      actions.set(domain, 1_000);
    }
  }, []);

  return (
    <WrapModal
      closeModal={closeModal}
      title={
        <>
          <MaterialCommunityIcons
            name="content-save"
            size={24}
            color="#16a34a"
          />
          <Trans>Storage Size</Trans>
        </>
      }
    >
      <Text style={tw`mt-2 text-sm`}>
        <Trans>
          The storage size will determine the maximum amount of data you can
          store on your domain.
        </Trans>
      </Text>
      <Text style={tw`mt-2 text-xs`}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          style={tw`mr-1`}
          color={tw.color("content-warning")}
        />
        <Trans>
          Each additional kb of memory costs around 0.007 SOL (0.001 USDC)
        </Trans>
      </Text>

      <View style={tw`flex flex-row flex-wrap items-center gap-3 mt-3`}>
        {LIST.map((e) => {
          const selected = e.value === map.get(domain);
          return (
            <TouchableOpacity
              onPress={() => {
                actions.set(domain, e.value);
                closeModal();
              }}
              style={[
                tw`border-[2px] border-black/10 rounded-lg px-5 py-2`,
                selected && {
                  borderColor: tw.color("brand-primary"),
                  borderWidth: 2,
                },
              ]}
              key={e.label}
            >
              <Text>{e.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </WrapModal>
  );
};
