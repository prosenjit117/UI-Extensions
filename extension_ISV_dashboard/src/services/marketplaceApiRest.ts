/**
 * REST API alternative for fetching marketplace data
 * Use this if GraphQL doesn't support the queries we need
 */

interface Company {
  id: string;
  uuid: string;
  name: string;
  createdDate?: string;
}

interface Product {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  status?: string;
  lastPublishedDate?: string;
  publisher?: {
    id: string;
    name?: string;
    email?: string;
  };
  catalog?: string;
  catalogs?: string[];
}

/**
 * Try REST API endpoint for companies
 * Common AppDirect REST endpoints:
 * - /api/marketplace/v1/companies
 * - /api/v1/marketplace/companies
 * - /api/internal/marketplace/v1/companies
 */
export async function fetchDeveloperCompaniesRest(): Promise<{
  companies: Company[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  const baseUrl = window.location.origin;
  const possibleEndpoints = [
    `${baseUrl}/api/marketplace/v1/companies?role=DEVELOPER`,
    `${baseUrl}/api/v1/marketplace/companies?role=DEVELOPER`,
    `${baseUrl}/api/internal/marketplace/v1/companies?role=DEVELOPER`,
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response structures
        let companies: Company[] = [];
        if (Array.isArray(data)) {
          companies = data;
        } else if (data.items || data.companies) {
          companies = data.items || data.companies || [];
        } else if (data.edges) {
          companies = data.edges.map((edge: any) => edge.node || edge);
        }

        // Filter for DEVELOPER role if not already filtered
        if (companies.length > 0) {
          companies = companies.filter((company: any) => 
            company.role === "DEVELOPER" || 
            company.roles?.includes("DEVELOPER") ||
            company.roles?.includes("ROLE_DEVELOPER")
          );
        }

        return {
          companies,
          pageInfo: {
            hasNextPage: data.pageInfo?.hasNextPage || false,
            endCursor: data.pageInfo?.endCursor || null,
          },
        };
      }
    } catch (error) {
      continue;
    }
  }

  throw new Error(
    "Unable to fetch companies via REST API. " +
    "Please check your marketplace REST API documentation for the correct endpoint."
  );
}

export type { Company, Product };

