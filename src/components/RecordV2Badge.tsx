import { GUARDIANS, Record, SELF_SIGNED } from "@bonfida/spl-name-service";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "react-native-heroicons/solid";
import { WrapModal } from "./WrapModal";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "@src/utils/tailwind";
import { useModal } from "react-native-modalfy";
import { t } from "@lingui/macro";
import { UiButton } from "./UiButton";

export const RecordV2BadgeExplanationModal = ({
  modal: { closeModal, getParam },
}: {
  modal: { closeModal: () => void; getParam: <T>(a: string, b?: string) => T };
}) => {
  const text = getParam<string>("text");
  const title = getParam<string | undefined>("title");

  return (
    <WrapModal title={title} closeModal={closeModal}>
      <Text style={tw`my-2 text-lg font-medium text-center`}>{text}</Text>

      <UiButton outline content={t`Close`} onPress={() => closeModal()} />
    </WrapModal>
  );
};

export const StaleBadge = ({ stale }: { stale: boolean }) => {
  const { openModal } = useModal();
  if (stale) {
    return (
      <TouchableOpacity
        onPress={() =>
          openModal("RecordV2BadgeExplanationModal", {
            text: t`This record is not signed`,
            title: t`Record staleness`,
          })
        }
      >
        <ExclamationTriangleIcon style={tw`text-orange-400 h-[15px]`} />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={() =>
        openModal("RecordV2BadgeExplanationModal", {
          text: t`Signed by the domain owner`,
          title: t`Record staleness`,
        })
      }
    >
      <CheckCircleIcon style={tw`text-green-400 h-[15px]`} />
    </TouchableOpacity>
  );
};

export const RoaBadge = ({ record, roa }: { record: Record; roa: boolean }) => {
  const { openModal } = useModal();
  const roaSupported = SELF_SIGNED.has(record) || GUARDIANS.has(record);

  if (!roaSupported) {
    return (
      <TouchableOpacity
        onPress={() =>
          openModal("RecordV2BadgeExplanationModal", {
            text: t`Record content ownership is not supported for this type of record`,
            title: t`Record Right of Association`,
          })
        }
      >
        <InformationCircleIcon style={tw`text-grey-400 h-[15px]`} />
      </TouchableOpacity>
    );
  }

  if (!roa) {
    return (
      <TouchableOpacity
        onPress={() =>
          openModal("RecordV2BadgeExplanationModal", {
            text: t`Record content ownership is not verified`,
            title: t`Record Right of Association`,
          })
        }
      >
        <ShieldExclamationIcon style={tw`text-red-400 h-[15px]`} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() =>
        openModal("RecordV2BadgeExplanationModal", {
          text: t`Ownership is verified`,
          title: t`Record Right of Association`,
        })
      }
    >
      <ShieldCheckIcon style={tw`text-green-400 h-[15px]`} />
    </TouchableOpacity>
  );
};

export const RecordV2Badge = ({
  record,
  recordDefined,
  roa,
  stale,
}: {
  record: Record;
  recordDefined: boolean;
  roa: boolean;
  stale: boolean;
}) => {
  if (!recordDefined) return null;

  return (
    <View style={tw`flex flex-row items-center`}>
      <StaleBadge stale={stale} />
      <RoaBadge roa={roa} record={record} />
    </View>
  );
};
