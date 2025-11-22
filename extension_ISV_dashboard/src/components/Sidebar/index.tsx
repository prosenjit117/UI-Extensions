import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppShellNavbar, NavLink, Text, Stack } from "@mantine/core";

const Sidebar = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string): boolean => {
    const currentPath = location.pathname || location.hash.replace("#", "");
    return currentPath === path || currentPath === `${path}/`;
  };

  return (
    <AppShellNavbar p="md" style={{ width: 250 }}>
      <Stack gap="md">
        <Text size="lg" fw={700}>
          Developer Dashboard
        </Text>
        <Stack gap="xs">
          <NavLink
            label="Dashboard"
            active={isActive("/") || isActive("/dashboard")}
            onClick={() => navigate("/dashboard")}
          />
          <NavLink
            label="Flat List View"
            active={isActive("/list")}
            onClick={() => navigate("/list")}
          />
        </Stack>
      </Stack>
    </AppShellNavbar>
  );
};

export default Sidebar;

