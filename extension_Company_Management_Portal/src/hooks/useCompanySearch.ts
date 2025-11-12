import { useQuery, UseQueryResult } from "@tanstack/react-query";
// eslint-disable-next-line import/no-unresolved
import { request, gql } from "graphql-request";
import { Company } from "./useCompanies";
import companyApi from "../functions/companyApi";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEARCH_COMPANY_BY_EXTERNAL_ID = gql`
  query SearchCompanyByExternalId($externalId: String!) {
    accountByExternalId(externalId: $externalId) {
      name
      id
      externalId
      idpId
      status
      tenant
      website
      vanityUrl
      thirtyDaysPurchaseLimitOverrideAmt
      thirtyDaysPurchaseLimitExempt
      defaultRole
      dailyPurchaseLimitOverrideAmt
      dailyPurchaseLimitExempt
      customAttributes {
        key
        value
      }
      createdOn
      countryCode
      contactPhoneNumber
      contactEmail
      companySize
      accessTypes
      accountMemberships {
        nodes {
          roles
          status
          user {
            createdOn
            email
            externalId
            firstName
            id
            lastName
            memberships {
              roles
              status
            }
          }
        }
      }
    }
  }
`;

interface GraphQLAccountResponse {
  accountByExternalId: {
    name: string;
    id: string;
    externalId: string | null;
    idpId: string | null;
    status: string;
    tenant: string;
    website: string | null;
    vanityUrl: string | null;
    createdOn: string;
    countryCode: string | null;
    contactPhoneNumber: string | null;
    contactEmail: string | null;
    companySize: string | null;
    [key: string]: any;
  } | null;
}

const searchCompaniesByName = async (name: string): Promise<Company[]> => {
  try {
    const response = await fetch(`/api/account/v2/companies?page=0&size=100`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.statusText}`);
    }

    const data = await response.json();
    const companies: Company[] = data.content || [];
    
    const searchName = name.trim().toLowerCase();
    const matchingCompanies = companies.filter((company) =>
      company.name?.toLowerCase().includes(searchName)
    );

    return matchingCompanies;
  } catch (error) {
    throw error;
  }
};

const searchCompanyByUuid = async (uuid: string): Promise<Company[]> => {
  try {
    const response = await companyApi.fetchCompanyById(uuid.trim());
    
    if (!response.success || !response.data) {
      return [];
    }

    return [response.data];
  } catch (error) {
    return [];
  }
};

const searchCompanyByExternalId = async (externalId: string): Promise<Company[]> => {
  try {
    const graphQLResponse = await request<GraphQLAccountResponse>(
      "/api/graphql/preview",
      SEARCH_COMPANY_BY_EXTERNAL_ID,
      {
        externalId: externalId.trim(),
      }
    );

    const account = graphQLResponse.accountByExternalId;
    if (!account) {
      return [];
    }

    const companyUuid = account.id;
    const restApiResponse = await companyApi.fetchCompanyById(companyUuid);

    if (!restApiResponse.success || !restApiResponse.data) {
      return [];
    }

    const company: Company = restApiResponse.data;
    return [company];
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return [];
    }
    throw error;
  }
};

const searchCompanies = async (searchTerm: string): Promise<Company[]> => {
  if (!searchTerm || searchTerm.trim() === "") {
    return [];
  }

  const trimmedTerm = searchTerm.trim();

  if (UUID_REGEX.test(trimmedTerm)) {
    return searchCompanyByUuid(trimmedTerm);
  }

  if (trimmedTerm.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(trimmedTerm)) {
    try {
      const externalIdResults = await searchCompanyByExternalId(trimmedTerm);
      if (externalIdResults.length > 0) {
        return externalIdResults;
      }
    } catch (error) {
      // Fall through to name search
    }
  }

  return searchCompaniesByName(trimmedTerm);
};

const useCompanySearch = (
  searchTerm: string,
  enabled: boolean = true
): UseQueryResult<Company[], Error> =>
  useQuery({
    queryKey: ["companySearch", searchTerm],
    queryFn: () => searchCompanies(searchTerm),
    enabled: enabled && searchTerm.trim().length > 0,
    staleTime: 30000,
    cacheTime: 300000,
  });

export default useCompanySearch;

