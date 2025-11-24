import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Space, Text } from "@mantine/core";
import useMarketplaceContext from "../../hooks/useMarketplaceContext";
import useMarkeplaceAccount from "../../hooks/useMarketplaceAccount";
import serviceAuthToken from "../../functions/serviceAuthToken";
import Table from "../Table";
import Header from "../Header";

interface UserInfo {
  userName: string;
  email: string;
}

const App = (): JSX.Element => {
  const { bootstrap, tenant, locale } = useMarketplaceContext();
  const getAsset = window.get_extension_asset;
  const [userInfo, setUserInfo] = useState<UserInfo>();

  const { data, isSuccess, isError, isLoading } = useMarkeplaceAccount();
  console.log(data, isSuccess, isError, isLoading);

  const callAPI = async (): Promise<void> => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { errorMessage, status, response } =
      await serviceAuthToken.fetchExternalData(
        "/api/auth/v1/sessions/userinfo",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
        5000
      );

    const { userName, email } = response;
    setUserInfo({ userName, email });
  };

  return (
    <div data-e2e="microUIPage">
      <Header />
      <Space h="sm" />
      <p>
        <FormattedMessage
          id="mp.info"
          values={{ tenant, locale, currency: bootstrap?.defaultCurrency }}
        />
      </p>
      <Text size="lg" fw={700} mb="sm">
        <FormattedMessage id="table.example" />
      </Text>
      <Table />
      <Space h="xl" />
      <Text size="lg" fw={700} mb="sm">
        <FormattedMessage id="data.call.example" />
      </Text>
      <div>
        <FormattedMessage
          id="api.call.username"
          values={{ username: userInfo?.userName ?? "" }}
        />
      </div>
      <div>
        <FormattedMessage
          id="api.call.email"
          values={{ email: userInfo?.email ?? "" }}
        />
      </div>
      <Space h="md" />
      <Button type="button" onClick={callAPI}>
        <FormattedMessage id="api.call.button" />
      </Button>
      <Space h="xl" />
      <Text size="lg" fw={700} mb="sm">
        <FormattedMessage id="asset.example" />
      </Text>
      <img src={getAsset("logo.png")} alt="AppDirect logo" width="50" />
    </div>
  );
};
export default App;
