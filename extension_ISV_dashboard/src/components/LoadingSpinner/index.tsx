import React from "react";
import { Loader, Center } from "@mantine/core";

const LoadingSpinner = (): JSX.Element => (
  <Center style={{ padding: "2rem" }}>
    <Loader size="lg" />
  </Center>
);

export default LoadingSpinner;

