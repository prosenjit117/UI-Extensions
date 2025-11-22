import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Tooltip,
  ActionIcon,
  Divider,
  Image,
} from "@mantine/core";
import { IconInfoCircle, IconCalendar } from "@tabler/icons-react";
import { formatDate, formatPublisher, getCatalogBadge, formatProductStatus, getProductStatusColor } from "../../utils/formatters";
import type { Product } from "../../services/marketplaceApi";

interface ProductCardProps {
  product: Product;
  companyName?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, companyName }) => {
  const navigate = useNavigate();
  const catalogBadge = getCatalogBadge(product.catalogs || product.catalog);


  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      withBorder
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/products/${product.uuid}`)}
    >
      <Stack gap="sm">
        {/* Header with Logo, Name and Catalog Badge */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start" style={{ flex: 1 }}>
            {product.listingLogo?.url && (
              <Image
                src={product.listingLogo.url}
                alt={product.name}
                width={48}
                height={48}
                fit="contain"
                style={{ flexShrink: 0 }}
              />
            )}
            <Text fw={600} size="md" style={{ flex: 1 }}>
              {product.name}
            </Text>
          </Group>
          <Badge color={catalogBadge.color}>{catalogBadge.label}</Badge>
        </Group>

        {/* UUID - Always Visible */}
        <Group gap="xs">
          <Text size="xs" fw={500} c="dimmed">
            UUID:
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {product.uuid || product.id}
          </Text>
          <Tooltip label="Click to view full product details" withArrow>
            <ActionIcon variant="transparent" size="xs" color="gray">
              <IconInfoCircle size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Divider />

        {/* Company Name */}
        {companyName && (
          <Text size="sm" c="dimmed">
            Company: <Text span fw={500} c="dark">{companyName}</Text>
          </Text>
        )}

        {/* Description */}
        {product.description && (
          <Text size="sm" lineClamp={2} c="dimmed">
            {product.description}
          </Text>
        )}

        {/* Product Type, Status and Created Date */}
        <Group gap="md" wrap="wrap">
          {product.type && (
            <Tooltip label="Product type" withArrow>
              <Badge variant="outline" size="sm">
                {product.type}
              </Badge>
            </Tooltip>
          )}
          
          <Tooltip label="Product status" withArrow>
            <Badge
              variant="light"
              color={getProductStatusColor(product.version)}
            >
              Status: {formatProductStatus(product.version)}
            </Badge>
          </Tooltip>
          
          {product.createdAt && (
            <Tooltip label="Product creation date" withArrow>
              <Group gap={4}>
                <IconCalendar size={14} />
                <Text size="xs" c="dimmed">
                  Created: {formatDate(product.createdAt)}
                </Text>
              </Group>
            </Tooltip>
          )}

          {product.lastPublishedDate && (
            <Tooltip label="Last published date" withArrow>
              <Group gap={4}>
                <IconCalendar size={14} />
                <Text size="xs" c="dimmed">
                  Published: {formatDate(product.lastPublishedDate)}
                </Text>
              </Group>
            </Tooltip>
          )}
        </Group>


        {/* Publisher Info */}
        {product.publisher && (
          <Text size="xs" c="dimmed">
            Publisher: {formatPublisher(product.publisher)}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default ProductCard;

