import { useQueries } from "@tanstack/react-query";
import { fetchAllCompanyProducts } from "../services/marketplaceApi";
import type { Company, Product } from "../services/marketplaceApi";

export function useAllProducts(companies: Company[]) {
  const queries = useQueries({
    queries: companies.map((company) => ({
      queryKey: ["companyProducts", company.uuid],
      queryFn: () => fetchAllCompanyProducts(company.uuid),
    })),
  });

  const allProducts: Array<Product & { companyUuid: string; companyName: string }> =
    [];
  const loading = queries.some((query) => query.isLoading);
  const error = queries.find((query) => query.error)?.error;

  queries.forEach((query, index) => {
    if (query.data) {
      const company = companies[index];
      allProducts.push(
        ...query.data.map((product) => ({
          ...product,
          companyUuid: company.uuid,
          companyName: company.name,
        }))
      );
    }
  });

  return { allProducts, loading, error };
}

