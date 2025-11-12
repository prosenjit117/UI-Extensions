import React from "react";
import {
  Stack,
  Text,
  Badge,
  Group,
  Paper,
  Loader,
  Center,
  Avatar,
  Divider,
  Tooltip,
} from "@mantine/core";
import {
  IconUsers,
  IconShield,
  IconUser,
  IconCheck,
  IconX,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";
import useCompanyMemberships, {
  Membership,
} from "../../hooks/useCompanyMemberships";

interface CompanyMembershipsProps {
  companyUuid: string;
}

const CompanyMemberships: React.FC<CompanyMembershipsProps> = ({
  companyUuid,
}) => {
  const {
    data: membershipsData,
    isLoading,
    error,
  } = useCompanyMemberships(companyUuid);

  if (isLoading) {
    return (
      <Center p="xl">
        <Stack align="center" gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            <FormattedMessage id="company.memberships.loading" />
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Paper p="md" withBorder>
        <Center>
          <Text size="sm" c="red">
            <FormattedMessage
              id="company.memberships.error"
              values={{ error: error.message }}
            />
          </Text>
        </Center>
      </Paper>
    );
  }

  if (!membershipsData || membershipsData.memberships.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center>
          <Stack align="center" gap="sm">
            <IconUsers size={48} stroke={1.5} color="gray" />
            <Text size="sm" c="dimmed">
              <FormattedMessage id="company.memberships.noMembers" />
            </Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const memberships = membershipsData.memberships;
  const admins = memberships.filter((m) =>
    m.roles.includes("ROLE_SYS_ADMIN")
  );
  const regularMembers = memberships.filter(
    (m) => !m.roles.includes("ROLE_SYS_ADMIN")
  );

  const formatUserName = (membership: Membership): string => {
    const { firstName, lastName, email } = membership.user;
    if (firstName || lastName) {
      return `${firstName || ""} ${lastName || ""}`.trim() || email;
    }
    return email;
  };

  const getInitials = (membership: Membership): string => {
    const { firstName, lastName, email } = membership.user;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (lastName) {
      return lastName[0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const formatRoleName = (role: string): string => {
    // Remove ROLE_ prefix and format
    return role.replace("ROLE_", "").replace(/_/g, " ");
  };

  const renderMembership = (membership: Membership, isAdmin: boolean) => {
    const userName = formatUserName(membership);
    const initials = getInitials(membership);
    const isActivated = membership.user.activated;
    const isEnabled = membership.enabled;

    return (
      <Paper
        key={membership.user.uuid}
        p="md"
        withBorder
        style={{
          borderLeft: isAdmin
            ? "3px solid var(--mantine-color-blue-6)"
            : undefined,
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
              <Avatar size="md" radius="xl" color={isAdmin ? "blue" : "gray"}>
                {initials}
              </Avatar>
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" wrap="nowrap" align="center">
                  <Text size="sm" fw={600} truncate>
                    {userName}
                  </Text>
                  {isAdmin && (
                    <Badge
                      size="sm"
                      color="blue"
                      variant="light"
                      leftSection={<IconShield size={12} />}
                    >
                      <FormattedMessage id="company.memberships.admin" />
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed" truncate>
                  {membership.user.email}
                </Text>
              </Stack>
            </Group>
            <Stack gap={6} align="flex-end" style={{ flexShrink: 0 }}>
              <Group gap={6}>
                {isActivated ? (
                  <Badge
                    size="sm"
                    variant="light"
                    color="green"
                    leftSection={<IconCircleCheck size={14} />}
                  >
                    <FormattedMessage id="company.memberships.activated" />
                  </Badge>
                ) : (
                  <Badge
                    size="sm"
                    variant="light"
                    color="red"
                    leftSection={<IconCircleX size={14} />}
                  >
                    <FormattedMessage id="company.memberships.notActivated" />
                  </Badge>
                )}
              </Group>
              <Group gap={6}>
                {isEnabled ? (
                  <Badge
                    size="sm"
                    variant="light"
                    color="green"
                    leftSection={<IconCircleCheck size={14} />}
                  >
                    <FormattedMessage id="company.memberships.enabled" />
                  </Badge>
                ) : (
                  <Badge
                    size="sm"
                    variant="light"
                    color="red"
                    leftSection={<IconCircleX size={14} />}
                  >
                    <FormattedMessage id="company.memberships.disabled" />
                  </Badge>
                )}
              </Group>
            </Stack>
          </Group>

          <Divider />

          <Stack gap="xs">
            <Text size="xs" fw={500} c="dimmed">
              <FormattedMessage id="company.memberships.roles" />:
            </Text>
            <Group gap="xs" wrap="wrap">
              {membership.roles.map((role) => {
                const isSysAdmin = role === "ROLE_SYS_ADMIN";
                return (
                  <Badge
                    key={role}
                    size="sm"
                    variant="light"
                    color={isSysAdmin ? "blue" : "gray"}
                  >
                    {formatRoleName(role)}
                  </Badge>
                );
              })}
            </Group>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Stack gap="md">

        {admins.length > 0 && (
          <Stack gap="sm">
            <Group gap="xs">
              <IconShield size={16} style={{ color: "var(--mantine-color-blue-6)" }} />
              <Text size="sm" fw={500} c="blue">
                <FormattedMessage
                  id="company.memberships.adminsSection"
                  values={{ count: admins.length }}
                />
              </Text>
            </Group>
            <Stack gap="sm">
              {admins.map((membership) => renderMembership(membership, true))}
            </Stack>
          </Stack>
        )}

        {regularMembers.length > 0 && (
          <Stack gap="sm">
            {admins.length > 0 && <Divider />}
            <Group gap="xs">
              <IconUser size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
              <Text size="sm" fw={500} c="dimmed">
                <FormattedMessage
                  id="company.memberships.membersSection"
                  values={{ count: regularMembers.length }}
                />
              </Text>
            </Group>
            <Stack gap="sm">
              {regularMembers.map((membership) =>
                renderMembership(membership, false)
              )}
            </Stack>
          </Stack>
        )}
    </Stack>
  );
};

export default CompanyMemberships;

