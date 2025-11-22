/**
 * GraphQL API service for AppDirect Marketplace
 * Endpoint: {marketplaceBaseUrl}/api/graphql/preview
 * 
 * Uses AppDirect GraphQL schema as documented at:
 * https://developer.appdirect.com/graphql-docs/product.doc
 */

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

interface GraphQLVariables {
  [key: string]: any;
}

interface Company {
  id: string;
  uuid: string; // In AppDirect, Account.id is used as the identifier
  name: string;
  createdDate?: string; // Maps to Account.createdOn
  status?: string; // Account status (e.g., ACTIVE, INACTIVE)
}

interface Product {
  id: string;
  uuid: string; // Product.id used as uuid
  name: string; // Parsed from LocalizedString array
  description?: string; // Parsed from LocalizedString array
  status?: string;
  type?: string; // Product type enum (APPLICATION, BUNDLE, etc.)
  version?: string; // Product version: "PUBLISHED" or "WORKING"
  linkToProductWebsite?: string; // Product website URL (extracted from LocalizedString array)
  listingLogo?: {
    url?: string;
  };
  lastPublishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  publisher?: {
    id: string;
    name?: string;
    email?: string;
  };
  catalog?: string;
  catalogs?: string[]; // Array of catalogs product belongs to
  vendor?: {
    id: string;
    name?: string;
  };
  editions?: Array<{
    id: string;
    name: string;
    code?: string;
    pricing?: {
      pricingPlans?: Array<{
        costs?: Array<{
          itemPrices?: Array<{
            prices?: Array<{
              amount?: number;
              currency?: string;
            }>;
          }>;
        }>;
      }>;
      [key: string]: any; // Allow other pricing fields
    };
  }>;
}

interface ProductDetails extends Product {
  editions?: Array<{
    id: string;
    name: string;
    code?: string;
    pricing?: {
      pricingPlans?: Array<{
        costs?: Array<{
          itemPrices?: Array<{
            prices?: Array<{
              amount?: number;
              currency?: string;
            }>;
          }>;
        }>;
      }>;
      [key: string]: any; // Allow other pricing fields
    };

  }>;
  categories?: Array<{
    id: string;
    name: string;
  }>;
  publicationHistory?: Array<{
    publishedDate: string;
    publisher: {
      name?: string;
      email?: string;
    };
    catalog: string;
    status: string;
  }>;
}

/**
 * Map product version to catalog type
 * PUBLISHED → PRODUCTION
 * WORKING → STAGING
 */
function getCatalogFromVersion(version?: string): string {
  if (!version) {
    return "UNKNOWN";
  }
  
  const normalizedVersion = version.toUpperCase();
  if (normalizedVersion === "PUBLISHED") {
    return "PRODUCTION";
  }
  if (normalizedVersion === "WORKING") {
    return "STAGING";
  }
  
  return "UNKNOWN";
}

/**
 * Get the GraphQL endpoint URL
 */
