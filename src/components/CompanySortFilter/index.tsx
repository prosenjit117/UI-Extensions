import React from "react";
import { Group, Select, Stack, Text, Paper } from "@mantine/core";
import { IconSortAscending, IconSortDescending, IconFilter } from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";

export type SortField = "name" | "status" | "externalId" | "created";
export type SortDirection = "asc" | "desc";

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export type StatusFilter = "all" | "active" | "inactive";

interface CompanySortFilterProps {
  sortField: SortField;
  sortDirection: SortDirection;
  statusFilter: StatusFilter;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
}

const CompanySortFilter: React.FC<CompanySortFilterProps> = ({
  sortField,
  sortDirection,
  statusFilter,
  onSortChange,
  onStatusFilterChange,
}) => {
  const handleSortFieldChange = (value: string | null): void => {
    if (value) {
      onSortChange(value as SortField, sortDirection);
    }
  };

  const handleSortDirectionChange = (value: string | null): void => {
    if (value) {
      onSortChange(sortField, value as SortDirection);
    }
  };

  const handleStatusFilterChange = (value: string | null): void => {
    if (value) {
      onStatusFilterChange(value as StatusFilter);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconFilter size={18} style={{ color: "var(--mantine-color-dimmed)" }} />
          <Text size="sm" fw={600}>
            <FormattedMessage id="company.sortFilter.title" />
          </Text>
        </Group>

        <Group gap="md" align="flex-end" wrap="wrap">
          <Select
            label={<FormattedMessage id="company.sortFilter.sortBy" />}
            placeholder={<FormattedMessage id="company.sortFilter.selectSortField" />}
            value={sortField}
            onChange={handleSortFieldChange}
            data={[
              { value: "name", label: "Company Name" },
              { value: "status", label: "Status (Active/Inactive)" },
              { value: "externalId", label: "External ID" },
              { value: "created", label: "Created Date" },
            ]}
            style={{ flex: 1, minWidth: 150 }}
          />

          <Select
            label={<FormattedMessage id="company.sortFilter.direction" />}
            placeholder={<FormattedMessage id="company.sortFilter.selectDirection" />}
            value={sortDirection}
            onChange={handleSortDirectionChange}
            leftSection={
              sortDirection === "asc" ? (
                <IconSortAscending size={16} />
              ) : (
                <IconSortDescending size={16} />
              )
            }
            data={[
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ]}
            style={{ flex: 1, minWidth: 150 }}
          />

          <Select
            label={<FormattedMessage id="company.sortFilter.filterBy" />}
            placeholder={<FormattedMessage id="company.sortFilter.selectFilter" />}
            value={statusFilter}
            onChange={handleStatusFilterChange}
            data={[
              { value: "all", label: "All Companies" },
              { value: "active", label: "Active Only" },
              { value: "inactive", label: "Inactive Only" },
            ]}
            style={{ flex: 1, minWidth: 150 }}
          />
        </Group>
      </Stack>
    </Paper>
  );
};

export default CompanySortFilter;

