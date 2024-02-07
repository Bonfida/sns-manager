import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export enum QueryKeys {
  domainsList = "domains-list",
  domainInfo = "domain-info",
  favoriteDomain = "favorite-domain",
  subdomains = "subdomains",
  subdomainsFromUser = "subdomains-from-user",
  userProgressBar = "user-progress-bar",
}
