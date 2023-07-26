import { Record } from "@bonfida/spl-name-service";
import { t } from "@lingui/macro";

export const getPlaceholder = (x: Record) => {
  switch (x) {
    // Socials
    case Record.Backpack:
      return t`Enter your Backpack username`;
    case Record.Discord:
      return t`Enter your Discord username`;
    case Record.Email:
      return t`Enter your email address`;
    case Record.Github:
      return t`Enter your Github username`;
    case Record.Reddit:
      return t`Enter your Reddit username`;
    case Record.Telegram:
      return t`Enter your Telegram username`;
    case Record.Twitter:
      return t`Enter your Twitter username`;
    case Record.Url:
      return t`Enter your website URL`;

    // Addresses
    case Record.BSC:
      return t`Enter your BNB address`;
    case Record.BTC:
      return t`Enter your Bitcoin address`;
    case Record.ETH:
      return t`Enter your Ethereum address`;
    case Record.LTC:
      return t`Enter your Litecoin address`;
    case Record.Injective:
      return t`Enter your Injective address`;
    case Record.DOGE:
      return t`Enter your Dogecoin address`;

    default:
      return t`Enter your ${x} record`;
  }
};

// Function to get translated name
export const getTranslatedName = (record: Record) => {
  switch (record) {
    case Record.IPFS:
      return t`IPFS`;
    case Record.ARWV:
      return t`ARWV`;
    case Record.Email:
      return t`Email`;
    case Record.Url:
      return t`Website`;
    case Record.Discord:
      return t`Discord`;
    case Record.Github:
      return t`Github`;
    case Record.Reddit:
      return t`Reddit`;
    case Record.Twitter:
      return t`Twitter`;
    case Record.Telegram:
      return t`Telegram`;
    case Record.Pic:
      return t`Pic`;
    case Record.SHDW:
      return t`SHDW`;
    case Record.POINT:
      return t`POINT`;
    case Record.BSC:
      return t`BSC`;
    case Record.Injective:
      return t`Injective`;
    case Record.Backpack:
      return t`Backpack`;
    default:
      return record;
  }
};
