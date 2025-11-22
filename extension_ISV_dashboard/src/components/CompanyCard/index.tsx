import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Text,
  Badge,
  Collapse,
  Button,
  SegmentedControl,
  Stack,
  Group,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../ProductCard";
import LoadingSpinner from "../LoadingSpinner";
import { CATALOG_TYPES } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";
import type { Company } from "../../services/marketplaceApi";

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string>(CATALOG_TYPES.ALL);
  const { data: products = [], isLoading, error } = useProducts(company.uuid);

  // Separate products by catalog type
  const productCounts = useMemo(() => {
    const productionCount = products.filter((p) => {
      const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
      return catalogs.includes(CATALOG_TYPES.PRODUCTION);
    }).length;

    const stagingCount = products.filter((p) => {
      const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
      return catalogs.includes(CATALOG_TYPES.STAGING);
    }).length;

    return { production: productionCount, staging: stagingCount };
  }, [products]);

  const filteredProducts =
    catalogFilter === CATALOG_TYPES.ALL
      ? products
      : products.filter((p) => {
          const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
          return catalogs.includes(catalogFilter);
        });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Group gap="md" align="flex-start">
              <div>
                <Text size="lg" fw={700}>
                  {company.name}
                </Text>
                <Text size="sm" c="dimmed">
                  UUID: {company.uuid}
                </Text>
                {company.createdDate && (
                  <Group gap={4} mt={4}>
                    <IconCalendar size={14} />
                    <Text size="sm" c="dimmed">
                      Created: {formatDate(company.createdDate)}
                    </Text>
                  </Group>
                )}
              </div>
              {company.status && (
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
              )}
            </Group>
          </div>
          <Stack gap="xs" align="flex-end">
            <Badge color="green" size="lg">
              {productCounts.production} Production
            </Badge>
            <Badge color="yellow" size="lg">
              {productCounts.staging} Staging
            </Badge>
          </Stack>
        </Group>

        <Group>
          <Button
            variant="light"
            onClick={() => navigate(`/companies/${company.uuid}`)}
          >
            View Details
          </Button>
          <Button variant="subtle" onClick={() => setOpened(!opened)}>
            {opened ? "▼ Hide Products" : "▶ Show Products"}
          </Button>
        </Group>

        <Collapse in={opened}>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Text c="red">{(error as Error).message}</Text>
          ) : (
            <Stack gap="md">
              <SegmentedControl
                value={catalogFilter}
                onChange={setCatalogFilter}
                data={[
                  { label: "All", value: CATALOG_TYPES.ALL },
                  { label: "Production", value: CATALOG_TYPES.PRODUCTION },
                  { label: "Staging", value: CATALOG_TYPES.STAGING },
                ]}
              />
              {filteredProducts.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                  No products found in selected catalog
                </Text>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.uuid} product={product} />
                ))
              )}
            </Stack>
          )}
        </Collapse>
      </Stack>
    </Card>
  );
};

export default CompanyCard;

