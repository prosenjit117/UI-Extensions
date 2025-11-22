import { useQuery } from "@tanstack/react-query";
import { fetchAllCompanyProducts } from "../services/marketplaceApi";
import type { Product } from "../services/marketplaceApi";

export function useProducts(companyUuid: string | undefined) {
  return useQuery<Product[]>({
    queryKey: ["companyProducts", companyUuid],
    queryFn: () => fetchAllCompanyProducts(companyUuid!),
    enabled: !!companyUuid,
  });
}

