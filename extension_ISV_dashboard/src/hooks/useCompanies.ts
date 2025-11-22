import { useQuery } from "@tanstack/react-query";
import { fetchDeveloperCompanies } from "../services/marketplaceApi";
import type { Company } from "../services/marketplaceApi";

export function useCompanies() {
  return useQuery<{
    companies: Company[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  }>({
    queryKey: ["developerCompanies"],
    queryFn: fetchDeveloperCompanies,
  });
}

