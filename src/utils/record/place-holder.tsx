import { Record } from "@bonfida/spl-name-service";

export const getPlaceholder = (x: Record) => {
  switch (x) {
    // Socials
    case Record.Backpack:
      return "Enter your Backpack username";
    case Record.Discord:
      return "Enter your Discord username";
    case Record.Email:
      return "Enter your email address";
    case Record.Github:
      return "Enter your Github username";
    case Record.Reddit:
      return "Enter your Reddit username";
    case Record.Telegram:
      return "Enter your Telegram username";
    case Record.Twitter:
      return "Enter your Twitter username";
    case Record.Url:
      return "Enter your website URL";

    // Addresses
    case Record.BSC:
      return "Enter your BNB address";
    case Record.BTC:
      return "Enter your Bitcoin address";
    case Record.ETH:
      return "Enter your Ethereum address";
    case Record.LTC:
      return "Enter your Litecoin address";
    case Record.Injective:
      return "Enter your Injective address";

    default:
      return `Enter your ${x} record`;
  }
};
