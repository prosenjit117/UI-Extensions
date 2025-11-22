import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, Badge, Text } from "@mantine/core";
import { formatDate, formatPublisher, getCatalogBadge, truncateText, formatProductStatus, getProductStatusColor } from "../../utils/formatters";
import type { Product } from "../../services/marketplaceApi";
import type { Company } from "../../services/marketplaceApi";

interface ProductTableProps {
  products: Array<Product & { companyUuid?: string; companyName?: string }>;
  companies: Company[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products, companies }) => {
  const navigate = useNavigate();

  const companyMap = companies.reduce<Record<string, string>>((map, company) => {
    map[company.uuid] = company.name;
    return map;
  }, {});

  const rows = products.map((product) => {
    const companyName = product.companyName || companyMap[product.companyUuid || ""] || "Unknown";
    const catalogBadge = getCatalogBadge(product.catalogs || product.catalog);

    return (
      <Table.Tr
        key={product.uuid}
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/products/${product.uuid}`)}
      >
        <Table.Td>{companyName}</Table.Td>
        <Table.Td>
          <Text fw={600}>{product.name}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" lineClamp={2}>
            {truncateText(product.description || "", 100)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={getProductStatusColor(product.version)}>
            {formatProductStatus(product.version)}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color={catalogBadge.color}>{catalogBadge.label}</Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{formatDate(product.lastPublishedDate)}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{formatPublisher(product.publisher)}</Text>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table highlightOnHover striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Company</Table.Th>
          <Table.Th>Product Name</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Catalog</Table.Th>
          <Table.Th>Last Published</Table.Th>
          <Table.Th>Publisher</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default ProductTable;

