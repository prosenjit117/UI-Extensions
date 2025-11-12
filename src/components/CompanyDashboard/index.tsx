import React, { useState, useMemo } from "react";
import {
  Container,
  Stack,
  Title,
  Paper,
  Text,
  Alert,
  Pagination,
  Group,
  Badge,
  Flex,
} from "@mantine/core";
import { IconAlertCircle, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";
import useMarketplaceContext from "../../hooks/useMarketplaceContext";
import useCompanies from "../../hooks/useCompanies";
import useCompanySearch from "../../hooks/useCompanySearch";
import { Company } from "../../hooks/useCompanies";
import CompanySearch from "../CompanySearch";
import CompanyList from "../CompanyList";
import CompanySortFilter, {
  SortField,
  SortDirection,
  StatusFilter,
} from "../CompanySortFilter";

const CompanyDashboard: React.FC = () => {
  const { locale } = useMarketplaceContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Fetch companies with pagination
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useCompanies(currentPage - 1, pageSize); // API uses 0-based page index

  // Search companies by externalId
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useCompanySearch(searchTerm, showSearchResults && searchTerm.length > 0);

  const sortAndFilterCompanies = (
    companies: Company[],
    field: SortField,
    direction: SortDirection,
    filter: StatusFilter
  ): Company[] => {
    let filtered = [...companies];

    if (filter !== "all") {
      filtered = filtered.filter((company) => {
        const isActive =
          company.status === "ACTIVE" ||
          company.status === "ENABLED" ||
          (company.enabled && company.status !== "DISABLED");
        return filter === "active" ? isActive : !isActive;
      });
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case "name":
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;

        case "status":
          const statusA = a.status || "";
          const statusB = b.status || "";
          comparison = statusA.localeCompare(statusB);
          break;

        case "externalId":
          const extIdA = a.externalId || "";
          const extIdB = b.externalId || "";
          const numA = Number(extIdA);
          const numB = Number(extIdB);
          if (!isNaN(numA) && !isNaN(numB)) {
            comparison = numA - numB;
          } else {
            comparison = extIdA.localeCompare(extIdB);
          }
          break;

        case "created":
          const dateA = a.creationDate || 0;
          const dateB = b.creationDate || 0;
          comparison = dateA - dateB;
          break;

        default:
          comparison = 0;
      }

      return direction === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const displayedCompanies = useMemo(() => {
    let companies: Company[] = [];
    
    if (showSearchResults && searchTerm.length > 0) {
      companies = searchResults;
    } else {
      companies = companiesData?.companies || [];
    }

    return sortAndFilterCompanies(companies, sortField, sortDirection, statusFilter);
  }, [
    companiesData,
    searchResults,
    showSearchResults,
    searchTerm,
    sortField,
    sortDirection,
    statusFilter,
  ]);

  const handleSearchChange = (term: string): void => {
    setSearchTerm(term);
    setShowSearchResults(term.length > 0);
    if (term.length > 0) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (field: SortField, direction: SortDirection): void => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: StatusFilter): void => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };


  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Paper p="md" withBorder radius="md">
          <Stack gap="xs">
            <Title order={1} size="h2">
              <FormattedMessage id="company.dashboard.title" />
            </Title>
            <Text size="sm" c="dimmed">
              <FormattedMessage id="company.dashboard.description" />
            </Text>
          </Stack>
        </Paper>

        {(companiesError || searchError) && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            title="Error"
            color="red"
            variant="light"
            radius="md"
            role="alert"
            aria-live="polite"
          >
            {companiesError && "Failed to load companies. Please try again."}
            {searchError && "Failed to search companies. Please try again."}
          </Alert>
        )}

            <Paper p="sm" withBorder radius="md" style={{ backgroundColor: "var(--mantine-color-body)" }}>
              <Stack gap="xs">
                <CompanySearch onSearchChange={handleSearchChange} />
                {searchTerm && (
                  <Flex justify="space-between" align="center" wrap="wrap" gap="xs">
                    <Badge variant="light" color="blue" size="sm">
                      <FormattedMessage
                        id="company.dashboard.searchResults"
                        values={{
                          count: searchResults.length,
                          term: searchTerm,
                        }}
                      />
                    </Badge>
                    {isSearching && (
                      <Badge variant="dot" color="blue" size="sm">
                        <FormattedMessage id="company.dashboard.searching" />
                      </Badge>
                    )}
                  </Flex>
                )}
              </Stack>
            </Paper>

            {!showSearchResults && (
              <CompanySortFilter
                sortField={sortField}
                sortDirection={sortDirection}
                statusFilter={statusFilter}
                onSortChange={handleSortChange}
                onStatusFilterChange={handleStatusFilterChange}
              />
            )}

            <CompanyList
              companies={displayedCompanies}
              isLoading={(isLoadingCompanies && !showSearchResults) || (showSearchResults && isSearching)}
              isSearching={showSearchResults && isSearching}
            />

        {!showSearchResults && companiesData && companiesData.pagination && (
          <Paper p="md" withBorder radius="md" style={{ backgroundColor: "var(--mantine-color-body)" }}>
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align={{ base: "stretch", sm: "center" }}
              gap="md"
              wrap="wrap"
            >
              <Group gap="xs" align="center">
                <Text size="sm" fw={500} c="dimmed">
                  <FormattedMessage
                    id="company.dashboard.pagination.info"
                    values={{
                      current: companiesData.pagination.number + 1,
                      total: companiesData.pagination.totalPages,
                      totalElements: companiesData.pagination.totalElements,
                    }}
                  />
                </Text>
                <Badge variant="light" color="blue" size="lg">
                  {companiesData.pagination.totalElements} <FormattedMessage id="company.dashboard.pagination.total" />
                </Badge>
              </Group>
              {companiesData.pagination.totalPages > 1 && (
                <Pagination
                  value={currentPage}
                  onChange={handlePageChange}
                  total={companiesData.pagination.totalPages}
                  size="md"
                  siblings={2}
                  boundaries={1}
                  withEdges
                  nextIcon={IconChevronRight}
                  previousIcon={IconChevronLeft}
                  aria-label="Company list pagination"
                  role="navigation"
                />
              )}
            </Flex>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default CompanyDashboard;

