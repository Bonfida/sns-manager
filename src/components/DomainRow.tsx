import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import tw from "@src/utils/tailwind";
import { SubdomainResult } from "@src/hooks/useSubdomains";
import {
  DomainRowRecord,
  DomainRowRecordProps,
} from "@src/components/DomainRowRecord";

type DomainRowProps = Pick<
  DomainRowRecordProps,
  "domain" | "isFav" | "refresh" | "isOwner" | "callback"
> & {
  subdomains?: SubdomainResult[];
};

export const DomainRow = ({
  domain,
  subdomains = [],
  ...rest
}: DomainRowProps) => {
  const [isExpanded, setExpandedState] = useState(false);

  return (
    <View
      style={tw`px-4 py-3 my-1 border-0 rounded-xl bg-background-secondary`}
    >
      <DomainRowRecord {...rest} domain={domain} />

      {!!subdomains.length && (
        <>
          <TouchableOpacity
            style={[
              tw`flex flex-row items-center gap-2 mt-5`,
              isExpanded && tw`mb-5`,
            ]}
            onPress={() => setExpandedState(!isExpanded)}
          >
            <Ionicons
              name="layers"
              size={16}
              color={tw.color("brand-primary")}
            />
            <Text style={tw`text-base text-brand-primary`}>
              <Trans>Subdomains ({subdomains.length})</Trans>
            </Text>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={tw.color("brand-primary")}
            />
          </TouchableOpacity>

          <View style={[!isExpanded && tw`hidden`]}>
            {subdomains.map((item) => (
              <DomainRowRecord
                key={item.subdomain}
                {...rest}
                domain={item.subdomain}
                isSubdomain
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};
