import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Accordion,
  Select,
  TextInput,
  Grid,
  Tooltip,
  ActionIcon,
  Table,
  Badge,
  Anchor,
} from "@mantine/core";
import { IconInfoCircle, IconFilter, IconSortAscending } from "@tabler/icons-react";
import { useCompanies } from "../../hooks/useCompanies";
import { useAllProducts } from "../../hooks/useAllProducts";
import { VIEW_MODES, CATALOG_TYPES } from "../../utils/constants";
import ViewToggle from "../../components/ViewToggle";
import CompanyCard from "../../components/CompanyCard";
import ProductTable from "../../components/ProductTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import SchemaHelper from "../../components/SchemaHelper";
import Breadcrumbs from "../../components/Breadcrumbs";
import type { Company, Product } from "../../services/marketplaceApi";

interface DashboardProps {
  viewMode?: string;
}

type SortOption = "name_asc" | "name_desc" | "products_asc" | "products_desc";

const Dashboard: React.FC<DashboardProps> = ({ viewMode: initialViewMode }) => {
  const [viewMode, setViewMode] = useState<string>(
    initialViewMode || VIEW_MODES.FLAT_LIST
  );
  const [sortBy, setSortBy] = useState<SortOption>("products_desc");
  const [uuidFilter, setUuidFilter] = useState<string>("");
  
  const { data, isLoading: companiesLoading, error: companiesError } = useCompanies();
  const allCompanies = data?.companies || [];
  
  // Always load products for all companies (needed for sorting by product count)
  const { allProducts, loading: productsLoading, error: productsError } =
    useAllProducts(allCompanies);

  const loading = companiesLoading || productsLoading;
  const error = companiesError || productsError;

  const navigate = useNavigate();

  // Get product counts for each company by catalog type
  const companyProductCounts = useMemo(() => {
    const counts: Record<string, { production: number; staging: number; total: number }> = {};
    
    // Initialize all companies with 0 products
    allCompanies.forEach((company) => {
      counts[company.uuid] = { production: 0, staging: 0, total: 0 };
    });
    
    // Count products per company and catalog
    allProducts.forEach((product: Product & { companyUuid?: string }) => {
      if (product.companyUuid && counts[product.companyUuid] !== undefined) {
        const catalogs = Array.isArray(product.catalogs) ? product.catalogs : [product.catalog];
        
        if (catalogs.includes(CATALOG_TYPES.PRODUCTION)) {
          counts[product.companyUuid].production++;
        }
        if (catalogs.includes(CATALOG_TYPES.STAGING)) {
          counts[product.companyUuid].staging++;
        }
        counts[product.companyUuid].total++;
      }
    });
    
    return counts;
  }, [allCompanies, allProducts]);

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = allCompanies;

    // Apply UUID filter
    if (uuidFilter.trim()) {
      const filterLower = uuidFilter.toLowerCase().trim();
      filtered = filtered.filter(
        (company) =>
          company.uuid.toLowerCase().includes(filterLower) ||
          company.id.toLowerCase().includes(filterLower)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "products_asc":
          return (
            (companyProductCounts[a.uuid]?.total || 0) -
            (companyProductCounts[b.uuid]?.total || 0)
          );
        case "products_desc":
          return (
            (companyProductCounts[b.uuid]?.total || 0) -
            (companyProductCounts[a.uuid]?.total || 0)
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [allCompanies, uuidFilter, sortBy, companyProductCounts]);

  const companies = filteredAndSortedCompanies;

  if (loading) {
    return (
      <Container size="xl" py="md">
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Stack gap="md">
          <Paper p="lg" withBorder>
            <Title order={3} mb="md">Error Loading Dashboard</Title>
            <Text c="red" mb="md">Error: {(error as Error).message}</Text>
            <Text size="sm" c="dimmed" mb="md">
              The GraphQL query structure may not match your marketplace's API schema.
              Please contact support if this issue persists.
            </Text>
            <Accordion>
              <Accordion.Item value="schema-helper">
                <Accordion.Control>
                  <Text fw={600}>Need Help? Discover Available GraphQL Queries</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <SchemaHelper />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Breadcrumbs
          items={[
            { title: "Developer Dashboard", href: "/dashboard" },
          ]}
        />
        <Group justify="space-between">
          <Title order={1}>Developer Companies Dashboard</Title>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </Group>

        {/* Sorting and Filtering Controls */}
        <Paper p="lg" withBorder shadow="sm" radius="md">
          <Stack gap="md">
            <Group gap="xs">
              <IconFilter size={20} />
              <Title order={4}>Filter & Sort</Title>
              <Tooltip
                label="Filter companies by UUID or sort them alphabetically/by product count"
                position="top"
                withArrow
                multiline
              >
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconInfoCircle size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            
            <Grid gutter="md" align="flex-end">
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Tooltip
                  label="Enter any part of a company UUID or ID to filter the list. Search is case-insensitive."
                  position="top"
                  withArrow
                  multiline
                >
                  <div>
                    <Group gap="xs" mb={4}>
                      <Text size="sm" fw={500}>UUID Filter</Text>
                      <Tooltip
                        label="Search by company UUID or ID"
                        withArrow
                      >
                        <ActionIcon variant="transparent" size="xs" color="gray">
                          <IconInfoCircle size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <TextInput
                      placeholder="Filter by UUID..."
                      value={uuidFilter}
                      onChange={(e) => setUuidFilter(e.currentTarget.value)}
                      leftSection={<IconFilter size={16} />}
                      styles={{
                        input: {
                          height: '36px'
                        }
                      }}
                    />
                  </div>
                </Tooltip>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 5 }}>
                <Tooltip
                  label="Choose how to sort companies: by name (alphabetically) or by the number of products they have created."
                  position="top"
                  withArrow
                  multiline
                >
                  <div>
                    <Group gap="xs" mb={4}>
                      <Text size="sm" fw={500}>Sort By</Text>
                      <Tooltip
                        label="Choose sorting criteria"
                        withArrow
                      >
                        <ActionIcon variant="transparent" size="xs" color="gray">
                          <IconInfoCircle size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <Select
                      placeholder="Select sort option"
                      value={sortBy}
                      onChange={(value) => setSortBy(value as SortOption)}
                      data={[
                        { value: "name_asc", label: "Name (A-Z)" },
                        { value: "name_desc", label: "Name (Z-A)" },
                        { value: "products_asc", label: "Products (Low to High)" },
                        { value: "products_desc", label: "Products (High to Low)" },
                      ]}
                      leftSection={<IconSortAscending size={16} />}
                      styles={{
                        input: {
                          height: '36px'
                        }
                      }}
                    />
                  </div>
                </Tooltip>
              </Grid.Col>
            </Grid>
            
            {uuidFilter && (
              <Paper p="xs" bg="blue.0" withBorder>
                <Text size="sm" c="blue" fw={500}>
                  Showing {filteredAndSortedCompanies.length} of {allCompanies.length} companies
                </Text>
              </Paper>
            )}
          </Stack>
        </Paper>

        {companies.length === 0 ? (
          <Paper p="lg" withBorder>
            <Title order={3} mb="md">No Developer Companies Found</Title>
            <Text ta="center" c="dimmed">
              No companies with ROLE_DEVELOPER were found in your marketplace.
            </Text>
            <Text size="sm" c="dimmed" mt="md" ta="center">
              This could mean:
              <ul style={{ textAlign: "left", display: "inline-block" }}>
                <li>No companies have been assigned the DEVELOPER role</li>
                <li>The GraphQL query needs adjustment</li>
                <li>There is an authentication or permission issue</li>
              </ul>
            </Text>
          </Paper>
        ) : viewMode === VIEW_MODES.GROUPED ? (
          <Stack gap="md">
            {companies.map((company) => (
              <CompanyCard key={company.uuid} company={company} />
            ))}
          </Stack>
        ) : (
          <Paper p="md" withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Company Name</Table.Th>
                  <Table.Th>Company UUID</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created Date</Table.Th>
                  <Table.Th>Staging Products</Table.Th>
                  <Table.Th>Production Products</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {companies.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed" py="md">
                        No companies found.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  companies.map((company) => {
                    const counts = companyProductCounts[company.uuid] || { production: 0, staging: 0, total: 0 };
                    const status = company.status || "PENDING";
                    const statusColor = 
                      status === "ENABLED" || status === "ACTIVE" ? "green" :
                      status === "DISABLED" || status === "INACTIVE" ? "red" : "gray";
                    const createdDate = company.createdDate 
                      ? new Date(company.createdDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A";

                    return (
                      <Table.Tr key={company.uuid}>
                        <Table.Td>
                          <Text fw={500}>{company.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed" ff="monospace">
                            {company.uuid}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={statusColor} variant="light" size="md">
                            {status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{createdDate}</Text>
                        </Table.Td>
                        <Table.Td>
                          {counts.staging > 0 ? (
                            <Anchor
                              component="button"
                              type="button"
                              onClick={() => navigate(`/companies/${company.uuid}?catalog=${CATALOG_TYPES.STAGING}`)}
                              style={{ cursor: "pointer", textDecoration: "underline" }}
                              fw={700}
                              c="blue"
                            >
                              {counts.staging}
                            </Anchor>
                          ) : (
                            <Text c="dimmed">{counts.staging}</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {counts.production > 0 ? (
                            <Anchor
                              component="button"
                              type="button"
                              onClick={() => navigate(`/companies/${company.uuid}?catalog=${CATALOG_TYPES.PRODUCTION}`)}
                              style={{ cursor: "pointer", textDecoration: "underline" }}
                              fw={700}
                              c="blue"
                            >
                              {counts.production}
                            </Anchor>
                          ) : (
                            <Text c="dimmed">{counts.production}</Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default Dashboard;
