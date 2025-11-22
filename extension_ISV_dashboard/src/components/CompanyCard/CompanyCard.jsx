import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Text, Badge, Collapse, Button, SegmentedControl, Stack, Group } from '@mantine/core';
// Using simple text for expand/collapse instead of icons
// import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ProductCard/ProductCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { CATALOG_TYPES } from '../../utils/constants';

function CompanyCard({ company }) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState(CATALOG_TYPES.ALL);
  const { products, loading, error } = useProducts(company.uuid);

  const filteredProducts = catalogFilter === CATALOG_TYPES.ALL
    ? products
    : products.filter(p => {
        const catalogs = Array.isArray(p.catalogs) ? p.catalogs : [p.catalog];
        return catalogs.includes(catalogFilter);
      });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Text size="lg" fw={700}>{company.name}</Text>
            <Text size="sm" c="dimmed">UUID: {company.uuid}</Text>
          </div>
          <Badge color="blue" size="lg">
            {products.length} Products
          </Badge>
        </Group>

        <Group>
          <Button
            variant="light"
            onClick={() => navigate(`/companies/${company.uuid}`)}
          >
            View Details
          </Button>
          <Button
            variant="subtle"
            onClick={() => setOpened(!opened)}
          >
            {opened ? '▼ Hide Products' : '▶ Show Products'}
          </Button>
        </Group>

        <Collapse in={opened}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <Text c="red">{error}</Text>
          ) : (
            <Stack gap="md">
              <SegmentedControl
                value={catalogFilter}
                onChange={setCatalogFilter}
                data={[
                  { label: 'All', value: CATALOG_TYPES.ALL },
                  { label: 'Production', value: CATALOG_TYPES.PRODUCTION },
                  { label: 'Staging', value: CATALOG_TYPES.STAGING },
                ]}
              />
              {filteredProducts.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                  No products found in selected catalog
                </Text>
              ) : (
                filteredProducts.map(product => (
                  <ProductCard key={product.uuid} product={product} />
                ))
              )}
            </Stack>
          )}
        </Collapse>
      </Stack>
    </Card>
  );
}

export default CompanyCard;

