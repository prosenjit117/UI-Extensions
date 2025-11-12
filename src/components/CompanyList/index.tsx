import React from "react";
import {
  Accordion,
  Text,
  Badge,
  Group,
  Stack,
  Loader,
  Center,
  Paper,
} from "@mantine/core";
import { IconBuilding, IconChevronDown, IconCalendar } from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";
import { Company } from "../../hooks/useCompanies";
import CompanyDetail from "../CompanyDetail";

interface CompanyListProps {
  companies: Company[];
  isLoading?: boolean;
  isSearching?: boolean;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  isLoading = false,
  isSearching = false,
}) => {

  if (isLoading) {
    return (
      <Center p="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">
            <FormattedMessage id="company.list.loading" />
          </Text>
        </Stack>
      </Center>
    );
  }

  if (companies.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center>
          <Stack align="center" gap="sm">
            <IconBuilding size={48} stroke={1.5} color="gray" />
            <Text size="lg" fw={500} c="dimmed">
              {isSearching ? (
                <FormattedMessage id="company.list.noSearchResults" />
              ) : (
                <FormattedMessage id="company.list.noCompanies" />
              )}
            </Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const items = companies.map((company) => (
    <Accordion.Item key={company.uuid} value={company.uuid}>
      <Accordion.Control>
        <Stack gap="sm" style={{ width: "100%", padding: "4px 0" }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
            <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
              <IconBuilding 
                size={24} 
                style={{ 
                  color: "var(--mantine-color-blue-6)",
                  flexShrink: 0 
                }} 
                aria-hidden="true"
              />
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Text 
                  fw={600} 
                  size="md"
                  truncate
                  style={{ lineHeight: 1.4 }}
                  aria-label={`Company name: ${company.name || "Unnamed Company"}`}
                >
                  {company.name || <FormattedMessage id="company.list.unnamed" />}
                </Text>
                <Group gap="xs" wrap="wrap">
                  {company.externalId && (
                    <Badge 
                      variant="light" 
                      size="sm" 
                      color="blue"
                      aria-label={`External ID: ${company.externalId}`}
                    >
                      <FormattedMessage
                        id="company.list.externalId"
                        values={{ id: company.externalId }}
                      />
                    </Badge>
                  )}
                  {company.status && (
                    <Badge
                      variant="light"
                      size="sm"
                      color={company.status === "ACTIVE" ? "green" : "red"}
                      aria-label={`Status: ${company.status}`}
                    >
                      {company.status}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Group>
          </Group>

          <Group gap="lg" wrap="wrap" style={{ marginTop: "4px" }}>
            <Group gap={6} style={{ flex: 1, minWidth: 0 }} align="flex-start">
              <Text 
                size="xs" 
                c="dimmed" 
                fw={500}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                UUID:
              </Text>
              <Text 
                size="xs" 
                c="dimmed" 
                ff="monospace" 
                style={{ 
                  wordBreak: "break-all",
                  lineHeight: 1.5
                }}
                aria-label={`Company UUID: ${company.uuid}`}
              >
                {company.uuid}
              </Text>
            </Group>

            {/* Creation Date Section */}
            {company.creationDate && (
              <Group gap={6} style={{ flexShrink: 0 }} align="center">
                <IconCalendar 
                  size={16} 
                  style={{ 
                    color: "var(--mantine-color-dimmed)",
                    flexShrink: 0
                  }} 
                  aria-hidden="true"
                />
                <Group gap={4} align="center">
                  <Text 
                    size="xs" 
                    c="dimmed" 
                    fw={500}
                    style={{ flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    Created:
                  </Text>
                  <Text 
                    size="xs" 
                    c="dimmed"
                    style={{ lineHeight: 1.5 }}
                    aria-label={`Created on: ${formatDate(company.creationDate)}`}
                  >
                    {formatDate(company.creationDate)}
                  </Text>
                </Group>
              </Group>
            )}
          </Group>
        </Stack>
      </Accordion.Control>
      <Accordion.Panel>
        <CompanyDetail company={company} />
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion
      chevron={<IconChevronDown size={16} />}
      variant="separated"
      radius="md"
    >
      {items}
    </Accordion>
  );
};

export default CompanyList;

