import React from "react";
import {
  Timeline,
  Text,
  Badge,
  Stack,
  Group,
  Paper,
  Center,
} from "@mantine/core";
import {
  IconUser,
  IconCalendar,
  IconBuilding,
  IconId,
  IconMinus,
} from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";
import {
  ChangeHistoryEntry,
  getChangeHistory,
} from "../../functions/companyChangeHistoryService";

interface CompanyChangeHistoryProps {
  companyUuid: string;
  refreshTrigger?: number; // Optional trigger to force refresh
}

const CompanyChangeHistory: React.FC<CompanyChangeHistoryProps> = ({
  companyUuid,
  refreshTrigger,
}) => {
  const [history, setHistory] = React.useState<ChangeHistoryEntry[]>([]);

  React.useEffect(() => {
    const loadHistory = (): void => {
      const changeHistory = getChangeHistory(companyUuid);
      setHistory(changeHistory);
    };

    loadHistory();
    // Reload history when component mounts, companyUuid changes, or refreshTrigger changes
  }, [companyUuid, refreshTrigger]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatValue = (value: string | null): string => {
    if (value === null || value === "") {
      return "(blank)";
    }
    return value;
  };

  const getFieldIcon = (field: "name" | "externalId") => {
    switch (field) {
      case "name":
        return <IconBuilding size={16} />;
      case "externalId":
        return <IconId size={16} />;
      default:
        return null;
    }
  };

  const getFieldColor = (
    field: "name" | "externalId",
    oldValue: string | null,
    newValue: string | null
  ): string => {
    if (field === "name") {
      return "blue";
    }
    // For externalId
    if (oldValue === null || oldValue === "") {
      return "green"; // Addition
    }
    if (newValue === null || newValue === "") {
      return "gray"; // Removal
    }
    return "orange"; // Modification
  };

  if (history.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Center>
          <Stack align="center" gap="sm">
            <IconCalendar size={32} stroke={1.5} color="gray" />
            <Text size="sm" c="dimmed">
              <FormattedMessage id="company.history.noHistory" />
            </Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="md" fw={600}>
            <FormattedMessage id="company.history.title" />
          </Text>
          <Badge variant="light" color="blue" size="sm">
            <FormattedMessage
              id="company.history.count"
              values={{ count: history.length }}
            />
          </Badge>
        </Group>

        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {history.map((entry, index) => {
            const fieldLabel =
              entry.field === "name" ? (
                <FormattedMessage id="company.history.field.name" />
              ) : (
                <FormattedMessage id="company.history.field.externalId" />
              );

            const isRemoval =
              entry.newValue === null || entry.newValue === "";
            const isAddition =
              entry.oldValue === null || entry.oldValue === "";

            return (
              <Timeline.Item
                key={`${entry.changedAt}-${index}`}
                bullet={getFieldIcon(entry.field)}
                color={getFieldColor(entry.field, entry.oldValue, entry.newValue)}
                title={
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm" fw={500}>
                      {fieldLabel}
                    </Text>
                    {isAddition && (
                      <Badge size="xs" color="green" variant="light">
                        Added
                      </Badge>
                    )}
                    {isRemoval && (
                      <Badge size="xs" color="gray" variant="light">
                        Removed
                      </Badge>
                    )}
                  </Group>
                }
              >
                <Stack gap="xs" mt={4}>
                  <Group gap="xs" wrap="wrap">
                    {!isAddition && (
                      <>
                        <Text size="xs" c="dimmed" fw={500}>
                          <FormattedMessage id="company.history.from" />:
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {formatValue(entry.oldValue)}
                        </Text>
                        <IconMinus size={12} style={{ color: "var(--mantine-color-dimmed)" }} />
                      </>
                    )}
                    <Text size="xs" c="dimmed" fw={500}>
                      <FormattedMessage id="company.history.to" />:
                    </Text>
                    <Text
                      size="xs"
                      c={isRemoval ? "dimmed" : "default"}
                      ff={isRemoval ? undefined : "monospace"}
                      style={{
                        fontStyle: isRemoval ? "italic" : "normal",
                      }}
                    >
                      {isRemoval ? (
                        <FormattedMessage id="company.history.setToBlank" />
                      ) : (
                        formatValue(entry.newValue)
                      )}
                    </Text>
                  </Group>

                  <Group gap="xs" mt={4}>
                    <IconUser size={14} style={{ color: "var(--mantine-color-dimmed)" }} />
                    <Text size="xs" c="dimmed">
                      <FormattedMessage
                        id="company.history.changedBy"
                        values={{ email: entry.changedBy }}
                      />
                    </Text>
                    <Text size="xs" c="dimmed" mx="xs">
                      •
                    </Text>
                    <IconCalendar size={14} style={{ color: "var(--mantine-color-dimmed)" }} />
                    <Text size="xs" c="dimmed">
                      <FormattedMessage
                        id="company.history.changedOn"
                        values={{ date: formatDate(entry.changedAt) }}
                      />
                    </Text>
                  </Group>
                </Stack>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Stack>
    </Paper>
  );
};

export default CompanyChangeHistory;

