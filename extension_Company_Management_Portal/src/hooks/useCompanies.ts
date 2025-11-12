import { useQuery, UseQueryResult } from "@tanstack/react-query";

// REST API response structure
interface CompanyAddress {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Company {
  uuid: string;
  companyId: number;
  name: string;
  externalId?: string | null;
  partner: string;
  enabled: boolean;
  allowLogin: boolean;
  address?: CompanyAddress | null;
  companySize?: string | null;
  creationDate: number;
  emailAddress?: string | null;
  website?: string | null;
  phoneNumber?: string | null;
  status: string;
  vendor: boolean;
  reseller: boolean;
  channelAdmin: boolean;
  countryCode?: string;
  [key: string]: any;
}

export interface PaginationInfo {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

interface CompaniesResponse {
  links: any[];
  content: Company[];
  page: PaginationInfo;
}

interface CompaniesData {
  companies: Company[];
  pagination: PaginationInfo;
}

const fetchCompanies = async (page: number = 0, size: number = 20): Promise<CompaniesData> => {
  const response = await fetch(`/api/account/v2/companies?page=${page}&size=${size}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.statusText}`);
  }

  const data: CompaniesResponse = await response.json();
  return {
    companies: data.content || [],
    pagination: data.page,
  };
};

const useCompanies = (page: number = 0, size: number = 20): UseQueryResult<CompaniesData, Error> =>
  useQuery({
    queryKey: ["companies", page, size],
    queryFn: () => fetchCompanies(page, size),
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });

export default useCompanies;
export type { CompaniesResponse, CompaniesData };