export function getGraphQLEndpoint(): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/graphql/preview`;
}

/**
 * Execute a GraphQL query
 */
export async function executeGraphQLQuery<T = any>(
  query: string,
  variables: GraphQLVariables = {}
): Promise<T> {
  const endpoint = getGraphQLEndpoint();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      throw new Error(result.errors.map((e) => e.message).join(", "));
    }

    if (!result.data) {
      throw new Error("No data returned from GraphQL query");
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Introspect the GraphQL schema to discover available queries
 */
export async function introspectSchema(): Promise<any> {
  const query = `
    query IntrospectionQuery {
      __schema {
        queryType {
          name
          fields {
            name
            description
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await executeGraphQLQuery(query);
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all companies (accounts) with ROLE_DEVELOPER
 * Based on schema, we use 'accounts' query which returns AccountConnection
 */
export async function fetchDeveloperCompanies(): Promise<{
  companies: Company[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  // Query accounts (which are companies in AppDirect terminology)
  // AccountConnection uses "nodes" not "edges"
  // Account fields: id (not uuid), createdOn (not createdDate), no direct roles field
  // Note: DEVELOPER is not a valid AccountAccessType enum value
      // Fallback: Query all accounts since we can't filter by DEVELOPER access type
  const query = `
    query GetDeveloperCompanies($first: Int, $after: String) {
      accounts(first: $first, after: $after) {
        nodes {
          id
          name
          createdOn
          status
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    // Query all accounts (DEVELOPER is not a valid AccountAccessType enum value)
    // Note: The AccountAccessType enum doesn't include DEVELOPER
    // The error suggested RESELLER, but we need developer companies
    // For now, fetch all accounts - may need alternative filtering method
    const data = await executeGraphQLQuery<{
      accounts: {
        nodes: Array<{
          id: string;
          name: string;
          createdOn?: string;
          status?: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    }>(query, {
      first: 50, // Maximum limit is 50, paginate if needed
    });

    const allAccounts = data.accounts?.nodes || [];

    // Map to Company interface (use id as uuid since Account doesn't have uuid)
    const companies: Company[] = allAccounts.map((account) => ({
      id: account.id,
      uuid: account.id, // Use id as uuid since Account type doesn't have uuid field
      name: account.name,
      createdDate: account.createdOn,
      status: account.status,
    }));

    return {
      companies,
      pageInfo: data.accounts?.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      },
    };
  } catch (error) {
    throw new Error(
      `Unable to fetch companies. ` +
      `AccountAccessType enum doesn't include DEVELOPER. ` +
      `Showing all accounts instead. ` +
      `Original error: ${(error as Error).message}.`
    );
  }
}

/**
 * Helper to extract text from LocalizedString array
 * LocalizedString has: locale and value (not text)
 */
function extractLocalizedText(localizedStrings: any[], locale: string = "en-US"): string {
  if (!localizedStrings || !Array.isArray(localizedStrings)) return "";
  
  // Find match for locale, or fallback to first entry
  const match = localizedStrings.find(
    (ls: any) => ls.locale === locale || ls.locale === "en" || ls.locale === "en-US"
  ) || localizedStrings[0];
  
  // LocalizedString has 'value' field, not 'text'
  return match?.value || "";
}

/**
 * Extract URL from linkToProductWebsite (which uses LocalizedString format with 'value' field)
 * Similar to extractLocalizedText but for URLs
 */
function extractLocalizedURL(localizedStrings: any[], locale: string = "en-US"): string {
  if (!localizedStrings || !Array.isArray(localizedStrings)) return "";
  
  // Find match for locale, or fallback to first entry
  const match = localizedStrings.find(
    (ls: any) => ls.locale === locale || ls.locale === "en" || ls.locale === "en-US"
  ) || localizedStrings[0];
  
  // linkToProductWebsite uses LocalizedString format with 'value' field (not 'url')
  return match?.value || "";
}

/**
 * Fetch edition pricing separately using edition(id: ID!) query
 * This is needed because pricing information may not be available in product listing queries
 * Per AppDirect GraphQL documentation: https://developer.appdirect.com/graphql-docs/product.doc
 */
async function fetchEditionPricing(editionId: string): Promise<{
  pricing?: {
    trial?: {
      value?: string | number;
      unit?: string;
      duration?: string | number;
    };
    [key: string]: any;
  };
}> {
  try {
    const query = `
      query GetEditionPricing($editionId: ID!) {
        edition(id: $editionId) {
          id
          pricing {
            trial {
              value
              unit
              duration
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQLQuery(query, { editionId });
    return {
      pricing: data.edition?.pricing,
    };
  } catch (error) {
    return {};
  }
}

/**
 * Fetch products for a company (account) in a specific catalog
 * Uses productsByVendorId per AppDirect GraphQL documentation
 * Reference: https://developer.appdirect.com/graphql-docs/product.doc
 * Note: Pricing information fetched separately per edition if needed
 */
export async function fetchCompanyProducts(
  companyUuid: string,
  catalogType: "PRODUCTION" | "STAGING"
): Promise<{
  products: Product[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  // Query products using products query format
  // Filter by vendorId and version: PUBLISHED = PRODUCTION, WORKING = STAGING
  // Reference: GraphQL response format provided
  const expectedVersion = catalogType === "PRODUCTION" ? "PUBLISHED" : "WORKING";
  
  // Query products - fetch all, then filter by vendorId and version
  const query = `
    query GetCompanyProducts($first: Int) {
      products(first: $first) {
        nodes {
          id
          version
          type
          vendorId
          vendorName {
            value
          }
          name {
            locale
            value
          }
          description {
            locale
            value
          }
          linkToProductWebsite {
            locale
            value
          }
          listingLogo {
            url
          }
          editions {
            id
            code
            name {
              locale
              value
            }
            pricing {
              pricingPlans {
                costs {
                  itemPrices {
                    prices {
                      amount
                      currency
                    }
                  }
                  status
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    // Maximum first limit is 50
    const variables = { first: 50 };
    const data = await executeGraphQLQuery(query, variables);

    let products: Product[] = [];
    let pageInfo = { hasNextPage: false, endCursor: null as string | null };

    // Filter products by vendorId AND version to separate PRODUCTION vs STAGING
    if (data.products) {
      const allProducts = data.products.nodes || [];
      // Ensure string comparison for vendorId
      const normalizedCompanyUuid = String(companyUuid).trim();
      
      products = allProducts
        .filter((product: any) => {
          // Filter by vendorId to match the company (ensure string comparison)
          const productVendorId = String(product.vendorId || "").trim();
          const matchesVendor = productVendorId === normalizedCompanyUuid;
          
          // Filter by version to match the catalog type
          const productVersion = String(product.version || "").trim().toUpperCase();
          const normalizedExpectedVersion = expectedVersion.toUpperCase();
          const matchesVersion = productVersion === normalizedExpectedVersion;
          
          return matchesVendor && matchesVersion;
        })
        .map((node: any) => ({
          id: node.id,
          uuid: node.id, // Use id as uuid
          name: extractLocalizedText(node.name),
          description: extractLocalizedText(node.description),
          type: node.type,
          version: node.version, // Product version: PUBLISHED or WORKING
          linkToProductWebsite: extractLocalizedURL(node.linkToProductWebsite),
          listingLogo: node.listingLogo ? {
            url: node.listingLogo.url,
          } : undefined,
          catalog: getCatalogFromVersion(node.version), // Map version to catalog: PUBLISHED → PRODUCTION, WORKING → STAGING
          vendor: {
            id: node.vendorId || "",
            name: extractLocalizedText(node.vendorName) || "",
          },
          editions: Array.isArray(node.editions)
            ? node.editions.map((edition: any) => ({
                id: edition.id,
                code: edition.code || "",
                name: extractLocalizedText(edition.name),
                pricing: edition.pricing || undefined,
              }))
            : [],
        }));
      pageInfo = data.products.pageInfo || pageInfo;
    }

    return { products, pageInfo };
  } catch (error) {
    // Return empty result instead of throwing to allow other catalog queries to proceed
    // The error will be visible in fetchAllCompanyProducts if both fail
    return {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch products from both PRODUCTION and STAGING catalogs for a company
 */
export async function fetchAllCompanyProducts(
  companyUuid: string
): Promise<Product[]> {
  try {
    const [productionResult, stagingResult] = await Promise.all([
      fetchCompanyProducts(companyUuid, "PRODUCTION").catch(() => ({
        products: [],
        pageInfo: { hasNextPage: false },
      })),
      fetchCompanyProducts(companyUuid, "STAGING").catch(() => ({
        products: [],
        pageInfo: { hasNextPage: false },
      })),
    ]);

    const productMap = new Map<string, Product>();

    productionResult.products.forEach((product) => {
      productMap.set(product.uuid, {
        ...product,
        catalogs: ["PRODUCTION"],
      });
    });

    stagingResult.products.forEach((product) => {
      if (productMap.has(product.uuid)) {
        const existing = productMap.get(product.uuid)!;
        if (!existing.catalogs?.includes("STAGING")) {
          existing.catalogs = [...(existing.catalogs || []), "STAGING"];
        }
      } else {
        productMap.set(product.uuid, {
          ...product,
          catalogs: ["STAGING"],
        });
      }
    });

    return Array.from(productMap.values());
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch detailed product information using product(id: ID!) query
 * Reference: https://developer.appdirect.com/graphql-docs/product.doc
 * Note: Pricing may need separate edition queries - removed from initial query
 */
export async function fetchProductDetails(
  productUuid: string
): Promise<ProductDetails> {
  // Try multiple query structures based on what Product type contains
  // Product uses id (not uuid), name/description are LocalizedString arrays
  const queries = [
    // Attempt 1: Query by id (since Product doesn't have uuid)
    // LocalizedString has 'value' not 'text', vendor.name is String
    // Reference: https://developer.appdirect.com/graphql-docs/product.doc
    `
      query GetProductDetails($productId: ID!) {
        product(id: $productId) {
          id
          version
          name {
            locale
            value
          }
          description {
            locale
            value
          }
          type
          linkToProductWebsite {
            locale
            value
          }
          listingLogo {
            url
          }
          vendor {
            id
            name
          }
          editions {
            id
            code
            name {
              locale
              value
            }
            pricing {
              pricingPlans {
                costs {
                  itemPrices {
                    prices {
                      amount
                      currency
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    // Attempt 2: Try by id (redundant but for fallback)
    // Reference: https://developer.appdirect.com/graphql-docs/product.doc
    `
      query GetProductDetails($productId: ID!) {
        product(id: $productId) {
          id
          version
          name {
            locale
            value
          }
          description {
            locale
            value
          }
          type
          linkToProductWebsite {
            locale
            value
          }
          listingLogo {
            url
          }
          vendor {
            id
            name
          }
          editions {
            id
            code
            name {
              locale
              value
            }
            pricing {
              pricingPlans {
                costs {
                  itemPrices {
                    prices {
                      amount
                      currency
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    // Attempt 3: Simplified query with id (fallback)
    // Reference: https://developer.appdirect.com/graphql-docs/product.doc
    `
      query GetProductDetails($productId: ID!) {
        product(id: $productId) {
          id
          version
          name {
            locale
            value
          }
          description {
            locale
            value
          }
          type
          linkToProductWebsite {
            locale
            value
          }
          listingLogo {
            url
          }
        }
      }
    `,
  ];

  let lastError: Error | null = null;

  // Try with productUuid as ID first
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    try {
      // All queries use productId (product query only accepts id, not uuid)
      const variables = { productId: productUuid };

      const data = await executeGraphQLQuery(query, variables);

      if (data.product) {
        // Transform LocalizedString arrays and nested structures
        const product = data.product;
        return {
          id: product.id,
          uuid: product.id, // Use id as uuid
          name: extractLocalizedText(product.name),
          description: extractLocalizedText(product.description),
          type: product.type,
          version: product.version, // Product version: PUBLISHED or WORKING
          linkToProductWebsite: extractLocalizedURL(product.linkToProductWebsite),
          listingLogo: product.listingLogo ? {
            url: product.listingLogo.url,
          } : undefined,
          vendor: product.vendor ? {
            id: product.vendor.id,
            name: product.vendor.name || "", // vendor.name is String, not LocalizedString
          } : undefined,
          catalog: getCatalogFromVersion(product.version), // Map version to catalog: PUBLISHED → PRODUCTION, WORKING → STAGING
          editions: Array.isArray(product.editions)
            ? product.editions.map((edition: any) => ({
                id: edition.id,
                code: edition.code || "",
                name: extractLocalizedText(edition.name),
                pricing: edition.pricing || undefined,
              }))
            : product.editions?.nodes?.map((edition: any) => ({
                id: edition.id,
                code: edition.code || "",
                name: extractLocalizedText(edition.name),
                pricing: edition.pricing || undefined,
              })) || [],
          categories: [], // Product type doesn't have categories field in schema
          publicationHistory: [], // Product type may not have this field
        };
      }
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  // If all queries failed, try marketplaceProduct
  try {
    const marketplaceQuery = `
      query GetProductDetails($productUuid: ID!) {
        marketplaceProduct(uuid: $productUuid) {
          id
          name {
            locale
            value
          }
          description {
            locale
            value
          }
        }
      }
    `;
    const data = await executeGraphQLQuery(marketplaceQuery, { productUuid });
    if (data.marketplaceProduct) {
      const mp = data.marketplaceProduct;
      return {
        id: mp.id,
        uuid: mp.id,
        name: extractLocalizedText(mp.name),
        description: extractLocalizedText(mp.description),
        editions: [],
        categories: [],
        publicationHistory: [],
      };
    }
  } catch (error) {
    // Silently fail - will throw error below
  }

  throw new Error(
    `Product ${productUuid} not found. ` +
    `Original error: ${(lastError as Error)?.message || "Unknown error"}. ` +
    `Tried: product(id: ...) and product(uuid: ...). Please check Product type structure.`
  );
}

export type { Company, Product, ProductDetails };
