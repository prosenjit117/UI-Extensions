import React, { useState, useEffect } from "react";
import {
  Grid,
  Text,
  Badge,
  Stack,
  Group,
  Button,
  Paper,
  Divider,
  Collapse,
} from "@mantine/core";
import { IconEdit, IconBuilding, IconMapPin, IconPhone, IconHistory, IconUsers } from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";
import { Company } from "../../hooks/useCompanies";
import CompanyEditForm from "../CompanyEditForm";
import CompanyChangeHistory from "../CompanyChangeHistory";
import CompanyMemberships from "../CompanyMemberships";

interface CompanyDetailProps {
  company: Company;
  onUpdate?: (updatedCompany: Company) => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company>(company);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [membershipsExpanded, setMembershipsExpanded] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  useEffect(() => {
    setCurrentCompany(company);
  }, [company]);

  const handleEditSuccess = (): void => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(currentCompany);
    }
    setHistoryRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Paper p="md" withBorder>
        <CompanyEditForm
          company={currentCompany}
          onCancel={handleCancel}
          onSuccess={handleEditSuccess}
        />
      </Paper>
    );
  }

  const contactInfo = currentCompany.address || {};

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <IconBuilding size={20} />
            <Text size="lg" fw={600}>
              <FormattedMessage id="company.detail.title" />
            </Text>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="light"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <FormattedMessage id="company.detail.edit" />
          </Button>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                <FormattedMessage id="company.detail.name" />
              </Text>
              <Text size="md">{currentCompany.name || "-"}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                <FormattedMessage id="company.detail.externalId" />
              </Text>
              <Text size="md">
                {currentCompany.externalId || (
                  <Text c="dimmed" component="span">
                    <FormattedMessage id="company.detail.notSet" />
                  </Text>
                )}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                <FormattedMessage id="company.detail.id" />
              </Text>
              <Text size="md" ff="monospace" c="dimmed">
                {currentCompany.companyId || "-"}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Text size="sm" fw={500} c="dimmed">
                <FormattedMessage id="company.detail.uuid" />
              </Text>
              <Text size="md" ff="monospace" c="dimmed">
                {currentCompany.uuid}
              </Text>
            </Stack>
          </Grid.Col>


          {(contactInfo.street1 ||
            contactInfo.city ||
            contactInfo.state ||
            contactInfo.zip ||
            contactInfo.country) && (
            <Grid.Col span={12}>
              <Divider />
              <Group gap="xs" mt="xs">
                <IconMapPin size={16} />
                <Text size="sm" fw={500} c="dimmed">
                  <FormattedMessage id="company.detail.address" />
                </Text>
              </Group>
              <Text size="md" mt="xs">
                {contactInfo.street1 && (
                  <>
                    {contactInfo.street1}
                    {contactInfo.street2 && `, ${contactInfo.street2}`}
                    <br />
                  </>
                )}
                {contactInfo.city && contactInfo.city}
                {contactInfo.state && `, ${contactInfo.state}`}
                {contactInfo.zip && ` ${contactInfo.zip}`}
                {contactInfo.country && (
                  <>
                    <br />
                    {contactInfo.country}
                  </>
                )}
              </Text>
            </Grid.Col>
          )}

          {currentCompany.phoneNumber && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Group gap="xs">
                <IconPhone size={16} />
                <Stack gap="xs">
                  <Text size="sm" fw={500} c="dimmed">
                    <FormattedMessage id="company.detail.phone" />
                  </Text>
                  <Text size="md">{currentCompany.phoneNumber}</Text>
                </Stack>
              </Group>
            </Grid.Col>
          )}

          {currentCompany.emailAddress && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">
                  Email
                </Text>
                <Text size="md">{currentCompany.emailAddress}</Text>
              </Stack>
            </Grid.Col>
          )}

          {currentCompany.creationDate && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">
                  <FormattedMessage id="company.detail.createdAt" />
                </Text>
                <Text size="md">
                  {new Date(currentCompany.creationDate).toLocaleDateString()}
                </Text>
              </Stack>
            </Grid.Col>
          )}

          {currentCompany.status && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">
                  Status
                </Text>
                <Badge
                  variant="light"
                  color={currentCompany.status === "ACTIVE" ? "green" : "red"}
                >
                  {currentCompany.status}
                </Badge>
              </Stack>
            </Grid.Col>
          )}
        </Grid>

        <Divider my="md" />

        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconUsers size={18} style={{ color: "var(--mantine-color-dimmed)" }} />
              <Text size="md" fw={600}>
                <FormattedMessage id="company.memberships.title" />
              </Text>
            </Group>
            <Button
              variant="subtle"
              size="xs"
              onClick={() => setMembershipsExpanded(!membershipsExpanded)}
              aria-expanded={membershipsExpanded}
            >
              {membershipsExpanded ? "Hide" : "Show"} Members
            </Button>
          </Group>

          <Collapse in={membershipsExpanded}>
            <CompanyMemberships companyUuid={currentCompany.uuid} />
          </Collapse>
        </Stack>

        <Divider my="md" />

        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconHistory size={18} style={{ color: "var(--mantine-color-dimmed)" }} />
              <Text size="md" fw={600}>
                <FormattedMessage id="company.history.title" />
              </Text>
            </Group>
            <Button
              variant="subtle"
              size="xs"
              onClick={() => setHistoryExpanded(!historyExpanded)}
              aria-expanded={historyExpanded}
            >
              {historyExpanded ? "Hide" : "Show"} History
            </Button>
          </Group>

          <Collapse in={historyExpanded}>
            <CompanyChangeHistory 
              companyUuid={currentCompany.uuid} 
              refreshTrigger={historyRefreshTrigger}
            />
          </Collapse>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CompanyDetail;

