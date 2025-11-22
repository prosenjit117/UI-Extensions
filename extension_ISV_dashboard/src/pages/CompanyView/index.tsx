import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Stack,
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Button,
  SegmentedControl,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useCompanies } from "../../hooks/useCompanies";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { CATALOG_TYPES } from "../../utils/constants";

const CompanyView: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catalogFromUrl = searchParams.get("catalog");
  const [catalogFilter, setCatalogFilter] = useState<string>(
    catalogFromUrl && (catalogFromUrl === CATALOG_TYPES.PRODUCTION || catalogFromUrl === CATALOG_TYPES.STAGING)
      ? catalogFromUrl
      : CATALOG_TYPES.PRODUCTION
  );

  // Update catalog filter when URL parameter changes
  useEffect(() => {
    if (catalogFromUrl && (catalogFromUrl === CATALOG_TYPES.PRODUCTION || catalogFromUrl === CATALOG_TYPES.STAGING)) {
      setCatalogFilter(catalogFromUrl);
    }
  }, [catalogFromUrl]);
  const { data: companiesData } = useCompanies();
  const companies = companiesData?.companies || [];
  const { data: products = [], isLoading: productsLoading, error } = useProducts(companyId);

  const company = companies.find((c) => c.uuid === companyId);

  // Filter products by selected catalog (PRODUCTION or STAGING only)
  const filteredProducts = products.filter((p) => {
    const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
    return catalogs.includes(catalogFilter);
  });

  // Get product counts for each catalog
  const productionCount = products.filter((p) => {
    const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
    return catalogs.includes(CATALOG_TYPES.PRODUCTION);
  }).length;

  const stagingCount = products.filter((p) => {
    const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
    return catalogs.includes(CATALOG_TYPES.STAGING);
  }).length;

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Breadcrumbs
          items={[
            { title: "Developer Dashboard", href: "/dashboard" },
            { title: company ? company.name : "Company Details" },
          ]}
        />
        <Group justify="space-between">
          <Title order={1}>{company ? company.name : "Company Details"}</Title>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Group>

        {company && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group>
                <Text fw={600}>Company Name:</Text>
                <Text>{company.name}</Text>
              </Group>
              <Group>
                <Text fw={600}>UUID:</Text>
                <Text>{company.uuid}</Text>
              </Group>
              {company.status && (
                <Group>
                  <Text fw={600}>Status:</Text>
                  <Badge
                    color={
                      company.status === "ENABLED" || company.status === "ACTIVE"
                        ? "green"
                        : company.status === "DISABLED" || company.status === "INACTIVE"
                        ? "red"
                        : "gray"
                    }
                    variant="light"
                    size="lg"
                  >
                    {company.status}
                  </Badge>
                </Group>
              )}
              {company.createdDate && (
                <Group>
                  <Text fw={600}>Created:</Text>
                  <Text>{new Date(company.createdDate).toLocaleDateString()}</Text>
                </Group>
              )}
              <Group gap="md">
                <Badge color="green" size="lg">
                  {productionCount} Production
                </Badge>
                <Badge color="yellow" size="lg">
                  {stagingCount} Staging
                </Badge>
              </Group>
            </Stack>
          </Paper>
        )}

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Products</Title>
              <SegmentedControl
                value={catalogFilter}
                onChange={setCatalogFilter}
                data={[
                  { label: "Production", value: CATALOG_TYPES.PRODUCTION },
                  { label: "Staging", value: CATALOG_TYPES.STAGING },
                ]}
              />
            </Group>

            {productsLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <Text c="red">{(error as Error).message}</Text>
            ) : filteredProducts.length === 0 ? (
              <Text ta="center" c="dimmed" py="md">
                No products found in selected catalog
              </Text>
            ) : (
              <Stack gap="md">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.uuid}
                    product={product}
                    companyName={company?.name}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default CompanyView;

