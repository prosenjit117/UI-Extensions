import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheetManager } from "styled-components";
import { IntlProvider } from "react-intl";
import useMarketplaceContext from "../../hooks/useMarketplaceContext";
import MarketplaceContextProvider from "../../providers/MarketplaceContextProvider";
import App from "../App/index";
import messagesEn from "../../translations/en.json";
import MantineProviderWrapper from "../../providers/MantineProvider/MantineProvider";

const messages = {
  en: messagesEn,
  "en-US": messagesEn,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
      refetchOnWindowFocus: false,
      staleTime: 3000,
    },
  },
});

const RootApp = (): JSX.Element => {
  const { locale } = useMarketplaceContext();

  const styleTarget = document.getElementById("microui-app-styles") || document.head;
  
  return (
    <MantineProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <StyleSheetManager target={styleTarget}>
          <IntlProvider
            locale={locale || "en"}
            defaultLocale="en"
            messages={messages[locale as keyof typeof messages] || messagesEn}
          >
            <App />
          </IntlProvider>
        </StyleSheetManager>
      </QueryClientProvider>
    </MantineProviderWrapper>
  );
};

const Root = (): JSX.Element => {
  return (
    <MarketplaceContextProvider>
      <RootApp />
    </MarketplaceContextProvider>
  );
};

export default Root;
