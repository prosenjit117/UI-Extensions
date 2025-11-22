import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Stack,
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Button,
  Table,
  Timeline,
  Loader,
  Center,
  Anchor,
  Image,
  Divider,
} from "@mantine/core";
import { IconExternalLink, IconArrowLeft } from "@tabler/icons-react";
import { useProductDetails } from "../../hooks/useProductDetails";
import { formatDate, formatPublisher, getCatalogBadge, formatPricing, formatProductStatus, getProductStatusColor } from "../../utils/formatters";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useCompanies } from "../../hooks/useCompanies";

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProductDetails(productId);
  const { data: companiesData } = useCompanies();
  const companies = companiesData?.companies || [];
  
  // Find the company for this product
  const company = product?.vendor?.id 
    ? companies.find((c) => c.uuid === product.vendor.id)
    : null;

  if (isLoading) {
    return (
      <Container>
        <Center style={{ padding: "2rem" }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container>
        <Paper p="lg" withBorder>
          <Text c="red">Error: {(error as Error).message || "Product not found"}</Text>
          <Button mt="md" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const catalogBadge = getCatalogBadge(product.catalog || "UNKNOWN");

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Breadcrumbs
          items={[
            { title: "Developer Dashboard", href: "/dashboard" },
            ...(company
              ? [{ title: company.name, href: `/companies/${company.uuid}` }]
              : []),
            { title: product.name },
          ]}
        />
        <Group justify="space-between">
          <Title order={1}>{product.name}</Title>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Group>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group gap="md" align="flex-start">
              {product.listingLogo?.url && (
                <Image
                  src={product.listingLogo.url}
                  alt={product.name}
                  width={120}
                  height={120}
                  fit="contain"
                  style={{ flexShrink: 0 }}
                />
              )}
              <Stack gap="md" style={{ flex: 1 }}>
                <Title order={3}>Basic Information</Title>
                <Group>
                  <Text fw={600}>Status:</Text>
                  <Badge variant="light" color={getProductStatusColor(product.version)}>
                    {formatProductStatus(product.version)}
                  </Badge>
                </Group>
                <Group>
                  <Text fw={600}>Product UUID:</Text>
                  <Text>{product.uuid}</Text>
                </Group>
                <Group>
                  <Text fw={600}>Product Type:</Text>
                  <Badge variant="outline" size="lg">
                    {product.type || "N/A"}
                  </Badge>
                </Group>
                <Group>
                  <Text fw={600}>Catalog:</Text>
                  <Badge color={catalogBadge.color}>{catalogBadge.label}</Badge>
                </Group>
                {product.linkToProductWebsite && (
                  <Group>
                    <Text fw={600}>Product Website:</Text>
                    <Anchor
                      href={product.linkToProductWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      c="blue"
                    >
                      <Group gap={4}>
                        <Text>Visit Website</Text>
                        <IconExternalLink size={16} />
                      </Group>
                    </Anchor>
                  </Group>
                )}
              </Stack>
            </Group>
            
            <Divider />

            {product.description && (
              <div>
                <Text fw={600} mb="xs">
                  Description:
                </Text>
                <Text>{product.description}</Text>
              </div>
            )}
            {product.lastPublishedDate && (
              <Group>
                <Text fw={600}>Last Published:</Text>
                <Text>{formatDate(product.lastPublishedDate)}</Text>
              </Group>
            )}
            {product.publisher && (
              <Group>
                <Text fw={600}>Publisher:</Text>
                <Text>{formatPublisher(product.publisher)}</Text>
              </Group>
            )}
          </Stack>
        </Paper>

        {product.editions && product.editions.length > 0 && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Editions & Pricing</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Edition Code</Table.Th>
                    <Table.Th>Edition Name</Table.Th>
                    <Table.Th>Pricing</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {product.editions.map((edition) => {
                    const formattedPrice = formatPricing(edition.pricing);
                    return (
                      <Table.Tr key={edition.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {edition.code || "N/A"}
                          </Text>
                        </Table.Td>
                        <Table.Td>{edition.name}</Table.Td>
                        <Table.Td>
                          <Text fw={edition.pricing ? 500 : 400}>
                            {formattedPrice}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        )}

        {product.categories && product.categories.length > 0 && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Categories</Title>
              <Group>
                {product.categories.map((category) => (
                  <Badge key={category.id} variant="light" size="lg">
                    {category.name}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Paper>
        )}

        {product.publicationHistory && product.publicationHistory.length > 0 && (
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Publication History</Title>
              <Timeline active={0} bulletSize={24} lineWidth={2}>
                {product.publicationHistory
                  .sort(
                    (a, b) =>
                      new Date(b.publishedDate).getTime() -
                      new Date(a.publishedDate).getTime()
                  )
                  .map((history, index) => (
                    <Timeline.Item
                      key={index}
                      title={`Published to ${history.catalog || "Unknown"} Catalog`}
                      bullet={index === 0 ? "✓" : undefined}
                    >
                      <Text size="sm" c="dimmed">
                        Date: {formatDate(history.publishedDate)}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Publisher: {formatPublisher(history.publisher)}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Status: {history.status || "Unknown"}
                      </Text>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default ProductDetail;

